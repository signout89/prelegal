#!/usr/bin/env bash
# Build and start Prelegal at http://localhost:8000
set -euo pipefail
cd "$(dirname "$0")/.."
docker build -t prelegal .
docker rm -f prelegal >/dev/null 2>&1 || true
ENV_ARGS=()
[ -f .env ] && ENV_ARGS=(--env-file .env)
docker run -d --name prelegal -p 8000:8000 ${ENV_ARGS[@]+"${ENV_ARGS[@]}"} prelegal
echo "Prelegal running at http://localhost:8000"
