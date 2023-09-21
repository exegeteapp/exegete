#!/bin/bash

set -a
. ../.env_local
poetry run alembic upgrade head
poetry run uvicorn exegete.api.app:app --host 0.0.0.0 --port 8000 --reload
