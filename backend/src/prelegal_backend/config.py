"""Paths and settings resolved from the environment."""

import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(os.environ.get("PRELEGAL_ROOT", Path(__file__).resolve().parents[3]))
load_dotenv(ROOT / ".env")

TEMPLATES_DIR = ROOT / "templates"
CATALOG_PATH = ROOT / "catalog.json"
STATIC_DIR = Path(os.environ.get("PRELEGAL_STATIC_DIR", ROOT / "frontend" / "out"))
DB_PATH = Path(os.environ.get("PRELEGAL_DB_PATH", ROOT / "backend" / "prelegal.db"))
JWT_SECRET = os.environ.get("JWT_SECRET") or secrets.token_urlsafe(32)
