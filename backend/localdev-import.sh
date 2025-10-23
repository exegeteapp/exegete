#!/bin/bash

set -a
. ../.env_local
uv run ./scripts/run-import.sh "$1"
