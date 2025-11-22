#!/bin/bash

# Lumora - Complete Production Deployment Script
# Deploys Keycloak, Backend, and Frontend to production

set -e  # Exit on error

echo "🚀 Lumora - Complete Production Deployment"
echo "==========================================="
echo ""
echo "This script will deploy:"
echo "  1. Keycloak to Railway"
echo "  2. Backend to Railway"
echo "  3. Frontend to Cloudflare Workers"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it with: npm install -g @railway/cli"
    echo "Or use: brew install railway"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found${NC}"

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Please login first:"
    echo "  railway login"
    exit 1
fi

echo -e "${GREEN}✅ Logged in to Railway${NC}"

# Check Wrangler CLI
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found${NC}"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

echo -e "${GREEN}✅ Wrangler CLI found${NC}"

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare${NC}"
    echo "Please login first:"
    echo "  wrangler login"
    exit 1
fi

echo -e "${GREEN}✅ Logged in to Cloudflare${NC}"
echo ""

# Ask for confirmation
echo -e "${YELLOW}⚠️  This will deploy all services to production${NC}"
read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "============================================"
echo "📦 STEP 1/5: Creating Railway Project"
echo "============================================"
echo ""

# Check if Railway project exists
if railway status &> /dev/null; then
    echo -e "${GREEN}✅ Railway project already linked${NC}"
    RAILWAY_PROJECT=$(railway status 2>&1 | grep "Project:" | awk '{print $2}')
    echo "Project: $RAILWAY_PROJECT"
else
    echo -e "${YELLOW}⚠️  No Railway project linked${NC}"
    echo ""
    echo "Please create a Railway project:"
    echo "  1. Go to https://railway.app"
    echo "  2. Create a new project"
    echo "  3. Run: railway link"
    echo ""
    echo "Or run: railway init"
    echo ""
    read -p "Press Enter after linking the project..."
fi

echo ""
echo "============================================"
echo "🔐 STEP 2/5: Deploying Keycloak"
echo "============================================"
echo ""

# Create Keycloak service
echo "Creating Keycloak service on Railway..."
echo ""

# Check if PostgreSQL service exists
echo "Checking for PostgreSQL service..."
if railway service list 2>&1 | grep -q "postgres"; then
    echo -e "${GREEN}✅ PostgreSQL service found${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL service not found${NC}"
    echo "Creating PostgreSQL database..."
    railway add --database postgres || {
        echo -e "${RED}❌ Failed to create PostgreSQL database${NC}"
        echo "Please create it manually in Railway dashboard:"
        echo "  1. Go to your Railway project"
        echo "  2. Click '+ New'"
        echo "  3. Select 'Database' → 'PostgreSQL'"
        exit 1
    }
    echo -e "${GREEN}✅ PostgreSQL created${NC}"
fi

echo ""
echo "Creating Keycloak service..."

# Create new service for Keycloak
railway service create keycloak || {
    echo -e "${YELLOW}⚠️  Keycloak service might already exist${NC}"
}

# Set Keycloak environment variables
echo "Setting Keycloak environment variables..."

read -p "Enter Keycloak admin password (or press Enter for default 'Admin@123'): " KC_ADMIN_PASSWORD
KC_ADMIN_PASSWORD=${KC_ADMIN_PASSWORD:-Admin@123}

# Set environment variables for Keycloak service
railway variables set \
    KEYCLOAK_ADMIN=admin \
    KEYCLOAK_ADMIN_PASSWORD="$KC_ADMIN_PASSWORD" \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY=edge \
    KC_HTTP_ENABLED=true \
    KC_DB=postgres \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    --service keycloak

echo -e "${GREEN}✅ Keycloak environment variables set${NC}"

# Deploy Keycloak
echo "Deploying Keycloak..."
echo "(This may take 3-5 minutes...)"

railway up --service keycloak -d . || {
    echo -e "${RED}❌ Failed to deploy Keycloak${NC}"
    echo "Please check Railway dashboard for errors"
    exit 1
}

echo -e "${GREEN}✅ Keycloak deployment initiated${NC}"
echo "Waiting for Keycloak to be ready..."

# Wait for Keycloak to get a domain
sleep 10

KEYCLOAK_URL=$(railway domain --service keycloak 2>&1 || echo "")
if [ -z "$KEYCLOAK_URL" ]; then
    echo -e "${YELLOW}⚠️  Generating domain for Keycloak...${NC}"
    railway domain --service keycloak
    sleep 5
    KEYCLOAK_URL=$(railway domain --service keycloak 2>&1 || echo "")
fi

if [ -z "$KEYCLOAK_URL" ]; then
    echo -e "${RED}❌ Could not get Keycloak domain${NC}"
    echo "Please generate domain manually in Railway dashboard"
    read -p "Enter Keycloak URL (e.g., your-keycloak.up.railway.app): " KEYCLOAK_URL
fi

KEYCLOAK_URL="https://${KEYCLOAK_URL#https://}"
echo -e "${GREEN}✅ Keycloak URL: $KEYCLOAK_URL${NC}"

echo ""
echo "⏳ Waiting for Keycloak to be ready..."
COUNTER=0
MAX_TRIES=60
while [ $COUNTER -lt $MAX_TRIES ]; do
    if curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_URL/health/ready" | grep -q "200"; then
        echo -e "${GREEN}✅ Keycloak is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 5
    COUNTER=$((COUNTER+1))
done

if [ $COUNTER -eq $MAX_TRIES ]; then
    echo -e "${YELLOW}⚠️  Keycloak health check timeout${NC}"
    echo "Keycloak may still be starting up. Please check Railway logs."
    echo "Continuing with deployment..."
fi

