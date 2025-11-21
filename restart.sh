#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI Outfit Assistant - Restart Script    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Stop backend
echo -e "${YELLOW}🛑 Stopping backend server...${NC}"
pkill -f "python3 app.py" 2>/dev/null && echo -e "${GREEN}✅ Backend stopped${NC}" || echo -e "${YELLOW}⚠️  Backend was not running${NC}"

# Stop frontend
echo -e "${YELLOW}🛑 Stopping frontend server...${NC}"
pkill -f "vite" 2>/dev/null && echo -e "${GREEN}✅ Frontend stopped${NC}" || echo -e "${YELLOW}⚠️  Frontend was not running${NC}"

# Wait a moment for ports to be released
sleep 2

echo ""
echo -e "${BLUE}🔄 Restarting servers...${NC}"
echo ""

# Start with the main startup script
./start.sh
