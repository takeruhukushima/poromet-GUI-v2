#!/bin/bash

echo "🌐 Starting Poromet Frontend"
echo "============================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start the frontend
echo "🔥 Starting frontend server..."
npm run dev