echo ""
echo "============================================"
echo "⚙️  STEP 3/5: Configuring Keycloak"
echo "============================================"
echo ""

echo "Running Keycloak configuration script..."
cd backend

# Update configure_keycloak.py with production URL
if [ -f configure_keycloak.py ]; then
    # Create production config
    cat > configure_keycloak_production.py << EOF
import os
os.environ['KEYCLOAK_SERVER_URL'] = '$KEYCLOAK_URL'

# Import and run the original configuration
exec(open('configure_keycloak.py').read())
EOF

    python3 configure_keycloak_production.py || {
        echo -e "${YELLOW}⚠️  Automatic Keycloak configuration failed${NC}"
        echo "You may need to configure Keycloak manually using the admin console:"
        echo "  URL: $KEYCLOAK_URL"
        echo "  Username: admin"
        echo "  Password: $KC_ADMIN_PASSWORD"
        echo ""
        echo "Follow the guide in: KEYCLOAK_CLOUDFLARE_DEPLOYMENT.md"
    }

    rm configure_keycloak_production.py
else
    echo -e "${YELLOW}⚠️  configure_keycloak.py not found${NC}"
    echo "Please configure Keycloak manually"
fi

cd ..

echo ""
echo "============================================"
echo "🖥️  STEP 4/5: Deploying Backend"
echo "============================================"
echo ""

# Get or create backend service
echo "Deploying backend service..."

railway service create backend || {
    echo -e "${YELLOW}⚠️  Backend service might already exist${NC}"
}

# Get backend client secret
read -p "Enter Keycloak backend client secret (or press Enter to use default): " KC_CLIENT_SECRET
KC_CLIENT_SECRET=${KC_CLIENT_SECRET:-2UJLDxlu6tzJeKrg9YKtWNMsdnvj0tag}

# Set backend environment variables
echo "Setting backend environment variables..."

railway variables set \
    KEYCLOAK_SERVER_URL="$KEYCLOAK_URL" \
    KEYCLOAK_REALM=lumora \
    KEYCLOAK_CLIENT_ID=lumora-backend \
    KEYCLOAK_CLIENT_SECRET="$KC_CLIENT_SECRET" \
    USE_KEYCLOAK=true \
    --service backend

echo -e "${GREEN}✅ Backend environment variables set${NC}"

# Deploy backend
echo "Deploying backend..."
railway up --service backend -d ./backend || {
    echo -e "${RED}❌ Failed to deploy backend${NC}"
    exit 1
}

echo -e "${GREEN}✅ Backend deployment initiated${NC}"

# Get backend URL
sleep 5
BACKEND_URL=$(railway domain --service backend 2>&1 || echo "")
if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}⚠️  Generating domain for backend...${NC}"
    railway domain --service backend
    sleep 5
    BACKEND_URL=$(railway domain --service backend 2>&1 || echo "")
fi

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Could not get backend domain${NC}"
    read -p "Enter backend URL (e.g., your-backend.up.railway.app): " BACKEND_URL
fi

BACKEND_URL="https://${BACKEND_URL#https://}"
echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"

echo ""
echo "============================================"
echo "🌐 STEP 5/5: Deploying Frontend"
echo "============================================"
echo ""

cd frontend

echo "Setting Cloudflare secrets..."

# Set Keycloak URL secret
echo "$KEYCLOAK_URL" | wrangler secret put VITE_KEYCLOAK_URL --env production || {
    echo -e "${RED}❌ Failed to set VITE_KEYCLOAK_URL${NC}"
    exit 1
}

# Set API URL secret
echo "$BACKEND_URL" | wrangler secret put VITE_API_URL --env production || {
    echo -e "${RED}❌ Failed to set VITE_API_URL${NC}"
    exit 1
}

echo -e "${GREEN}✅ Cloudflare secrets set${NC}"

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}

# Deploy to Cloudflare Workers
echo "Deploying to Cloudflare Workers..."
wrangler deploy --env production || {
    echo -e "${RED}❌ Failed to deploy to Cloudflare Workers${NC}"
    exit 1
}

echo -e "${GREEN}✅ Frontend deployed successfully${NC}"

cd ..

echo ""
echo "============================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo -e "${GREEN}All services deployed successfully!${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Keycloak:${NC}"
echo "  URL: $KEYCLOAK_URL"
echo "  Admin: admin"
echo "  Password: $KC_ADMIN_PASSWORD"
echo "  Admin Console: $KEYCLOAK_URL/admin"
echo ""
echo -e "${BLUE}Backend:${NC}"
echo "  URL: $BACKEND_URL"
echo "  API: $BACKEND_URL/api"
echo ""
echo -e "${BLUE}Frontend:${NC}"
echo "  URL: https://lumora.aihack.workers.dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. ✅ Configure Keycloak redirect URIs:"
echo "   - Go to: $KEYCLOAK_URL/admin"
echo "   - Login with admin credentials"
echo "   - Clients → lumora-frontend → Add redirect URI:"
echo "     https://lumora.aihack.workers.dev/*"
echo ""
echo "2. ✅ Test the deployment:"
echo "   - Visit: https://lumora.aihack.workers.dev"
echo "   - Click 'Sign In'"
echo "   - Login with: sailesh.sharma@gmail.com / Admin@123"
echo ""
echo "3. ✅ Update backend CORS (if needed):"
echo "   - Ensure backend allows: https://lumora.aihack.workers.dev"
echo ""
echo "📚 Documentation:"
echo "  - Deployment checklist: PRODUCTION_DEPLOYMENT_CHECKLIST.md"
echo "  - Keycloak guide: KEYCLOAK_CLOUDFLARE_DEPLOYMENT.md"
echo ""
echo "🎉 Your app is live! Visit: https://lumora.aihack.workers.dev"
echo ""
