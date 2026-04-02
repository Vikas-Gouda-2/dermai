#!/bin/bash
set -e
echo "Starting DermAI API Server..."
which python
python -c "import uvicorn; print('uvicorn imported successfully')"
exec gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}
