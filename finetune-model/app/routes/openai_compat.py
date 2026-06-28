import json
import threading
import time
import uuid
from collections.abc import AsyncGenerator

import torch
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import TextIteratorStreamer

from app.config.config_loader import get_config_value
from app.config.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()

MODEL_NAME = "qwen3-finetuned"


# ─── Request / Response Schemas ───────────────────────────────────────────────


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model: str = MODEL_NAME
    messages: list[ChatMessage]
    stream: bool = False
    max_tokens: int | None = None
    temperature: float | None = None
    top_p: float | None = None


class UsageInfo(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class ChoiceMessage(BaseModel):
    role: str = "assistant"
    content: str


class Choice(BaseModel):
    index: int = 0
    message: ChoiceMessage
    finish_reason: str = "stop"


class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str = MODEL_NAME
    choices: list[Choice]
    usage: UsageInfo


# ─── Helpers ──────────────────────────────────────────────────────────────────


def _generate_completion_id() -> str:
    return f"chatcmpl-{uuid.uuid4().hex[:24]}"


def _build_prompt_from_messages(
    messages: list[ChatMessage],
    tokenizer: object,
    default_system_prompt: str,
) -> str:
    """Convert OpenAI-style messages to a prompt using the tokenizer's chat template."""
    chat_messages: list[dict[str, str]] = []

    has_system = any(m.role == "system" for m in messages)
    if not has_system:
        chat_messages.append({"role": "system", "content": default_system_prompt})

    for m in messages:
        chat_messages.append({"role": m.role, "content": m.content})

    return tokenizer.apply_chat_template(
        chat_messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=False,
    )


@torch.no_grad()
def _generate_in_thread(model: torch.nn.Module, kwargs: dict) -> None:
    """Run model.generate in a background thread."""
    model.generate(**kwargs)


# ─── Non-Streaming Generation ────────────────────────────────────────────────


@torch.no_grad()
def _generate_non_streaming(
    model: torch.nn.Module,
    tokenizer: object,
    prompt: str,
    max_tokens: int,
    temperature: float,
    top_p: float,
    repetition_penalty: float,
) -> tuple[str, int, int]:
    """Generate a full response. Returns (text, prompt_tokens, completion_tokens)."""
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    prompt_tokens: int = inputs["input_ids"].shape[-1]

    outputs = model.generate(
        **inputs,
        max_new_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        repetition_penalty=repetition_penalty,
        do_sample=True,
    )

    new_tokens = outputs[0][prompt_tokens:]
    completion_tokens = len(new_tokens)
    response_text = tokenizer.decode(new_tokens, skip_special_tokens=True)

    return response_text, prompt_tokens, completion_tokens


# ─── Streaming Generation ────────────────────────────────────────────────────


async def _stream_tokens(
    model: torch.nn.Module,
    tokenizer: object,
    prompt: str,
    max_tokens: int,
    temperature: float,
    top_p: float,
    repetition_penalty: float,
    completion_id: str,
    created: int,
) -> AsyncGenerator[str, None]:
    """Yield SSE chunks in OpenAI streaming format."""
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    streamer = TextIteratorStreamer(
        tokenizer,
        skip_prompt=True,
        skip_special_tokens=True,
    )

    generation_kwargs = {
        **inputs,
        "max_new_tokens": max_tokens,
        "temperature": temperature,
        "top_p": top_p,
        "repetition_penalty": repetition_penalty,
        "do_sample": True,
        "streamer": streamer,
    }

    thread = threading.Thread(target=_generate_in_thread, args=(model, generation_kwargs))
    thread.start()

    for token in streamer:
        if token:
            chunk = {
                "id": completion_id,
                "object": "chat.completion.chunk",
                "created": created,
                "model": MODEL_NAME,
                "choices": [
                    {
                        "index": 0,
                        "delta": {"content": token},
                        "finish_reason": None,
                    }
                ],
            }
            yield f"data: {json.dumps(chunk)}\n\n"

    final_chunk = {
        "id": completion_id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": MODEL_NAME,
        "choices": [
            {
                "index": 0,
                "delta": {},
                "finish_reason": "stop",
            }
        ],
    }
    yield f"data: {json.dumps(final_chunk)}\n\n"
    yield "data: [DONE]\n\n"

    thread.join()


# ─── Endpoint ─────────────────────────────────────────────────────────────────


@router.post("/chat/completions")
async def chat_completions(request: Request, body: ChatCompletionRequest):
    """OpenAI-compatible chat completions endpoint."""
    if not body.messages:
        raise HTTPException(status_code=422, detail="messages array must not be empty")

    model = request.app.state.model
    tokenizer = request.app.state.tokenizer
    system_prompt: str = request.app.state.system_prompt

    max_tokens: int = body.max_tokens or get_config_value("generation", "max_new_tokens", default=256)
    temperature: float = body.temperature or get_config_value("generation", "temperature", default=0.7)
    top_p: float = body.top_p or get_config_value("generation", "top_p", default=0.9)
    repetition_penalty: float = get_config_value("generation", "repetition_penalty", default=1.1)

    prompt = _build_prompt_from_messages(body.messages, tokenizer, system_prompt)
    completion_id = _generate_completion_id()
    created = int(time.time())

    logger.info(
        f"OpenAI-compat request: stream={body.stream}, "
        f"messages={len(body.messages)}, max_tokens={max_tokens}"
    )

    if body.stream:
        return StreamingResponse(
            _stream_tokens(
                model=model,
                tokenizer=tokenizer,
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                repetition_penalty=repetition_penalty,
                completion_id=completion_id,
                created=created,
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    try:
        response_text, prompt_tokens, completion_tokens = _generate_non_streaming(
            model=model,
            tokenizer=tokenizer,
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            repetition_penalty=repetition_penalty,
        )
    except Exception as e:
        logger.error(f"Generation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}") from e

    return ChatCompletionResponse(
        id=completion_id,
        created=created,
        choices=[
            Choice(message=ChoiceMessage(content=response_text)),
        ],
        usage=UsageInfo(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
        ),
    )
