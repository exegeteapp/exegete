#!/bin/bash

set -a
. ../.env_local
poetry run ./scripts/run-import.sh "$1"
