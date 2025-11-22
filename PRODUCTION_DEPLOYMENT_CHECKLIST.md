# Lumora Production Deployment Checklist

**Last Updated:** November 22, 2025
**Frontend:** https://lumora.aihack.workers.dev/
**Status:** Ready for Keycloak Integration

---

## 📋 Pre-Deployment Checklist

### 1. Keycloak Server Setup ☐

#### Deploy Keycloak to Railway (Recommended)

```bash
# Time: ~15 minutes
# Cost: $0-10/month
```

**Steps:**
- [ ] Create Railway account at https://railway.app
- [ ] Create new project → "Deploy from GitHub repo"
- [ ] Add PostgreSQL database service
- [ ] Add Keycloak service using `Dockerfile.keycloak`
- [ ] Set environment variables in Railway:
  ```bash
  KEYCLOAK_ADMIN=admin
  KEYCLOAK_ADMIN_PASSWORD=<strong-password>
  KC_HOSTNAME_STRICT=false
  KC_PROXY=edge
  KC_HTTP_ENABLED=true
  ```
- [ ] Deploy and wait for Keycloak to be ready
- [ ] Generate public domain (e.g., `your-keycloak.up.railway.app`)
- [ ] Verify Keycloak is accessible via HTTPS

**Expected Result:**
```
✅ Keycloak running at: https://your-keycloak.up.railway.app
✅ Admin console accessible
✅ Health check passes: /health/ready
```

---

### 2. Keycloak Configuration ☐

#### Access Keycloak Admin Console

- [ ] Visit: `https://your-keycloak.up.railway.app`
- [ ] Login with admin credentials
- [ ] Navigate to "lumora" realm (or create if not exists)

#### Configure Frontend Client

**Client ID:** `lumora-frontend`

- [ ] Go to Clients → lumora-frontend (or create)
- [ ] Set **Client Type:** Public
- [ ] Set **Valid Redirect URIs:**
  ```
  https://lumora.aihack.workers.dev/*
  http://localhost:5174/*
  http://localhost:5173/*
  ```
- [ ] Set **Valid Post Logout Redirect URIs:**
  ```
  https://lumora.aihack.workers.dev/*
  http://localhost:5174/*
  ```
- [ ] Set **Web Origins:**
  ```
  https://lumora.aihack.workers.dev
  http://localhost:5174
  http://localhost:5173
  ```
- [ ] Enable **PKCE** (S256 method)
- [ ] Save changes

#### Configure Backend Client

**Client ID:** `lumora-backend`

- [ ] Go to Clients → lumora-backend (or create)
- [ ] Set **Client Type:** Confidential
- [ ] Set **Valid Redirect URIs:**
  ```
  https://your-backend.up.railway.app/*
  http://localhost:5001/*
  ```
- [ ] Set **Web Origins:**
  ```
  https://your-backend.up.railway.app
  http://localhost:5001
  ```
