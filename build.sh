#!/bin/bash
set -e

echo "Installing Python dependencies..."
python --version
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "Dependencies installed successfully!"
