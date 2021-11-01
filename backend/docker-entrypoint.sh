#!/bin/bash

uvicorn exegete.api.app:app --host 0.0.0.0 --port 8000 --reload