- [ ] Go to **Credentials** tab
- [ ] Copy **Client Secret** (you'll need this for backend)
- [ ] Save changes

#### Configure Realm Settings

- [ ] Go to Realm Settings → General
- [ ] Enable **User Registration** (if desired)
- [ ] Enable **Email as Username**
- [ ] Enable **Login with Email**

#### Create Test User (if not exists)

- [ ] Go to Users → Add user
- [ ] Username: `sailesh.sharma@gmail.com`
- [ ] Email: `sailesh.sharma@gmail.com`
- [ ] Email verified: ON
- [ ] Save
- [ ] Go to Credentials tab
- [ ] Set password: `Admin@123` (or your choice)
- [ ] Temporary: OFF
- [ ] Save

#### Assign Roles

- [ ] Go to Users → sailesh.sharma@gmail.com
- [ ] Go to Role mapping
- [ ] Assign roles: `admin`, `user`, `premium`

**Expected Result:**
```
✅ lumora-frontend client configured
✅ lumora-backend client configured
✅ Client secret copied
✅ Redirect URIs include Cloudflare Workers URL
✅ Test user created and configured
```

---

### 3. Backend Deployment ☐

#### Update Backend Environment Variables

**On Railway (Backend Service):**

- [ ] Add/update environment variables:
  ```bash
  # Keycloak Configuration
  KEYCLOAK_SERVER_URL=https://your-keycloak.up.railway.app
  KEYCLOAK_REALM=lumora
  KEYCLOAK_CLIENT_ID=lumora-backend
  KEYCLOAK_CLIENT_SECRET=<client-secret-from-step-2>
  USE_KEYCLOAK=true

  # CORS Configuration
  CORS_ORIGINS=https://lumora.aihack.workers.dev,http://localhost:5174
  ```

#### Update Backend CORS Settings

**In `backend/app.py`:**

- [ ] Verify CORS configuration includes:
  ```python
  CORS(app, resources={
      r"/api/*": {
          "origins": [
              "https://lumora.aihack.workers.dev",
              "https://your-backend.up.railway.app",
              "http://localhost:5174",
              "http://localhost:5173",
          ],
          "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          "allow_headers": ["Content-Type", "Authorization"],
          "supports_credentials": True
      }
  })
  ```

#### Deploy Backend

- [ ] Commit changes to git (if needed)
- [ ] Push to Railway or trigger redeploy
- [ ] Wait for deployment to complete
- [ ] Check backend logs for Keycloak initialization

**Expected Result:**
```
✅ Backend deployed successfully
✅ Logs show: "✓ Keycloak authentication enabled"
✅ Backend API accessible via HTTPS
✅ CORS configured correctly
```

---

### 4. Frontend Deployment ☐

#### Set Cloudflare Secrets

**Using Wrangler CLI:**

```bash
cd frontend

# Set Keycloak server URL
echo "https://your-keycloak.up.railway.app" | wrangler secret put VITE_KEYCLOAK_URL

# Set backend API URL
echo "https://your-backend.up.railway.app" | wrangler secret put VITE_API_URL
```

**Or use the deployment script:**

```bash
cd frontend
./deploy-production.sh
```

The script will:
- [ ] Check if wrangler is installed
- [ ] Check if logged in to Cloudflare
- [ ] Prompt for VITE_KEYCLOAK_URL if not set
- [ ] Prompt for VITE_API_URL if not set
- [ ] Install dependencies
- [ ] Build production bundle
- [ ] Deploy to Cloudflare Workers

**Manual Deployment Alternative:**

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Cloudflare Workers
wrangler deploy --env production
```

**Expected Result:**
```
✅ Frontend built successfully
✅ Deployed to Cloudflare Workers
✅ Live at: https://lumora.aihack.workers.dev
✅ Environment variables set correctly
```

---

### 5. Post-Deployment Verification ☐

#### Test 1: Frontend Loads

- [ ] Visit: https://lumora.aihack.workers.dev
- [ ] Should see Lumora login page
- [ ] Background animations work
- [ ] Logo and branding visible

**Expected:**
```
✅ Page loads without errors
✅ Beautiful Lumora design visible
✅ "Sign In" and "Create Account" buttons present
```

#### Test 2: Keycloak Redirect

- [ ] Click "Sign In" button
- [ ] Should redirect to Keycloak login page
- [ ] URL should be: `https://your-keycloak.up.railway.app/realms/lumora/...`

**Expected:**
```
✅ Redirects to Keycloak
✅ Shows Keycloak login form
✅ No redirect errors
```

#### Test 3: Authentication Flow

- [ ] On Keycloak page, enter credentials:
  - Email: `sailesh.sharma@gmail.com`
  - Password: `Admin@123`
- [ ] Click "Sign in"
- [ ] Should redirect back to: `https://lumora.aihack.workers.dev`

**Expected:**
```
✅ Login successful
✅ Redirects back to Lumora
✅ User is authenticated
✅ Main app interface loads
```

#### Test 4: API Integration

- [ ] Open browser DevTools → Console
- [ ] Watch network requests
- [ ] Perform an action that calls the backend API
- [ ] Check request headers

**Expected:**
```
✅ Requests include Authorization header
✅ Format: "Bearer eyJhbGciOiJSUzI1NiI..."
✅ Backend accepts requests
✅ No CORS errors
```

#### Test 5: Token Refresh

- [ ] Keep app open for 5+ minutes
- [ ] Perform another API action
- [ ] Token should auto-refresh

**Expected:**
```
✅ Token refreshed automatically
✅ No re-login required
✅ App continues to work
```

#### Test 6: Logout

- [ ] Click logout button
- [ ] Should clear session
- [ ] Redirect to login page

**Expected:**
```
✅ User logged out
✅ Returns to login page
✅ Token cleared
✅ Can log in again
```

---

## 🔒 Security Verification Checklist

### HTTPS Everywhere ☐

- [ ] Keycloak: `https://your-keycloak.up.railway.app` ✅
- [ ] Backend: `https://your-backend.up.railway.app` ✅
- [ ] Frontend: `https://lumora.aihack.workers.dev` ✅
- [ ] No HTTP connections in production ✅

### CORS Configuration ☐

- [ ] Only specific origins allowed (no wildcards) ✅
- [ ] Credentials enabled for authenticated requests ✅
- [ ] Proper headers allowed ✅

### Client Security ☐

- [ ] Frontend: Public client (no secret) ✅
- [ ] Frontend: PKCE enabled (S256) ✅
- [ ] Backend: Confidential client (with secret) ✅
- [ ] Client secret stored securely in environment variables ✅

### Token Security ☐

- [ ] Tokens use RS256 signing ✅
- [ ] Token expiry configured (default: 5 min) ✅
- [ ] Refresh tokens enabled ✅
- [ ] Auto-refresh before expiry ✅

---

## 🐛 Troubleshooting Guide

### Issue: "Invalid redirect URI"

**Symptoms:**
- Keycloak shows error after login
- Cannot redirect back to app

**Solution:**
1. Go to Keycloak Admin Console
2. Clients → lumora-frontend
3. Add to Valid Redirect URIs:
   ```
   https://lumora.aihack.workers.dev/*
   ```
4. Save and retry

---

### Issue: "CORS error"

**Symptoms:**
- Browser console shows CORS error
- API requests fail
- Error: "has been blocked by CORS policy"

**Solution:**
1. Check backend CORS configuration
2. Ensure it includes: `https://lumora.aihack.workers.dev`
3. Redeploy backend
4. Clear browser cache and retry

---

### Issue: "Cannot connect to Keycloak"

**Symptoms:**
- Frontend can't reach Keycloak
- Timeout errors

**Solution:**
1. Check Keycloak deployment status on Railway
2. Verify domain is generated
3. Test: `curl https://your-keycloak.up.railway.app/health/ready`
4. Check Railway logs for errors

---

### Issue: "Token validation failed"

**Symptoms:**
- Backend rejects requests
- 401 Unauthorized errors
- Logs: "Token validation failed"

**Solution:**
1. Verify client secret matches in backend env vars
2. Verify realm name is "lumora"
3. Verify Keycloak URL is HTTPS
4. Check backend logs for specific error
5. Ensure backend has `USE_KEYCLOAK=true`

---

### Issue: "Environment variables not working"

**Symptoms:**
- App uses default localhost values
- Keycloak URL wrong

**Solution for Cloudflare Workers:**

Environment variables in Cloudflare Workers must be set as **secrets** for VITE_ prefixed variables to work at runtime.

```bash
# Set secrets via wrangler CLI
echo "https://your-keycloak.up.railway.app" | wrangler secret put VITE_KEYCLOAK_URL
echo "https://your-backend.up.railway.app" | wrangler secret put VITE_API_URL

# Or use the deployment script
./deploy-production.sh
```

Then rebuild and redeploy:
```bash
npm run build
wrangler deploy --env production
```

---

## 📊 Deployment Summary

### Infrastructure

| Service | Platform | URL | Status |
|---------|----------|-----|--------|
| Keycloak | Railway | `https://your-keycloak.up.railway.app` | ☐ To Deploy |
| Backend | Railway | `https://your-backend.up.railway.app` | ✅ Deployed |
| Frontend | Cloudflare Workers | `https://lumora.aihack.workers.dev` | ✅ Deployed |

### Configuration

| Component | Setting | Value |
|-----------|---------|-------|
| Realm | Name | `lumora` |
| Frontend Client | ID | `lumora-frontend` |
| Frontend Client | Type | Public |
| Frontend Client | PKCE | Enabled (S256) |
| Backend Client | ID | `lumora-backend` |
| Backend Client | Type | Confidential |
| Backend Client | Secret | Set in env vars |

### Costs

| Service | Cost |
|---------|------|
| Keycloak (Railway) | $0-10/month |
| Backend (Railway) | Current plan |
| Frontend (Cloudflare Workers) | Free tier |
| **Total Additional** | **$0-10/month** |

---

## ✅ Final Checklist

Before marking deployment as complete:

- [ ] All pre-deployment steps completed
- [ ] Keycloak deployed and accessible
- [ ] Backend configured and deployed
- [ ] Frontend configured and deployed
- [ ] All 6 verification tests passed
- [ ] Security checklist verified
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Authentication flow works end-to-end
- [ ] Documentation updated

---

## 🎉 Success Criteria

**Deployment is successful when:**

✅ User visits https://lumora.aihack.workers.dev
✅ Sees beautiful Lumora login page
✅ Clicks "Sign In"
✅ Redirects to Keycloak
✅ Enters credentials
✅ Redirects back to Lumora
✅ Is authenticated and can use the app
✅ All API calls work with Keycloak tokens
✅ No errors in console or logs

---

## 📞 Support

**If you encounter issues:**

1. Check this troubleshooting guide first
2. Review Railway deployment logs
3. Check browser DevTools console
4. Review Keycloak admin logs
5. Check backend application logs

**Helpful Resources:**
- Railway Docs: https://docs.railway.app
- Keycloak Docs: https://www.keycloak.org/documentation
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/

---

**Ready to deploy! 🚀**

Use the deployment script for easy setup:
```bash
cd frontend
./deploy-production.sh
```

Or follow the manual steps in this checklist.
