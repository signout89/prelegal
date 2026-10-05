import pytest
from fastapi.testclient import TestClient

from prelegal_backend import config
from prelegal_backend.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "DB_PATH", tmp_path / "test.db")
    with TestClient(app) as c:
        yield c
