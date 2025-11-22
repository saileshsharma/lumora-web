#!/bin/bash

# Lumora Frontend - Production Deployment Script
# Deploys frontend to Cloudflare Workers with Keycloak integration

set -e  # Exit on error

echo "🚀 Lumora Frontend - Production Deployment"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found${NC}"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

echo -e "${GREEN}✅ Wrangler CLI found${NC}"
echo ""

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare${NC}"
    echo "Please login first:"
    echo "  wrangler login"
    exit 1
fi

echo -e "${GREEN}✅ Logged in to Cloudflare${NC}"
echo ""

# Check environment variables
echo "📋 Checking required environment variables..."
echo ""

# Check for Keycloak URL
if ! wrangler secret list | grep -q VITE_KEYCLOAK_URL; then
    echo -e "${YELLOW}⚠️  VITE_KEYCLOAK_URL secret not set${NC}"
    echo ""
    read -p "Enter your Keycloak server URL (e.g., https://your-keycloak.up.railway.app): " KEYCLOAK_URL

    if [ -z "$KEYCLOAK_URL" ]; then
        echo -e "${RED}❌ Keycloak URL is required${NC}"
        exit 1
    fi

    echo "Setting VITE_KEYCLOAK_URL secret..."
    echo "$KEYCLOAK_URL" | wrangler secret put VITE_KEYCLOAK_URL
    echo -e "${GREEN}✅ VITE_KEYCLOAK_URL set${NC}"
else
    echo -e "${GREEN}✅ VITE_KEYCLOAK_URL already set${NC}"
fi

# Check for API URL
if ! wrangler secret list | grep -q VITE_API_URL; then
    echo -e "${YELLOW}⚠️  VITE_API_URL secret not set${NC}"
    echo ""
    read -p "Enter your backend API URL (e.g., https://your-backend.up.railway.app): " API_URL

    if [ -z "$API_URL" ]; then
        echo -e "${RED}❌ API URL is required${NC}"
        exit 1
    fi

    echo "Setting VITE_API_URL secret..."
    echo "$API_URL" | wrangler secret put VITE_API_URL
    echo -e "${GREEN}✅ VITE_API_URL set${NC}"
else
    echo -e "${GREEN}✅ VITE_API_URL already set${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building production bundle..."
npm run build

echo ""
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy --env production

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "🎉 Your app is live at: https://lumora.aihack.workers.dev"
echo ""
echo "📝 Next steps:"
echo "  1. Visit https://lumora.aihack.workers.dev"
echo "  2. Click 'Sign In' to test Keycloak authentication"
echo "  3. Verify the redirect flow works correctly"
echo ""
echo "🔧 If you encounter issues:"
echo "  - Check Keycloak redirect URIs include: https://lumora.aihack.workers.dev/*"
echo "  - Check backend CORS includes: https://lumora.aihack.workers.dev"
echo "  - Check all environment variables are set correctly"
echo ""
