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

# Check if Docker is installed (for Keycloak)
echo -e "${BLUE}🔍 Checking system requirements...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. Keycloak authentication will not be available.${NC}"
    echo -e "${YELLOW}   Install Docker Desktop to enable Keycloak: https://www.docker.com/products/docker-desktop${NC}"
    DOCKER_AVAILABLE=false
else
    DOCKER_VERSION=$(docker --version 2>&1)
    echo -e "${GREEN}✅ Docker ${DOCKER_VERSION} found${NC}"
    DOCKER_AVAILABLE=true
fi

# Check if Python is installed
echo -e "${BLUE}🔍 Checking Python...${NC}"
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

    # Check Keycloak configuration
    if grep -q "USE_KEYCLOAK=.*true" backend/.env; then
        echo -e "${BLUE}   ℹ️  Keycloak authentication enabled${NC}"
        KEYCLOAK_ENABLED=true

        if grep -q "KEYCLOAK_SERVER_URL=.*[a-zA-Z0-9]" backend/.env; then
            echo -e "${GREEN}   ✓ Keycloak server URL configured${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Keycloak server URL missing${NC}"
        fi

        if grep -q "KEYCLOAK_CLIENT_SECRET=.*[a-zA-Z0-9]" backend/.env; then
            echo -e "${GREEN}   ✓ Keycloak client secret configured${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Keycloak client secret missing${NC}"
        fi
    else
        echo -e "${BLUE}   ℹ️  Using legacy JWT authentication${NC}"
        KEYCLOAK_ENABLED=false
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

    # Ask if user wants to stop Keycloak
    if [ "$KEYCLOAK_ENABLED" = true ] && [ "$DOCKER_AVAILABLE" = true ]; then
        if docker ps | grep -q lumora-keycloak; then
            echo -e "${BLUE}🔐 Keycloak is still running${NC}"
            read -p "Do you want to stop Keycloak? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}⏳ Stopping Keycloak...${NC}"
                docker-compose -f docker-compose.keycloak.yml down > /dev/null 2>&1
                echo -e "${GREEN}✅ Keycloak stopped${NC}"
            else
                echo -e "${BLUE}ℹ️  Keycloak will keep running${NC}"
                echo -e "${BLUE}   Stop it later with: docker-compose -f docker-compose.keycloak.yml down${NC}"
            fi
        fi
    fi

    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Start Keycloak if enabled and Docker is available
if [ "$KEYCLOAK_ENABLED" = true ] && [ "$DOCKER_AVAILABLE" = true ]; then
    echo ""
    echo -e "${GREEN}🔐 Starting Keycloak Server...${NC}"

    # Check if Keycloak is already running
    if docker ps | grep -q lumora-keycloak; then
        echo -e "${GREEN}✅ Keycloak is already running${NC}"
    else
        # Start Keycloak
        echo -e "${BLUE}⏳ Starting Keycloak and PostgreSQL containers...${NC}"
        docker-compose -f docker-compose.keycloak.yml up -d > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Keycloak containers started${NC}"

            # Wait for Keycloak to be ready
            echo -e "${BLUE}⏳ Waiting for Keycloak to initialize (may take 30-60 seconds)...${NC}"
            COUNTER=0
            MAX_TRIES=20

            while [ $COUNTER -lt $MAX_TRIES ]; do
                if curl -s http://localhost:8080/health/ready > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ Keycloak is ready at http://localhost:8080${NC}"
                    break
                fi
                echo -n "."
                sleep 3
                COUNTER=$((COUNTER+1))
            done

            if [ $COUNTER -eq $MAX_TRIES ]; then
                echo -e "${YELLOW}⚠️  Keycloak did not start in time, but continuing anyway...${NC}"
                echo -e "${YELLOW}   Check Keycloak logs: docker-compose -f docker-compose.keycloak.yml logs -f${NC}"
            fi
        else
            echo -e "${RED}❌ Failed to start Keycloak${NC}"
            echo -e "${YELLOW}   The application will continue with backend only${NC}"
        fi
    fi
elif [ "$KEYCLOAK_ENABLED" = true ] && [ "$DOCKER_AVAILABLE" = false ]; then
    echo -e "${YELLOW}⚠️  Keycloak is enabled but Docker is not available${NC}"
    echo -e "${YELLOW}   The application may not work correctly without Keycloak${NC}"
    echo -e "${YELLOW}   Please install Docker Desktop or set USE_KEYCLOAK=false${NC}"
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

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

# Add Keycloak info if running
if [ "$KEYCLOAK_ENABLED" = true ] && [ "$DOCKER_AVAILABLE" = true ]; then
    if docker ps | grep -q lumora-keycloak; then
        echo -e "${GREEN}║  Keycloak: ${BLUE}http://localhost:8080${GREEN}          ║${NC}"
    fi
fi

echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  Logs:                                     ║${NC}"
echo -e "${GREEN}║    • backend.log  (Backend output)         ║${NC}"
echo -e "${GREEN}║    • frontend.log (Frontend output)        ║${NC}"

# Add Keycloak info if enabled
if [ "$KEYCLOAK_ENABLED" = true ]; then
    echo -e "${GREEN}║                                            ║${NC}"
    echo -e "${GREEN}║  Authentication: ${BLUE}Keycloak${GREEN}                  ║${NC}"
    echo -e "${GREEN}║    • User: sailesh.sharma@gmail.com        ║${NC}"
    echo -e "${GREEN}║    • Password: Admin@123                   ║${NC}"
else
    echo -e "${GREEN}║                                            ║${NC}"
    echo -e "${GREEN}║  Authentication: ${BLUE}Legacy JWT${GREEN}                ║${NC}"
fi

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
