"""
Root entry point for Render deployment
"""
import sys
import os

# Add BACKEND folder to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'BACKEND'))

# Import and use the actual app from BACKEND/main.py
from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
