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
