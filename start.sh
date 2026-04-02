#!/bin/bash
set -e
echo "Starting DermAI API Server..."
cd BACKEND
python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
