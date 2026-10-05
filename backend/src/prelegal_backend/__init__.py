"""Prelegal backend."""


def main() -> None:
    """Run the API server on port 8000."""
    import uvicorn

    uvicorn.run("prelegal_backend.main:app", host="0.0.0.0", port=8000)
