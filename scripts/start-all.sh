#!/bin/bash

echo "🚀 Starting Poromet Application"
echo "==============================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT

# Start backend in background
echo "📡 Starting backend server..."
bash scripts/start-backend.sh &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend is running
curl -s http://127.0.0.1:8000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend started successfully at http://127.0.0.1:8000"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend in background
echo "🌐 Starting frontend server..."
bash scripts/start-frontend.sh &
FRONTEND_PID=$!

echo ""
echo "🎉 Poromet is now running!"
echo "=========================="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://127.0.0.1:8000"
echo "API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait
