import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, PreTrainedModel, PreTrainedTokenizer

from app.config.logging import get_logger

logger = get_logger(__name__)


def load_model(model_id: str) -> tuple[PreTrainedModel, PreTrainedTokenizer]:
    """Load the model and tokenizer from HuggingFace.

    Returns a tuple of (model, tokenizer) loaded with appropriate dtype and device mapping.
    """
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    logger.info(f"Loading model '{model_id}' with dtype={dtype}")

    tokenizer = AutoTokenizer.from_pretrained(model_id)
    logger.info("Tokenizer loaded successfully")

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=dtype,
        device_map="auto",
    )
    model.eval()

    device = str(model.device) if hasattr(model, "device") else "auto"
    logger.info(f"Model loaded on device={device}, dtype={dtype}")

    return model, tokenizer


def build_prompt(system_prompt: str, user_message: str) -> str:
    """Build a chat prompt using the TinyLlama chat template."""
    return (
        f"<|system|>\n{system_prompt}</s>\n"
        f"<|user|>\n{user_message}</s>\n"
        f"<|assistant|>\n"
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
