import uvicorn


def get_config_value(*keys, default=None):
    """Lazy import to avoid circular dependency."""
    from app.config.config_loader import get_config_value as _get_config_value

    return _get_config_value(*keys, default=default)


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=get_config_value("server", "host", default="0.0.0.0"),
        port=get_config_value("server", "port", default=8000),
        reload=get_config_value("server", "reload", default=False),
    )
