#!/bin/bash
cd "$(dirname "$0")" || exit 1
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
