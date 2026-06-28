from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.config_loader import get_config_value
from app.config.logging import get_logger
from app.model import load_model
from app.routes.generate import router as generate_router
from app.routes.openai_compat import router as openai_router
from app.routes.stream import router as stream_router
from app.schemas import HealthResponse

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Load the model on startup and clean up on shutdown."""
    model_id: str = get_config_value("model", "model_id", default="nadil-dulnidu/ai-girlfriend-Qwen3-finetuned-model")
    system_prompt: str = get_config_value("model", "system_prompt", default="You are a helpful and caring AI girlfriend.")

    logger.info(f"Starting server — loading model: {model_id}")
    model, tokenizer = load_model(model_id)

    device = str(model.device) if hasattr(model, "device") else "auto"
    dtype = str(model.dtype).replace("torch.", "")

    app.state.model = model
    app.state.tokenizer = tokenizer
    app.state.system_prompt = system_prompt
    app.state.model_id = model_id
    app.state.device = device
    app.state.dtype = dtype

    logger.info(f"Model ready — device={device}, dtype={dtype}")

    yield

    del app.state.model
    del app.state.tokenizer
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    logger.info("Model unloaded, server shutting down")


app = FastAPI(
    title="Qwen3 Inference Server",
    description="Production-ready inference server for a fine-tuned Qwen3 model",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins: list[str] = get_config_value("cors", "allowed_origins", default=["*"])
allow_credentials: bool = get_config_value("cors", "allow_credentials", default=True)
allow_methods: list[str] = get_config_value("cors", "allow_methods", default=["*"])
allow_headers: list[str] = get_config_value("cors", "allow_headers", default=["*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=allow_methods,
    allow_headers=allow_headers,
)

app.include_router(generate_router)
app.include_router(stream_router)
app.include_router(openai_router, prefix="/v1")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Return server health status and model info."""
    return HealthResponse(
        status="ok",
        device=app.state.device,
        model_id=app.state.model_id,
        dtype=app.state.dtype,
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: object, exc: Exception) -> JSONResponse:
    """Catch unhandled exceptions and return a 500 response."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )
