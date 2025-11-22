# CloudFlare Pages Deployment Guide

This guide explains how to deploy the frontend to CloudFlare Pages while keeping the backend on Railway.

## Architecture

- **Frontend**: CloudFlare Pages (Static Site)
- **Backend**: Railway (Flask API)
- **Database**: Railway (JSON files)

## Prerequisites

1. CloudFlare account
2. GitHub repository connected
3. Railway backend deployed at: `https://web-production-c70ba.up.railway.app`

## CloudFlare Pages Setup

### Via CloudFlare Dashboard (Recommended)

1. **Login to CloudFlare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to "Workers & Pages"

2. **Create New Pages Project**
   - Click "Create application" → "Pages"
   - Connect to GitHub
   - Select repository: `saileshsharma/lumora-web`
   - Select branch: `main`

3. **Build Configuration**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: outfit-assistant/frontend
   Node version: 20 (automatically detected from .node-version)
   ```

4. **Environment Variables**
   Add the following environment variable:
   ```
   VITE_API_URL = https://web-production-c70ba.up.railway.app/api
   ```

5. **Build Settings (Important!)**
   - **DO NOT** add a custom deploy command
   - CloudFlare Pages automatically handles deployment after build
   - Leave "Deploy command" empty or set to default

6. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your site will be live at: `https://lumora-frontend.pages.dev`

## Build Settings Summary

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `outfit-assistant/frontend` |
| **Node version** | 20 (see `.node-version`) |
| **Deploy command** | Leave empty (automatic) |
| **Environment variables** | `VITE_API_URL=https://web-production-c70ba.up.railway.app/api` |

## Custom Domain (Optional)

1. **Add Custom Domain**
   - In CloudFlare Pages dashboard
   - Go to "Custom domains"
   - Add your domain (e.g., `app.yourdomain.com`)
   - Update DNS as instructed

2. **Update CORS on Backend**
   - Add your custom domain to allowed origins in `backend/app.py`
   ```python
   allowed_origins = [
       "https://your-custom-domain.com",
       # ... other origins
   ]
   ```

## Verification

After deployment, verify:

1. ✅ Frontend loads at CloudFlare URL
2. ✅ API calls work (check browser console)
3. ✅ Fashion Arena loads data
4. ✅ Outfit Rater/Generator work
5. ✅ Image uploads work

## Troubleshooting

### Build Fails with TypeScript Errors
- Ensure all TypeScript errors are fixed locally
- Run `npm run build` locally first

### API Calls Fail (CORS Error)
- Check CloudFlare URL is in backend CORS config
- Verify Railway backend is running
- Check environment variable `VITE_API_URL` is set correctly

### 404 on Page Refresh
- CloudFlare Pages handles SPAs automatically
- No additional configuration needed for React Router

### Images Not Loading
- Check Fashion Arena database exists on Railway
- Verify image URLs are accessible

## Monitoring

- **CloudFlare Analytics**: View in Pages dashboard
- **Backend Logs**: Check Railway logs
- **Error Tracking**: Browser console for frontend errors

## Continuous Deployment

CloudFlare Pages automatically deploys when you push to GitHub:
1. Push changes to `main` branch
2. CloudFlare detects changes
3. Builds and deploys automatically
4. Live in ~2-3 minutes

## Cost

- **CloudFlare Pages**: Free tier includes:
  - Unlimited requests
  - Unlimited bandwidth
  - 500 builds/month
  - 100 custom domains

- **Railway Backend**:
  - $5/month after free tier
  - 500 hours execution time

## Next Steps

1. Deploy to CloudFlare Pages
2. Test all features
3. Add custom domain (optional)
4. Set up monitoring/analytics
5. Configure error tracking

---

**Note**: This is a JAMstack architecture:
- **J**avaScript (React frontend on CloudFlare)
- **A**PIs (Flask backend on Railway)
- **M**arkup (Static HTML/CSS from Vite build)
