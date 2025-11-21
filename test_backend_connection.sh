#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing Backend Connection...${NC}"
echo ""

# Test 1: Check if backend is running
echo -e "${YELLOW}Test 1: Checking if backend is running on port 5001...${NC}"
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running!${NC}"
    echo -e "${BLUE}Response:${NC}"
    curl -s http://localhost:5001/api/health | python3 -m json.tool
else
    echo -e "${RED}❌ Backend is not responding on port 5001${NC}"
    echo -e "${YELLOW}Please start the backend with: cd backend && python3 app.py${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Test 2: Checking CORS headers...${NC}"
CORS_RESPONSE=$(curl -s -H "Origin: http://localhost:5174" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS http://localhost:5001/api/rate-outfit -I)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS is configured correctly${NC}"
    echo -e "${BLUE}CORS Headers:${NC}"
    echo "$CORS_RESPONSE" | grep "Access-Control"
else
    echo -e "${RED}❌ CORS headers not found${NC}"
    echo -e "${YELLOW}Backend may need to be restarted to pick up CORS changes${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Connection Test Complete          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Backend URL:${NC} http://localhost:5001/api"
echo -e "${BLUE}Frontend should connect from:${NC} http://localhost:5174"
