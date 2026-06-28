from pydantic import BaseModel


class GenerateRequest(BaseModel):
    message: str


class GenerateResponse(BaseModel):
    response: str
    tokens_generated: int


class HealthResponse(BaseModel):
    status: str
    device: str
    model_id: str
    dtype: str
