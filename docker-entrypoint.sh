#!/bin/bash
set -e

echo "Starting AI Outfit Assistant..."

# Start Flask backend in the background
cd /app/backend
python app.py &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 5

# Keep the container running
wait $BACKEND_PID
