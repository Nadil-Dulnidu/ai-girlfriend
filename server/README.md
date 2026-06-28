# Qwen3 Inference Server

Production-ready FastAPI inference server for the fine-tuned Qwen3 model (`nadil-dulnidu/ai-girlfriend-Qwen3-finetuned-model`).

## Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager
- GPU recommended (CUDA) but CPU works

## Installation

```bash
uv sync
```

## Configuration

All settings are managed in `config.json` at the project root:

```json
{
  "model": {
    "model_id": "nadil-dulnidu/ai-girlfriend-Qwen3-finetuned-model",
    "system_prompt": "You are a helpful and caring AI girlfriend."
  },
  "server": {
    "host": "0.0.0.0",
    "port": 8000,
    "reload": false
  },
  "generation": {
    "max_new_tokens": 256,
    "temperature": 0.7,
    "top_p": 0.9,
    "repetition_penalty": 1.1
  },
  "cors": {
    "allowed_origins": ["*"],
    "allow_credentials": true,
    "allow_methods": ["*"],
    "allow_headers": ["*"]
  },
  "logging": {
    "level": "INFO",
    "dir": "logs",
    "file": "qwen3-server.log",
    "max_bytes": 10485760,
    "backup_count": 5
  }
}
```

## Running the Server

```bash
uv run python server.py
```

Or directly via uvicorn:

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The model will be downloaded from HuggingFace on first startup. Subsequent starts use the cached model.

## API Endpoints

### GET /health

Returns server health status and model information.

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "ok",
  "device": "cuda:0",
  "model_id": "nadil-dulnidu/ai-girlfriend-Qwen3-finetuned-model",
  "dtype": "float16"
}
```

### POST /generate

Generate a complete response. Generation parameters (temperature, top_p, etc.) are controlled via `config.json`.

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you today?"}'
```

Response:
```json
{
  "response": "I'm doing great, thank you for asking! How about you?",
  "tokens_generated": 14
}
```

### POST /generate/stream

Stream tokens via Server-Sent Events (SSE). Same config-driven generation parameters.

```bash
curl -X POST http://localhost:8000/generate/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me something interesting"}'
```

Response (SSE stream):
```
data: I'm

data: doing

data: great

data: [DONE]
```

## Project Structure

```
server/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app + lifespan model loading
│   ├── model.py             # Model loading, prompt builder, inference
│   ├── schemas.py           # Pydantic request/response models
│   ├── config/
│   │   ├── __init__.py
│   │   ├── config_loader.py # JSON config singleton
│   │   └── logging.py       # OWASP-style logging setup
│   └── routes/
│       ├── __init__.py
│       ├── generate.py      # POST /generate
│       └── stream.py        # POST /generate/stream (SSE)
├── config.json              # All server configuration
├── server.py                # Entry point
├── pyproject.toml
└── README.md
```

## Performance Notes

- **GPU (recommended):** Model loads in float16 with CUDA acceleration. Inference is significantly faster.
- **CPU:** Model loads in float32. Usable for testing but slower for production workloads.
- The model is loaded once at startup and kept in memory for fast inference.
- All inference runs within `torch.no_grad()` to minimize memory usage.

## API Documentation

FastAPI auto-generates interactive docs:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
