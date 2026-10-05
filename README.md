# Prelegal

Draft legal agreements from Common Paper templates by chatting with an AI assistant.

## Run

1. Add `OPENROUTER_API_KEY=...` to `.env` in the project root.
2. Start with Docker: `scripts/start-mac.sh` (or the Linux/Windows equivalent), then open http://localhost:8000.
3. Stop with `scripts/stop-mac.sh`.

The SQLite database is recreated each time the container starts.

## Develop

```bash
cd frontend && npm install && npm test && npm run build   # static export to frontend/out
cd backend && uv run pytest && uv run prelegal-backend    # serves API + frontend on :8000
```
