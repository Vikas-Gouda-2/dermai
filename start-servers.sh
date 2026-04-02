#!/bin/bash

# Start Backend
echo "Starting Backend on port 8000..."
cd /Users/viswa/Documents/AIFACE/BACKEND
python3 main.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Give backend time to start
sleep 3

# Start Frontend
echo ""
echo "Starting Frontend on port 5173..."
cd "/Users/viswa/Documents/AIFACE/FRONTEND "
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Give frontend time to start
sleep 4

echo ""
echo "================================"
echo "✅ BOTH SERVERS STARTED"
echo "================================"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Backend API Docs: http://localhost:8000/docs"
echo ""
echo "Process IDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop this script (servers will keep running)"
echo ""

# Wait for both processes
wait
