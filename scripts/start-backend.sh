#!/bin/bash

echo "🚀 Starting Poromet Backend Server"
echo "=================================="

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python first."
    exit 1
fi

# Check if required packages are installed
echo "📦 Checking Python dependencies..."
python -c "import porespy, fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📥 Installing Python dependencies..."
    pip install fastapi uvicorn python-multipart porespy numpy matplotlib scikit-image pillow
fi

# Start the backend server
echo "🔥 Starting backend server..."
cd backend
python server.py
