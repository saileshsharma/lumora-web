#!/bin/bash

# AI Outfit Assistant - Railway Deployment Script
# This script automates the deployment process to Railway

set -e  # Exit on error

echo "🚀 AI Outfit Assistant - Railway Deployment"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if git is initialized
echo -e "${YELLOW}Step 1: Checking Git repository...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Not a git repository. Initializing...${NC}"
    git init
    git branch -M main
fi
echo -e "${GREEN}✓ Git repository ready${NC}"
echo ""

# Step 2: Build frontend to verify everything works
echo -e "${YELLOW}Step 2: Building frontend...${NC}"
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed. Please fix errors before deploying.${NC}"
    exit 1
fi
cd ..
echo ""

# Step 3: Check for .env file and remind about environment variables
echo -e "${YELLOW}Step 3: Checking environment variables...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ No .env file found (this is OK for deployment)${NC}"
fi
echo -e "${GREEN}✓ Remember to set environment variables in Railway dashboard:${NC}"
echo "  - OPENAI_API_KEY"
echo "  - FAL_API_KEY"
echo "  - NANOBANANA_API_KEY"
echo "  - FLASK_ENV=production"
echo "  - FLASK_DEBUG=False"
echo ""

# Step 4: Stage all changes
echo -e "${YELLOW}Step 4: Staging changes...${NC}"
git add .
echo -e "${GREEN}✓ Changes staged${NC}"
echo ""

# Step 5: Show what will be committed
echo -e "${YELLOW}Step 5: Files to be committed:${NC}"
git status --short
echo ""

# Step 6: Commit
echo -e "${YELLOW}Step 6: Creating commit...${NC}"
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Deploy to Railway with frontend and backend"
fi

git commit -m "$commit_message" || echo -e "${YELLOW}⚠ No changes to commit${NC}"
echo -e "${GREEN}✓ Commit created${NC}"
echo ""

# Step 7: Check for remote
echo -e "${YELLOW}Step 7: Checking remote repository...${NC}"
if ! git remote | grep -q 'origin'; then
    echo -e "${RED}No 'origin' remote found.${NC}"
    read -p "Enter your GitHub repository URL: " repo_url
    git remote add origin "$repo_url"
    echo -e "${GREEN}✓ Remote added${NC}"
else
    echo -e "${GREEN}✓ Remote repository configured${NC}"
fi
echo ""

# Step 8: Push to GitHub
echo -e "${YELLOW}Step 8: Pushing to GitHub...${NC}"
echo "This may take a moment..."
git push origin main --force || git push -u origin main
echo -e "${GREEN}✓ Pushed to GitHub${NC}"
echo ""

# Step 9: Deployment instructions
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Code is ready for Railway deployment!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Go to https://railway.app"
echo "2. Click 'Start a New Project'"
echo "3. Select 'Deploy from GitHub repo'"
echo "4. Choose your repository"
echo "5. Add environment variables in Railway dashboard:"
echo "   • OPENAI_API_KEY"
echo "   • FAL_API_KEY"
echo "   • NANOBANANA_API_KEY"
echo "   • FLASK_ENV=production"
echo "   • FLASK_DEBUG=False"
echo "6. Railway will automatically deploy!"
echo ""
echo -e "${GREEN}Your app will be live at: https://your-app.railway.app${NC}"
echo ""
echo "📖 For detailed instructions, see RAILWAY_DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${GREEN}Happy deploying! 🎉${NC}"
