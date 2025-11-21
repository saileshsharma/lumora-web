# Railway Deployment Guide - AI Outfit Assistant

Complete step-by-step guide to deploy your AI Outfit Assistant to Railway.

## Prerequisites

- Railway account ([Sign up free](https://railway.app))
- GitHub account
- Your API keys ready:
  - OpenAI API Key
  - FAL API Key
  - NanoBanana API Key

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Commit all changes to Git:**

```bash
cd /Users/yatika/prod-outfit/AI-Outfit-Assistant/outfit-assistant

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Prepare for Railway deployment"

# Push to GitHub
git push origin main
```

If you haven't initialized git yet:

```bash
git init
git add .
git commit -m "Initial commit - Railway deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your `AI-Outfit-Assistant` repository
6. Railway will automatically detect your project

### Step 3: Configure Environment Variables

In the Railway dashboard:

1. Click on your service
2. Go to "Variables" tab
3. Add the following environment variables:

```env
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
FAL_API_KEY=YOUR_ACTUAL_FAL_KEY_HERE
NANOBANANA_API_KEY=YOUR_ACTUAL_NANOBANANA_KEY_HERE
FLASK_ENV=production
FLASK_DEBUG=False
```

**Important:** Click "Add" after each variable, then click "Deploy" to apply changes.

### Step 4: Configure Build Settings (Optional)

Railway should auto-detect the configuration from `railway.json` and `nixpacks.toml`, but you can verify:

1. Go to "Settings" tab
2. Check "Build Command":
   - Should install both Python and Node dependencies
   - Should build the frontend

3. Check "Start Command":
   - Should be: `cd backend && python app.py`
   - Or: `python backend/app.py`

### Step 5: Deploy

1. Railway will automatically start building and deploying
2. Watch the deployment logs in real-time
3. Build process takes approximately 3-5 minutes
4. Wait for "Success" message

### Step 6: Access Your Application

1. Once deployed, Railway will provide a URL like:
   - `https://your-app-name.railway.app`

2. Click on "Settings" → "Domains" to see your domain
3. You can also add a custom domain here

### Step 7: Test Your Deployment

1. Open the Railway URL in your browser
2. You should see the login page
3. Login with any email/password (demo mode)
4. Test all features:
   - Outfit Rater
   - Outfit Generator
   - Fashion Arena
   - Team Page

## Troubleshooting

### Build Fails

**Check the logs:**
1. Go to your service in Railway
2. Click "Deployments"
3. Click on the failed deployment
4. Review the build logs

**Common issues:**

1. **Missing dependencies:**
   ```bash
   # Make sure frontend/package.json and backend/requirements.txt are up to date
   ```

2. **Build timeout:**
   - Railway has a build timeout limit
   - Check if your build is taking too long

3. **Frontend build fails:**
   ```bash
   # Locally test the frontend build
   cd frontend
   npm run build
   ```

### Application Crashes

**Check runtime logs:**
1. Go to service → "Logs"
2. Look for Python errors

**Common issues:**

1. **Missing environment variables:**
   - Verify all API keys are set
   - Check variable names match exactly

2. **Frontend files not found:**
   - Ensure frontend built successfully
   - Check `frontend/dist` exists after build

3. **Port issues:**
   - Railway automatically sets the `PORT` environment variable
   - App should use `os.getenv('PORT', 5001)`

### API Not Working

1. **Check CORS settings:**
   - Railway domain should be allowed in backend/app.py

2. **Test API endpoint:**
   ```bash
   curl https://your-app.railway.app/api/health
   ```

3. **Check API keys:**
   - Verify they're correctly set in Railway dashboard

### Slow Performance

1. **Upgrade Railway plan:**
   - Free tier has limitations
   - Consider upgrading for better performance

2. **Check API rate limits:**
   - OpenAI, FAL, NanoBanana may have rate limits

3. **Optimize images:**
   - Large images slow down processing

## Advanced Configuration

### Custom Domain

1. Go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your custom domain
4. Update DNS records as instructed by Railway
5. Wait for SSL certificate provisioning

### Environment-Specific Settings

For staging vs production:

```env
# Production
FLASK_ENV=production
FLASK_DEBUG=False

# Staging
FLASK_ENV=development
FLASK_DEBUG=True
```

### Monitoring and Logs

1. **View logs:**
   - Railway dashboard → "Logs" tab
   - Real-time streaming

2. **Metrics:**
   - Railway dashboard → "Metrics" tab
   - CPU, Memory, Network usage

3. **Alerts:**
   - Set up alerts for crashes
   - Email/Slack notifications

### Database (Future Enhancement)

If you want to add a database:

1. Click "New" in Railway dashboard
2. Select "Database" → "PostgreSQL" or "MySQL"
3. Railway will provide connection string
4. Add to environment variables

## Cost Optimization

### Free Tier Limits

Railway free tier includes:
- $5 free credit per month
- No credit card required
- Auto-sleep after inactivity

### Tips to Save Credits:

1. **Use wisely:**
   - App sleeps when not in use
   - Wakes up on first request (may take 10-20 seconds)

2. **Optimize builds:**
   - Fewer deployments = less build time
   - Test locally before deploying

3. **Monitor usage:**
   - Check usage in Railway dashboard
   - Set up budget alerts

## Updating Your Application

### Deploy New Changes

1. **Make changes locally**
2. **Test thoroughly**
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. **Railway auto-deploys:**
   - Automatic deployment on push to main branch
   - Monitor deployment in Railway dashboard

### Rollback

If something goes wrong:

1. Go to "Deployments" tab
2. Find a working deployment
3. Click "⋮" → "Redeploy"

## Health Checks

Railway monitors your app health using:

```bash
GET https://your-app.railway.app/api/health
```

Response:
```json
{
  "status": "healthy",
  "message": "Outfit Assistant API is running"
}
```

## Security Best Practices

1. **Never commit API keys:**
   - Use `.env` for local development
   - Use Railway Variables for production
   - Add `.env` to `.gitignore`

2. **Use HTTPS only:**
   - Railway provides free SSL
   - Enforce HTTPS in production

3. **Rate limiting:**
   - Consider adding rate limiting
   - Protect against abuse

4. **Regular updates:**
   - Keep dependencies updated
   - Monitor security advisories

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Railway Status:** https://status.railway.app

## Deployment Checklist

- [ ] All code committed and pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Deployment successful
- [ ] Health check passes
- [ ] Login page accessible
- [ ] Outfit Rater works
- [ ] Outfit Generator works
- [ ] Fashion Arena works
- [ ] Team page displays
- [ ] All API endpoints responding
- [ ] No console errors
- [ ] Custom domain configured (optional)

## Next Steps

After successful deployment:

1. **Share your app:**
   - Share the Railway URL with users
   - Get feedback

2. **Monitor performance:**
   - Check Railway metrics
   - Watch for errors in logs

3. **Plan for scale:**
   - Monitor usage
   - Consider upgrading plan if needed

4. **Add features:**
   - Continue development
   - Deploy updates easily

Congratulations! Your AI Outfit Assistant is now live on Railway! 🎉
