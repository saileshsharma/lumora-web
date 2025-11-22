#!/bin/bash

# Push Frontend and Backend to Separate GitHub Repositories
# Frontend: https://github.com/saileshsharma/lumora-web
# Backend: https://github.com/saileshsharma/lumora-web-be

set -e

echo "🚀 Pushing Lumora to GitHub Repositories"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the current directory
MONO_REPO_DIR=$(pwd)
TEMP_DIR="/tmp/lumora-deploy-$(date +%s)"

echo -e "${BLUE}Step 1: Creating temporary directories${NC}"
mkdir -p "$TEMP_DIR/frontend"
mkdir -p "$TEMP_DIR/backend"

# Copy frontend files
echo -e "${BLUE}Step 2: Copying frontend files${NC}"
cp -r frontend/* "$TEMP_DIR/frontend/"
cp PRODUCTION_DEPLOYMENT_GUIDE.md "$TEMP_DIR/frontend/" || true
cp KEYCLOAK_SETUP_COMPLETE.md "$TEMP_DIR/frontend/" || true
cp README.md "$TEMP_DIR/frontend/README.md" || true

# Create frontend-specific README
cat > "$TEMP_DIR/frontend/README.md" << 'FRONTEND_README'
# Lumora - AI Outfit Assistant (Frontend)

🎨 **AI-Powered Fashion Assistant with Keycloak Authentication**

## Features

- 🔐 **Keycloak Authentication** - Secure OAuth2/OIDC login
- 👗 **Rate My Outfit** - AI-powered outfit analysis
- ✨ **Outfit Generator** - Create perfect outfits for any occasion
- 🏆 **Fashion Arena** - Community leaderboard
- 👥 **Style Squad** - Social fashion community
- 🛍️ **Shopping Integration** - Direct links to Amazon, Shein, Shopee, Lazada

## Tech Stack

- React 19 + TypeScript
- Vite
- Keycloak.js for authentication
- Zustand for state management
- CSS Modules for styling

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URLs

# Run development server
npm run dev
```

## Production Deployment

This frontend is designed to deploy to **Cloudflare Workers**.

See `PRODUCTION_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## Environment Variables

```bash
VITE_API_URL=https://your-backend.railway.app/api
VITE_KEYCLOAK_URL=https://your-keycloak.railway.app
VITE_KEYCLOAK_REALM=lumora
VITE_KEYCLOAK_CLIENT_ID=lumora-frontend
```

## Backend Repository

Backend API: https://github.com/saileshsharma/lumora-web-be

---

🤖 Built with AI assistance from Claude Code
FRONTEND_README

# Copy backend files
echo -e "${BLUE}Step 3: Copying backend files${NC}"
cp -r backend/* "$TEMP_DIR/backend/"
cp PRODUCTION_DEPLOYMENT_GUIDE.md "$TEMP_DIR/backend/" || true
cp KEYCLOAK_SETUP_COMPLETE.md "$TEMP_DIR/backend/" || true

# Create backend-specific README
cat > "$TEMP_DIR/backend/README.md" << 'BACKEND_README'
# Lumora - AI Outfit Assistant (Backend)

🚀 **AI-Powered Fashion API with Keycloak Integration**

## Features

- 🔐 **Keycloak Integration** - OAuth2/OIDC authentication
- 🤖 **OpenAI GPT-4 Vision** - Outfit analysis
- 🎨 **Nanobanana API** - Outfit generation
- 🖼️ **FAL.ai** - Image processing
- 📊 **Fashion Arena** - Community submissions
- 👥 **Style Squad** - Social features

## Tech Stack

- Python 3.11+
- Flask
- Keycloak Python Adapter
- OpenAI API
- Nanobanana API
- FAL.ai API

## Quick Start

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and Keycloak config

# Run development server
python app.py
```

## Production Deployment

This backend is designed to deploy to **Railway**.

See `PRODUCTION_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## Environment Variables

```bash
# API Keys
FAL_API_KEY=your-fal-api-key
NANOBANANA_API_KEY=your-nanobanana-key
OPENAI_API_KEY=your-openai-key

# Keycloak
KEYCLOAK_SERVER_URL=https://your-keycloak.railway.app
KEYCLOAK_REALM=lumora
KEYCLOAK_CLIENT_ID=lumora-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret
USE_KEYCLOAK=true

# Security
ADMIN_PASSWORD=your-admin-password
JWT_SECRET_KEY=your-jwt-secret

# Flask
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5001
```

## Frontend Repository

Frontend App: https://github.com/saileshsharma/lumora-web

---

🤖 Built with AI assistance from Claude Code
BACKEND_README

# Initialize frontend repo
echo -e "${BLUE}Step 4: Initializing frontend Git repository${NC}"
cd "$TEMP_DIR/frontend"
git init
git add -A
git commit -m "Initial commit: Lumora frontend with Keycloak authentication

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo -e "${GREEN}✅ Frontend repository initialized${NC}"

# Initialize backend repo
echo -e "${BLUE}Step 5: Initializing backend Git repository${NC}"
cd "$TEMP_DIR/backend"
git init
git add -A
git commit -m "Initial commit: Lumora backend API with Keycloak integration

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo -e "${GREEN}✅ Backend repository initialized${NC}"

# Instructions for manual GitHub push
echo ""
echo "========================================="
echo -e "${GREEN}✅ Repositories prepared successfully!${NC}"
echo "========================================="
echo ""
echo "📋 Next Steps (Manual):"
echo ""
echo "1️⃣  Push Frontend to GitHub:"
echo "   cd $TEMP_DIR/frontend"
echo "   git remote add origin https://github.com/saileshsharma/lumora-web.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2️⃣  Push Backend to GitHub:"
echo "   cd $TEMP_DIR/backend"
echo "   git remote add origin https://github.com/saileshsharma/lumora-web-be.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "========================================="
echo -e "${BLUE}Repository locations:${NC}"
echo "Frontend: $TEMP_DIR/frontend"
echo "Backend:  $TEMP_DIR/backend"
echo "========================================="
echo ""

# Return to original directory
cd "$MONO_REPO_DIR"

# Save paths for later use
echo "$TEMP_DIR" > .github-deploy-temp
echo -e "${GREEN}✅ Setup complete! Follow the manual steps above to push to GitHub.${NC}"
