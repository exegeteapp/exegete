#!/bin/bash

set -a
. ../.env_local
uv run alembic upgrade head
uv run uvicorn exegete.api.app:app --host 0.0.0.0 --port 8000 --reload
