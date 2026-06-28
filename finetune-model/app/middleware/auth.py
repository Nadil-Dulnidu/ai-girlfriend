from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config.config_loader import get_config_value

security = HTTPBearer(auto_error=False)


def verify_api_key(
    credentials: HTTPAuthorizationCredentials | None = Security(security),
) -> str:
    """Validate Bearer token against auth.api_key in config.json.

    Raises HTTP 401 if the token is missing or does not match.
    """
    expected_key = get_config_value("auth", "api_key", default="")

    # If no api_key is set, skip auth (local development)
    if not expected_key:
        return "no-auth"

    if not credentials or credentials.credentials != expected_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key",
        )

    return credentials.credentials
