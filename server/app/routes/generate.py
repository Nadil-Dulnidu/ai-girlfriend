from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.config.config_loader import get_config_value
from app.config.logging import get_logger
from app.model import build_prompt, generate_response
from app.schemas import GenerateRequest, GenerateResponse

logger = get_logger(__name__)
router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: Request, body: GenerateRequest) -> GenerateResponse:
    """Generate a complete response from the model."""
    model = request.app.state.model
    tokenizer = request.app.state.tokenizer
    system_prompt = request.app.state.system_prompt

    max_new_tokens: int = get_config_value("generation", "max_new_tokens", default=256)
    temperature: float = get_config_value("generation", "temperature", default=0.7)
    top_p: float = get_config_value("generation", "top_p", default=0.9)
    repetition_penalty: float = get_config_value("generation", "repetition_penalty", default=1.1)

    logger.info(f"Received generate request: message='{body.message[:50]}...'")

    prompt = build_prompt(system_prompt, body.message, tokenizer)

    try:
        response_text, tokens_generated = generate_response(
            model=model,
            tokenizer=tokenizer,
            prompt=prompt,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_p=top_p,
            repetition_penalty=repetition_penalty,
        )
    except Exception as e:
        logger.error(f"Generation failed: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": f"Generation failed: {str(e)}"},
        )

    logger.info(f"Generation complete: {tokens_generated} tokens produced")
    return GenerateResponse(response=response_text, tokens_generated=tokens_generated)
