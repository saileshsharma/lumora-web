# Deploy Frontend to Railway - Quick Guide

## Step 1: Push Frontend to GitHub

```bash
cd frontend
git init
git add .
git commit -m "Initial commit - Frontend for Railway"
git branch -M main
```

Create a new repository on GitHub (e.g., `outfit-assistant-frontend`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/outfit-assistant-frontend.git
git push -u origin main
```

## Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `outfit-assistant-frontend` repository
5. Railway will automatically detect and build your app!

## Step 3: Configure API Backend URL

After deployment, you'll get a URL like: `https://your-frontend.railway.app`

**Important:** Update your backend URL in the frontend code if needed:

In `frontend/src/services/api.ts`, the API points to your backend at:
- Currently: `http://localhost:5001` (for local development)
- You need to update this to your backend URL

## Step 4: Test Your Deployment

Visit your Railway URL and test:
- Login page loads
- Can navigate between pages
- Light/Dark mode works

**Note:** API calls will fail until you point to a live backend.

## Quick Deploy Script

```bash
#!/bin/bash
cd frontend
git add .
git commit -m "Update frontend"
git push origin main
# Railway automatically deploys on push!
```

## Troubleshooting

**Build fails?**
- Check Railway build logs
- Ensure `npm run build` works locally

**Port issues?**
- Railway sets PORT automatically
- Serve uses $PORT environment variable

**Can't connect to backend?**
- Update API_BASE_URL in src/services/api.ts
- Ensure backend CORS allows your Railway domain

## Environment Variables (Optional)

If you need environment variables:
1. Go to Railway dashboard → Variables
2. Add variables like `VITE_API_URL`
3. Use in code as `import.meta.env.VITE_API_URL`

That's it! Your frontend will be live on Railway! 🚀
