#!/bin/bash

# Lumora - Interactive Production Deployment
# Guides you through deploying Keycloak, Backend, and Frontend

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║  🚀 Lumora Production Deployment Wizard   ║"
echo "╔════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "This wizard will deploy:"
echo "  1. 🔐 Keycloak (Authentication Server)"
echo "  2. 🖥️  Backend API"
echo "  3. 🌐 Frontend (Cloudflare Workers)"
echo ""
echo -e "${YELLOW}Prerequisites:${NC}"
echo "  ✅ Railway CLI (logged in as sailesh.sharma@gmail.com)"
echo "  ✅ Wrangler CLI (logged in to Cloudflare)"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "════════════════════════════════════════════"
echo "📋 Step 1: Railway Project Setup"
echo "════════════════════════════════════════════"
echo ""

# Check existing projects
echo "Your existing Railway projects:"
railway list
echo ""

echo -e "${YELLOW}Choose an option:${NC}"
echo "  1. Create a NEW project for Lumora"
echo "  2. Use an EXISTING project"
echo ""
read -p "Enter choice (1 or 2): " PROJECT_CHOICE

if [ "$PROJECT_CHOICE" = "1" ]; then
    echo ""
    echo "Creating new Railway project..."
    railway init --name lumora-production || {
        echo -e "${RED}❌ Failed to create project${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Project created and linked${NC}"
elif [ "$PROJECT_CHOICE" = "2" ]; then
    echo ""
    echo "Linking to existing project..."
    railway link || {
        echo -e "${RED}❌ Failed to link project${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Project linked${NC}"
else
    echo -e "${RED}Invalid choice${NC}"
    exit 1
fi

# Verify project
PROJECT_NAME=$(railway status 2>&1 | grep "Project:" | awk '{print $2}' || echo "unknown")
echo ""
echo -e "${GREEN}✅ Using Railway project: $PROJECT_NAME${NC}"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "════════════════════════════════════════════"
echo "🗄️  Step 2: PostgreSQL Database"
echo "════════════════════════════════════════════"
echo ""

# Check for existing database
if railway service list 2>&1 | grep -iq "postgres"; then
    echo -e "${GREEN}✅ PostgreSQL database already exists${NC}"
else
    echo "PostgreSQL database is required for Keycloak."
    read -p "Create PostgreSQL database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway add --database postgres
        echo -e "${GREEN}✅ PostgreSQL database created${NC}"
    else
        echo -e "${YELLOW}⚠️  You'll need to create it manually later${NC}"
    fi
fi

echo ""
read -p "Press Enter to continue..."

echo ""
echo "════════════════════════════════════════════"
echo "🔐 Step 3: Deploy Keycloak"
echo "════════════════════════════════════════════"
echo ""

read -p "Enter Keycloak admin password (default: Admin@123): " KC_ADMIN_PASSWORD
KC_ADMIN_PASSWORD=${KC_ADMIN_PASSWORD:-Admin@123}

echo ""
echo "Creating Keycloak service..."

# Try to create service (might already exist)
railway service create keycloak 2>/dev/null || echo "Service may already exist, continuing..."

# Link to Keycloak database
echo ""
echo "Linking Keycloak to PostgreSQL..."
echo "Please follow these steps in Railway dashboard:"
echo "  1. Open: https://railway.app/dashboard"
echo "  2. Select your project: $PROJECT_NAME"
echo "  3. Click on 'keycloak' service"
echo "  4. Go to 'Variables' tab"
echo "  5. Click 'Add Reference' and select PostgreSQL"
echo ""
read -p "Press Enter after linking database..."

# Set environment variables
echo ""
echo "Setting Keycloak environment variables..."

# Create a temporary env file
cat > /tmp/keycloak-env.txt << EOF
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=$KC_ADMIN_PASSWORD
KC_HOSTNAME_STRICT=false
KC_PROXY=edge
KC_HTTP_ENABLED=true
KC_DB=postgres
KC_HEALTH_ENABLED=true
KC_METRICS_ENABLED=true
EOF

echo "Please set these environment variables in Railway dashboard:"
cat /tmp/keycloak-env.txt
echo ""
echo "AND add PostgreSQL connection variables:"
echo "  KC_DB_URL_HOST=\${PGHOST}"
echo "  KC_DB_URL_DATABASE=\${PGDATABASE}"
echo "  KC_DB_USERNAME=\${PGUSER}"
echo "  KC_DB_PASSWORD=\${PGPASSWORD}"
echo ""
read -p "Press Enter after setting variables..."

rm /tmp/keycloak-env.txt

# Deploy Keycloak using Dockerfile
echo ""
echo "Deploying Keycloak..."
echo "(This will take 3-5 minutes...)"

cd "$(dirname "$0")"
railway up --service keycloak --dockerfile Dockerfile.keycloak || {
    echo -e "${YELLOW}⚠️  Automated deployment failed${NC}"
    echo "Please deploy manually:"
    echo "  1. Go to Railway dashboard"
    echo "  2. Select keycloak service"
    echo "  3. Settings → Build → Select 'Dockerfile'"
    echo "  4. Set Dockerfile path: Dockerfile.keycloak"
    echo "  5. Deploy"
    echo ""
    read -p "Press Enter after deploying..."
}

echo ""
echo "Generating public domain for Keycloak..."
railway domain --service keycloak 2>/dev/null || {
    echo "Please generate domain in Railway dashboard:"
    echo "  1. Select keycloak service"
    echo "  2. Settings → Networking"
    echo "  3. Generate Domain"
}

echo ""
read -p "Enter your Keycloak URL (e.g., keycloak-production.up.railway.app): " KEYCLOAK_DOMAIN
KEYCLOAK_URL="https://$KEYCLOAK_DOMAIN"

echo ""
echo -e "${GREEN}✅ Keycloak URL: $KEYCLOAK_URL${NC}"
echo ""

echo "Waiting for Keycloak to be ready..."
echo "This may take a few minutes..."
COUNTER=0
MAX_TRIES=60
while [ $COUNTER -lt $MAX_TRIES ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_URL/health/ready" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Keycloak is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 5
    COUNTER=$((COUNTER+1))
done

if [ $COUNTER -eq $MAX_TRIES ]; then
    echo -e "${YELLOW}⚠️  Health check timeout${NC}"
    echo "Keycloak may still be starting. Check Railway logs."
fi

echo ""
read -p "Press Enter to continue..."

echo ""
echo "════════════════════════════════════════════"
echo "⚙️  Step 4: Configure Keycloak"
echo "════════════════════════════════════════════"
echo ""

echo "Please configure Keycloak manually:"
echo ""
echo -e "${CYAN}1. Access Keycloak Admin Console:${NC}"
echo "   URL: $KEYCLOAK_URL/admin"
echo "   Username: admin"
echo "   Password: $KC_ADMIN_PASSWORD"
echo ""
echo -e "${CYAN}2. Configure Frontend Client (lumora-frontend):${NC}"
echo "   Client Type: Public"
echo "   Valid Redirect URIs:"
echo "     - https://lumora.aihack.workers.dev/*"
echo "     - http://localhost:5174/*"
echo "   Web Origins:"
echo "     - https://lumora.aihack.workers.dev"
echo "     - http://localhost:5174"
echo ""
echo -e "${CYAN}3. Configure Backend Client (lumora-backend):${NC}"
echo "   Client Type: Confidential"
echo "   Copy the Client Secret (you'll need it next)"
echo ""
read -p "Press Enter after completing Keycloak configuration..."

echo ""
read -p "Enter the backend client secret from Keycloak: " KC_CLIENT_SECRET

echo ""
echo "════════════════════════════════════════════"
echo "🖥️  Step 5: Deploy Backend"
echo "════════════════════════════════════════════"
echo ""

# Create backend service
railway service create backend 2>/dev/null || echo "Backend service may already exist, continuing..."

echo ""
echo "Please set these backend environment variables in Railway:"
echo ""
echo "  KEYCLOAK_SERVER_URL=$KEYCLOAK_URL"
echo "  KEYCLOAK_REALM=lumora"
echo "  KEYCLOAK_CLIENT_ID=lumora-backend"
echo "  KEYCLOAK_CLIENT_SECRET=$KC_CLIENT_SECRET"
echo "  USE_KEYCLOAK=true"
echo ""
read -p "Press Enter after setting variables..."

echo ""
echo "Deploying backend..."
railway up --service backend -d ./backend || {
    echo -e "${YELLOW}⚠️  Automated deployment failed${NC}"
    echo "Please deploy manually in Railway dashboard"
    read -p "Press Enter after deploying..."
}

echo ""
echo "Generating domain for backend..."
railway domain --service backend 2>/dev/null || {
    echo "Please generate domain in Railway dashboard"
}

echo ""
read -p "Enter your backend URL (e.g., backend-production.up.railway.app): " BACKEND_DOMAIN
BACKEND_URL="https://$BACKEND_DOMAIN"

echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "════════════════════════════════════════════"
echo "🌐 Step 6: Deploy Frontend to Cloudflare"
echo "════════════════════════════════════════════"
echo ""

cd frontend

echo "Setting Cloudflare environment variables..."
echo ""

# Set secrets
echo "$KEYCLOAK_URL" | wrangler secret put VITE_KEYCLOAK_URL
echo "$BACKEND_URL" | wrangler secret put VITE_API_URL

echo -e "${GREEN}✅ Secrets configured${NC}"
echo ""

echo "Installing dependencies..."
npm install

echo ""
echo "Building frontend..."
npm run build

echo ""
echo "Deploying to Cloudflare Workers..."
wrangler deploy

cd ..

echo ""
echo "════════════════════════════════════════════"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "════════════════════════════════════════════"
echo ""
echo -e "${GREEN}All services deployed successfully!${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🔐 Keycloak:${NC}"
echo "   URL: $KEYCLOAK_URL"
echo "   Admin Console: $KEYCLOAK_URL/admin"
echo "   Username: admin"
echo "   Password: $KC_ADMIN_PASSWORD"
echo ""
echo -e "${BLUE}🖥️  Backend:${NC}"
echo "   URL: $BACKEND_URL"
echo "   API: $BACKEND_URL/api"
echo ""
echo -e "${BLUE}🌐 Frontend:${NC}"
echo "   URL: https://lumora.aihack.workers.dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Next Steps:"
echo ""
echo "1. Visit: https://lumora.aihack.workers.dev"
echo "2. Click 'Sign In'"
echo "3. Login with: sailesh.sharma@gmail.com / Admin@123"
echo "4. Verify authentication works end-to-end"
echo ""
echo -e "${GREEN}🎉 Your app is live!${NC}"
echo ""

# Save deployment info
cat > DEPLOYMENT_INFO.txt << EOF
Lumora Production Deployment
=============================

Keycloak:
  URL: $KEYCLOAK_URL
  Admin: admin
  Password: $KC_ADMIN_PASSWORD

Backend:
  URL: $BACKEND_URL
  Client Secret: $KC_CLIENT_SECRET

Frontend:
  URL: https://lumora.aihack.workers.dev

Deployed: $(date)
EOF

echo "Deployment info saved to: DEPLOYMENT_INFO.txt"
echo ""
