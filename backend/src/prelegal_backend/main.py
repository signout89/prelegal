"""FastAPI application: API routes plus the statically built frontend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from . import auth, chat, config, db, documents, templates_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="Prelegal", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(templates_routes.router)
app.include_router(chat.router)
app.include_router(documents.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


if config.STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=config.STATIC_DIR, html=True), name="frontend")
