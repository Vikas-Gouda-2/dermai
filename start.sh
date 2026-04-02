#!/bin/bash
set -e
echo "Starting DermAI API Server..."
exec gunicorn BACKEND.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}
