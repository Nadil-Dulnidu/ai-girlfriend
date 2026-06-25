import threading
from collections.abc import AsyncGenerator

import torch
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from transformers import TextIteratorStreamer

from app.config.config_loader import get_config_value
from app.config.logging import get_logger
from app.model import build_prompt
from app.schemas import GenerateRequest

logger = get_logger(__name__)
router = APIRouter()


async def event_stream(
    model: torch.nn.Module,
    tokenizer: object,
    prompt: str,
    max_new_tokens: int,
    temperature: float,
    top_p: float,
    repetition_penalty: float,
) -> AsyncGenerator[str, None]:
    """Generate SSE events by streaming tokens from the model."""
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    streamer = TextIteratorStreamer(
        tokenizer,
        skip_prompt=True,
        skip_special_tokens=True,
    )

    generation_kwargs = {
        **inputs,
        "max_new_tokens": max_new_tokens,
        "temperature": temperature,
        "top_p": top_p,
        "repetition_penalty": repetition_penalty,
        "do_sample": True,
        "streamer": streamer,
    }

    thread = threading.Thread(
        target=_generate_in_thread,
        args=(model, generation_kwargs),
    )
    thread.start()

    token_count = 0
    for token in streamer:
        if token:
            token_count += 1
            yield f"data: {token}\n\n"

    yield "data: [DONE]\n\n"
    thread.join()

    logger.info(f"Stream complete: {token_count} tokens streamed")


@torch.no_grad()
def _generate_in_thread(model: torch.nn.Module, kwargs: dict) -> None:
    """Run model.generate in a background thread."""
    model.generate(**kwargs)


@router.post("/generate/stream")
async def generate_stream(request: Request, body: GenerateRequest) -> StreamingResponse:
    """Stream generated tokens as Server-Sent Events."""
    model = request.app.state.model
    tokenizer = request.app.state.tokenizer
    system_prompt = request.app.state.system_prompt

    max_new_tokens: int = get_config_value("generation", "max_new_tokens", default=256)
    temperature: float = get_config_value("generation", "temperature", default=0.7)
    top_p: float = get_config_value("generation", "top_p", default=0.9)
    repetition_penalty: float = get_config_value("generation", "repetition_penalty", default=1.1)

    logger.info(f"Received stream request: message='{body.message[:50]}...'")

    prompt = build_prompt(system_prompt, body.message)

    return StreamingResponse(
        event_stream(
            model=model,
            tokenizer=tokenizer,
            prompt=prompt,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_p=top_p,
            repetition_penalty=repetition_penalty,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
