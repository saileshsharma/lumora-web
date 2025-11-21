#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI Outfit Assistant - Startup Script    ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 is not installed. Please install Python3 first.${NC}"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install/Update dependencies
echo -e "${BLUE}📦 Checking dependencies...${NC}"
pip install -q -r requirements.txt
echo -e "${GREEN}✅ Dependencies ready${NC}"

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo -e "${YELLOW}   Please create a .env file with your API keys:${NC}"
    echo -e "${YELLOW}   - OPENAI_API_KEY=your_key_here${NC}"
    echo -e "${YELLOW}   - FAL_KEY=your_key_here${NC}"
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

echo ""
echo -e "${GREEN}🚀 Starting Backend Server...${NC}"
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${BLUE}⏳ Waiting for backend to initialize...${NC}"
sleep 3

echo -e "${GREEN}🚀 Starting Frontend Server...${NC}"
cd frontend
npm run dev -- --port 5173 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 2

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 All Systems Ready! 🎉          ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  Frontend: ${BLUE}http://localhost:5173${GREEN}          ║${NC}"
echo -e "${GREEN}║  Backend:  ${BLUE}http://localhost:5001${GREEN}          ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  Press ${RED}Ctrl+C${GREEN} to stop all servers        ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Open browser (macOS)
if command -v open &> /dev/null; then
    echo -e "${BLUE}🌐 Opening browser...${NC}"
    sleep 1
    open http://localhost:5173
fi

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
