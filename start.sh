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
echo -e "${BLUE}🔍 Checking system requirements...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 is not installed. Please install Python3 first.${NC}"
    exit 1
else
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✅ Python ${PYTHON_VERSION} found${NC}"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
else
    NODE_VERSION=$(node --version 2>&1)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} found${NC}"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
else
    NPM_VERSION=$(npm --version 2>&1)
    echo -e "${GREEN}✅ npm ${NPM_VERSION} found${NC}"
fi
echo ""

# Check if virtual environment exists in backend directory
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating one...${NC}"
    cd backend
    python3 -m venv venv
    cd ..
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
source backend/venv/bin/activate

# Install/Update dependencies
echo -e "${BLUE}📦 Checking backend dependencies...${NC}"
pip install -q -r backend/requirements.txt
echo -e "${GREEN}✅ Backend dependencies ready${NC}"

# Check for .env file in backend directory
echo -e "${BLUE}🔍 Checking environment configuration...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env file not found!${NC}"
    echo -e "${YELLOW}   Creating from .env.example...${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}   ⚠️  Please edit backend/.env and add your API keys:${NC}"
        echo -e "${YELLOW}   - OPENAI_API_KEY=your_key_here${NC}"
        echo -e "${YELLOW}   - FAL_API_KEY=your_key_here${NC}"
        echo -e "${YELLOW}   - JWT_SECRET_KEY=your_jwt_secret_here${NC}"
        echo -e "${YELLOW}   - ADMIN_PASSWORD=your_admin_password_here${NC}"
        echo ""
        echo -e "${BLUE}   💡 Generate JWT secret key with:${NC}"
        echo -e "${BLUE}      python3 -c \"import secrets; print(secrets.token_hex(32))\"${NC}"
        echo ""
        read -p "Press Enter to continue anyway or Ctrl+C to exit..."
    else
        echo -e "${RED}   ❌ backend/.env.example not found!${NC}"
        echo -e "${YELLOW}   Please create backend/.env manually with your API keys.${NC}"
        read -p "Press Enter to continue anyway or Ctrl+C to exit..."
    fi
else
    echo -e "${GREEN}✅ Environment file found${NC}"

    # Verify essential API keys are set (not just empty)
    if grep -q "OPENAI_API_KEY=.*[a-zA-Z0-9]" backend/.env; then
        echo -e "${GREEN}   ✓ OpenAI API key configured${NC}"
    else
        echo -e "${YELLOW}   ⚠️  OpenAI API key appears to be missing${NC}"
    fi

    if grep -q "FAL_API_KEY=.*[a-zA-Z0-9]" backend/.env; then
        echo -e "${GREEN}   ✓ FAL API key configured${NC}"
    else
        echo -e "${YELLOW}   ⚠️  FAL API key appears to be missing (optional)${NC}"
    fi

    if grep -q "JWT_SECRET_KEY=.*[a-zA-Z0-9]" backend/.env; then
        echo -e "${GREEN}   ✓ JWT secret key configured${NC}"
    else
        echo -e "${YELLOW}   ⚠️  JWT secret key appears to be missing${NC}"
        echo -e "${BLUE}      Generate one with: python3 -c \"import secrets; print(secrets.token_hex(32))\"${NC}"
    fi

    if grep -q "ADMIN_PASSWORD=.*[a-zA-Z0-9]" backend/.env; then
        echo -e "${GREEN}   ✓ Admin password configured${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Admin password appears to be missing${NC}"
    fi
fi

# Check frontend dependencies
echo -e "${BLUE}📦 Checking frontend dependencies...${NC}"
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not installed. Installing...${NC}"
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies ready${NC}"
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
echo -e "${GREEN}🚀 Starting Backend Server (Port 5001)...${NC}"
cd backend
python3 app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start and verify it's running
echo -e "${BLUE}⏳ Waiting for backend to initialize...${NC}"
sleep 3

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    # Try to verify backend is responding
    if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running and responding on http://localhost:5001${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend started but may still be initializing...${NC}"
    fi
else
    echo -e "${RED}❌ Backend failed to start. Check backend.log for errors.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Starting Frontend Server (Port 5174)...${NC}"
cd frontend
npm run dev -- --port 5174 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 2

# Check if frontend started successfully
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:5174${NC}"
else
    echo -e "${RED}❌ Frontend failed to start. Check frontend.log for errors.${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 All Systems Ready! 🎉          ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  Frontend: ${BLUE}http://localhost:5174${GREEN}          ║${NC}"
echo -e "${GREEN}║  Backend:  ${BLUE}http://localhost:5001${GREEN}          ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  Logs:                                     ║${NC}"
echo -e "${GREEN}║    • backend.log  (Backend output)         ║${NC}"
echo -e "${GREEN}║    • frontend.log (Frontend output)        ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  Press ${RED}Ctrl+C${GREEN} to stop all servers        ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Open browser (macOS)
if command -v open &> /dev/null; then
    echo -e "${BLUE}🌐 Opening browser...${NC}"
    sleep 1
    open http://localhost:5174
fi

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
