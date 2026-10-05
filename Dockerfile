# Stage 1: build the static Next.js frontend
FROM node:24-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: FastAPI backend serving the API and the static frontend
FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
ENV PRELEGAL_ROOT=/app \
    PRELEGAL_DB_PATH=/tmp/prelegal.db \
    UV_COMPILE_BYTECODE=1
COPY backend/pyproject.toml backend/uv.lock backend/.python-version backend/
RUN cd backend && uv sync --frozen --no-dev --no-install-project
COPY backend/ backend/
RUN cd backend && uv sync --frozen --no-dev
COPY catalog.json ./
COPY templates/ templates/
COPY --from=frontend /frontend/out frontend/out
EXPOSE 8000
CMD ["backend/.venv/bin/prelegal-backend"]
