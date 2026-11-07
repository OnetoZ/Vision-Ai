#!/bin/bash
# Vision AI Startup Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Clean up any lingering processes on ports 8000 and 5173
echo "Freeing ports 8000 and 5173 if currently occupied..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

echo "Starting Backend..."
cd "$SCRIPT_DIR/backend" || exit 1
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting Frontend..."
cd "$SCRIPT_DIR/frontend" || exit 1
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo " Vision AI is running!"
echo " Frontend: http://localhost:5173"
echo " Backend:  http://127.0.0.1:8000/docs"
echo "=========================================="
echo "Press Ctrl+C to stop both servers."

trap "kill -9 $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
