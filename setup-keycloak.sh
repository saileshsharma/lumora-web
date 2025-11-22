#!/bin/bash

# Keycloak Local Setup Script for Sailesh
# This script will set up Keycloak with your configuration

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Keycloak Setup for Lumora - Sailesh     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
echo -e "${BLUE}🔍 Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again${NC}"
    echo ""
    echo -e "${BLUE}To start Docker Desktop:${NC}"
    echo "  1. Open Docker Desktop application"
    echo "  2. Wait for it to start (whale icon in menu bar)"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if Keycloak is already running
echo -e "${BLUE}🔍 Checking if Keycloak is already running...${NC}"
if docker ps | grep -q lumora-keycloak; then
    echo -e "${YELLOW}⚠️  Keycloak is already running${NC}"
    read -p "Do you want to restart it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔄 Stopping Keycloak...${NC}"
        docker-compose -f docker-compose.keycloak.yml down
        echo -e "${GREEN}✅ Stopped${NC}"
    else
        echo -e "${BLUE}ℹ️  Keycloak is already running at http://localhost:8080${NC}"
        echo -e "${BLUE}   Admin: admin / admin_change_in_production${NC}"
        exit 0
    fi
fi

# Start Keycloak
echo -e "${BLUE}🚀 Starting Keycloak and PostgreSQL...${NC}"
docker-compose -f docker-compose.keycloak.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Keycloak${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Keycloak containers started${NC}"
echo ""

# Wait for Keycloak to be ready
echo -e "${BLUE}⏳ Waiting for Keycloak to initialize (this may take 60-90 seconds)...${NC}"
echo -e "${YELLOW}   Please be patient, Keycloak is loading...${NC}"

COUNTER=0
MAX_TRIES=30

while [ $COUNTER -lt $MAX_TRIES ]; do
    if curl -s http://localhost:8080/health/ready > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Keycloak is ready!${NC}"
        break
    fi

    echo -n "."
    sleep 3
    COUNTER=$((COUNTER+1))
done

echo ""

if [ $COUNTER -eq $MAX_TRIES ]; then
    echo -e "${RED}❌ Keycloak did not start in time${NC}"
    echo -e "${YELLOW}Check logs with: docker-compose -f docker-compose.keycloak.yml logs -f keycloak${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 Keycloak is Ready! 🎉          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Access Points:${NC}"
echo -e "   Admin Console: ${GREEN}http://localhost:8080${NC}"
echo -e "   Username: ${GREEN}admin${NC}"
echo -e "   Password: ${GREEN}admin_change_in_production${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "   1. Open http://localhost:8080 in your browser"
echo "   2. Click 'Administration Console'"
echo "   3. Login with the credentials above"
echo "   4. Follow the configuration guide below"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   CONFIGURATION GUIDE FOR SAILESH${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}STEP 1: Create Realm${NC}"
echo "  1. Hover over 'master' dropdown (top-left)"
echo "  2. Click 'Create Realm'"
echo "  3. Realm name: ${GREEN}lumora${NC}"
echo "  4. Click 'Create'"
echo ""
echo -e "${BLUE}STEP 2: Configure Login Settings${NC}"
echo "  1. Go to 'Realm Settings' → 'Login' tab"
echo "  2. Enable:"
echo "     ✓ User registration"
echo "     ✓ Forgot password"
echo "     ✓ Remember me"
echo "     ✓ Email as username"
echo "     ✓ Login with email"
echo "  3. Click 'Save'"
echo ""
echo -e "${BLUE}STEP 3: Configure Email (SMTP)${NC}"
echo "  1. Go to 'Realm Settings' → 'Email' tab"
echo "  2. Configure:"
echo "     Host: ${GREEN}smtp.gmail.com${NC}"
echo "     Port: ${GREEN}587${NC}"
echo "     From: ${GREEN}noreply@lumora.com${NC}"
echo "     From Display Name: ${GREEN}Lumora${NC}"
echo "     Enable StartTLS: ${GREEN}ON${NC}"
echo "     Enable Authentication: ${GREEN}ON${NC}"
echo "     Username: ${GREEN}sailesh.sharma@gmail.com${NC}"
echo "     Password: ${GREEN}[Your Gmail App Password]${NC}"
echo "  3. Click 'Save'"
echo "  4. Click 'Test connection'"
echo ""
echo -e "${YELLOW}⚠️  Gmail App Password:${NC}"
echo "  You need to create an App Password for Gmail:"
echo "  1. Go to: https://myaccount.google.com/apppasswords"
echo "  2. Generate new app password"
echo "  3. Copy and use in Keycloak Email settings"
echo ""
echo -e "${BLUE}STEP 4: Create Frontend Client${NC}"
echo "  1. Go to 'Clients' → 'Create client'"
echo "  2. Client ID: ${GREEN}lumora-frontend${NC}"
echo "  3. Click 'Next'"
echo "  4. Set:"
echo "     Client authentication: ${GREEN}OFF${NC}"
echo "     Standard flow: ${GREEN}ON${NC}"
echo "     Direct access grants: ${GREEN}ON${NC}"
echo "  5. Click 'Next'"
echo "  6. Valid redirect URIs:"
echo "     ${GREEN}http://localhost:5174/*${NC}"
echo "     ${GREEN}http://localhost:5173/*${NC}"
echo "  7. Valid post logout redirect URIs:"
echo "     ${GREEN}http://localhost:5174/*${NC}"
echo "  8. Web origins:"
echo "     ${GREEN}http://localhost:5174${NC}"
echo "     ${GREEN}http://localhost:5173${NC}"
echo "  9. Click 'Save'"
echo ""
echo -e "${BLUE}STEP 5: Create Backend Client${NC}"
echo "  1. Go to 'Clients' → 'Create client'"
echo "  2. Client ID: ${GREEN}lumora-backend${NC}"
echo "  3. Click 'Next'"
echo "  4. Set:"
echo "     Client authentication: ${GREEN}ON${NC}"
echo "     Service accounts roles: ${GREEN}ON${NC}"
echo "  5. Click 'Save'"
echo "  6. Go to 'Credentials' tab"
echo "  7. ${YELLOW}COPY THE CLIENT SECRET${NC} - you'll need this!"
echo ""
echo -e "${BLUE}STEP 6: Create Roles${NC}"
echo "  1. Go to 'Realm roles' → 'Create role'"
echo "  2. Create these roles:"
echo "     • ${GREEN}user${NC} - Regular user"
echo "     • ${GREEN}admin${NC} - Administrator"
echo "     • ${GREEN}premium${NC} - Premium user"
echo "  3. For each role: Enter name, description, click 'Save'"
echo ""
echo -e "${BLUE}STEP 7: Set Default Roles${NC}"
echo "  1. Go to 'Realm roles'"
echo "  2. Click on 'default-roles-lumora'"
echo "  3. Click 'Assign role'"
echo "  4. Select 'user' role"
echo "  5. Click 'Assign'"
echo ""
echo -e "${BLUE}STEP 8: Create Your Admin User${NC}"
echo "  1. Go to 'Users' → 'Add user'"
echo "  2. Username: ${GREEN}sailesh.sharma@gmail.com${NC}"
echo "  3. Email: ${GREEN}sailesh.sharma@gmail.com${NC}"
echo "  4. First name: ${GREEN}Sailesh${NC}"
echo "  5. Last name: ${GREEN}Sharma${NC}"
echo "  6. Email verified: ${GREEN}ON${NC}"
echo "  7. Click 'Create'"
echo "  8. Go to 'Credentials' tab"
echo "  9. Click 'Set password'"
echo " 10. Enter your password"
echo " 11. Temporary: ${GREEN}OFF${NC}"
echo " 12. Click 'Save'"
echo " 13. Go to 'Role mapping' tab"
echo " 14. Click 'Assign role'"
echo " 15. Select 'admin' and 'user' roles"
echo " 16. Click 'Assign'"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Setup Complete! ✅               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}After completing these steps, update your .env files:${NC}"
echo ""
echo -e "${YELLOW}backend/.env:${NC}"
echo "  KEYCLOAK_SERVER_URL=http://localhost:8080"
echo "  KEYCLOAK_REALM=lumora"
echo "  KEYCLOAK_CLIENT_ID=lumora-backend"
echo "  KEYCLOAK_CLIENT_SECRET=<paste-client-secret-here>"
echo "  USE_KEYCLOAK=true"
echo ""
echo -e "${YELLOW}frontend/.env.local:${NC}"
echo "  VITE_KEYCLOAK_URL=http://localhost:8080"
echo "  VITE_KEYCLOAK_REALM=lumora"
echo "  VITE_KEYCLOAK_CLIENT_ID=lumora-frontend"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • Complete guide: KEYCLOAK_COMPLETE_GUIDE.md"
echo "  • Setup details: KEYCLOAK_SETUP.md"
echo "  • Frontend guide: KEYCLOAK_FRONTEND_INTEGRATION.md"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "  • View logs: docker-compose -f docker-compose.keycloak.yml logs -f"
echo "  • Stop: docker-compose -f docker-compose.keycloak.yml down"
echo "  • Restart: docker-compose -f docker-compose.keycloak.yml restart"
echo ""
