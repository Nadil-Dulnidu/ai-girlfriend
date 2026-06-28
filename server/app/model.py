from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, PreTrainedModel, PreTrainedTokenizer

from app.config.logging import get_logger

logger = get_logger(__name__)

# Local model directory at server/model/
LOCAL_MODEL_DIR = Path(__file__).resolve().parent.parent / "model"


def load_model(model_id: str) -> tuple[PreTrainedModel, PreTrainedTokenizer]:
    """Load the model and tokenizer, using local cache when available.

    On first run, downloads from HuggingFace and saves to the local `model/` directory.
    On subsequent runs, loads directly from the local directory for faster startup.

    Returns a tuple of (model, tokenizer) loaded with appropriate dtype and device mapping.
    """
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    local_path = LOCAL_MODEL_DIR

    # Determine whether to load from local cache or HuggingFace
    if local_path.exists() and any(local_path.iterdir()):
        source = str(local_path)
        logger.info(f"Loading model from local cache: {source}")
    else:
        source = model_id
        logger.info(f"Local cache not found. Downloading model '{model_id}' from HuggingFace...")

    tokenizer = AutoTokenizer.from_pretrained(source)
    logger.info("Tokenizer loaded successfully")

    model = AutoModelForCausalLM.from_pretrained(
        source,
        torch_dtype=dtype,
        device_map="auto",
    )
    model.eval()

    # Save locally if we downloaded from HuggingFace
    if source == model_id:
        local_path.mkdir(parents=True, exist_ok=True)
        model.save_pretrained(local_path)
        tokenizer.save_pretrained(local_path)
        logger.info(f"Model saved to local cache: {local_path}")

    device = str(model.device) if hasattr(model, "device") else "auto"
    logger.info(f"Model loaded on device={device}, dtype={dtype}")

    return model, tokenizer


def build_prompt(system_prompt: str, user_message: str, tokenizer: PreTrainedTokenizer) -> str:
    """Build a chat prompt using the model's chat template."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]
    return tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=False,
    )


@torch.no_grad()
def generate_response(
    model: PreTrainedModel,
    tokenizer: PreTrainedTokenizer,
    prompt: str,
    max_new_tokens: int = 256,
    temperature: float = 0.7,
    top_p: float = 0.9,
    repetition_penalty: float = 1.1,
) -> tuple[str, int]:
    """Generate a response from the model.

    Returns a tuple of (generated_text, tokens_generated).
    """
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    input_length = inputs["input_ids"].shape[1]

    logger.debug(
        f"Generating with max_new_tokens={max_new_tokens}, "
        f"temperature={temperature}, top_p={top_p}, "
        f"repetition_penalty={repetition_penalty}"
    )

    outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        temperature=temperature,
        top_p=top_p,
        repetition_penalty=repetition_penalty,
        do_sample=True,
    )

    new_tokens = outputs[0][input_length:]
    tokens_generated = len(new_tokens)
    response_text = tokenizer.decode(new_tokens, skip_special_tokens=True)

    logger.info(f"Generated {tokens_generated} tokens")

    return response_text, tokens_generated
