#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      AI Outfit Assistant - Status Check   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check Backend
echo -e "${BLUE}🔍 Checking Backend (Port 5001)...${NC}"
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend process is running${NC}"

    # Test health endpoint
    if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is responding to requests${NC}"
        HEALTH_DATA=$(curl -s http://localhost:5001/api/health)
        echo -e "${BLUE}   Response: ${NC}${HEALTH_DATA}"
    else
        echo -e "${YELLOW}⚠️  Backend process running but not responding${NC}"
    fi
else
    echo -e "${RED}❌ Backend is not running on port 5001${NC}"
fi

echo ""

# Check Frontend
echo -e "${BLUE}🔍 Checking Frontend (Port 5174)...${NC}"
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on port 5174${NC}"
    echo -e "${BLUE}   URL: ${NC}http://localhost:5174"
else
    echo -e "${RED}❌ Frontend is not running on port 5174${NC}"
fi

echo ""

# Check .env file
echo -e "${BLUE}🔍 Checking Configuration...${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env exists${NC}"

    # Check for API keys (without revealing them)
    if grep -q "OPENAI_API_KEY=.*[a-zA-Z0-9]" backend/.env; then
        KEY_PREFIX=$(grep "OPENAI_API_KEY=" backend/.env | cut -d'=' -f2 | cut -c1-10)
        echo -e "${GREEN}   ✓ OpenAI API key: ${KEY_PREFIX}...${NC}"
    else
        echo -e "${YELLOW}   ⚠️  OpenAI API key not configured${NC}"
    fi

    if grep -q "FAL_API_KEY=.*[a-zA-Z0-9]" backend/.env; then
        KEY_PREFIX=$(grep "FAL_API_KEY=" backend/.env | cut -d'=' -f2 | cut -c1-10)
        echo -e "${GREEN}   ✓ FAL API key: ${KEY_PREFIX}...${NC}"
    else
        echo -e "${YELLOW}   ⚠️  FAL API key not configured${NC}"
    fi
else
    echo -e "${RED}❌ backend/.env not found${NC}"
fi

echo ""

# Check Dependencies
echo -e "${BLUE}🔍 Checking Dependencies...${NC}"
if [ -d "venv" ]; then
    echo -e "${GREEN}✅ Python virtual environment exists${NC}"
else
    echo -e "${YELLOW}⚠️  Python virtual environment not found${NC}"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend dependencies not installed${NC}"
fi

echo ""

# Check Log Files
echo -e "${BLUE}🔍 Checking Log Files...${NC}"
if [ -f "backend.log" ]; then
    LOG_SIZE=$(du -h backend.log | cut -f1)
    LOG_LINES=$(wc -l < backend.log | tr -d ' ')
    echo -e "${GREEN}✅ backend.log exists (${LOG_SIZE}, ${LOG_LINES} lines)${NC}"
    echo -e "${BLUE}   Last 3 lines:${NC}"
    tail -n 3 backend.log | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  backend.log not found (servers may not be running)${NC}"
fi

echo ""

if [ -f "frontend.log" ]; then
    LOG_SIZE=$(du -h frontend.log | cut -f1)
    LOG_LINES=$(wc -l < frontend.log | tr -d ' ')
    echo -e "${GREEN}✅ frontend.log exists (${LOG_SIZE}, ${LOG_LINES} lines)${NC}"
    echo -e "${BLUE}   Last 3 lines:${NC}"
    tail -n 3 frontend.log | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  frontend.log not found (servers may not be running)${NC}"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Status Check Complete         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Summary
BACKEND_OK=false
FRONTEND_OK=false

if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    BACKEND_OK=true
fi

if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
    FRONTEND_OK=true
fi

if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
    echo -e "${GREEN}🎉 Everything looks good! Both servers are running.${NC}"
    echo -e "${BLUE}   Frontend: ${NC}http://localhost:5174"
    echo -e "${BLUE}   Backend:  ${NC}http://localhost:5001"
elif [ "$BACKEND_OK" = true ]; then
    echo -e "${YELLOW}⚠️  Backend is running but frontend is not.${NC}"
    echo -e "${BLUE}   Start with: ${NC}./start.sh"
elif [ "$FRONTEND_OK" = true ]; then
    echo -e "${YELLOW}⚠️  Frontend is running but backend is not.${NC}"
    echo -e "${BLUE}   Start with: ${NC}./start.sh"
else
    echo -e "${RED}❌ Both servers are stopped.${NC}"
    echo -e "${BLUE}   Start with: ${NC}./start.sh"
fi

echo ""
