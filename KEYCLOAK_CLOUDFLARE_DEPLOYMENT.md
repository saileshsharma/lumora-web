# Keycloak Deployment for Cloudflare Workers Frontend

**Frontend:** https://lumora.aihack.workers.dev/
**Goal:** Deploy Keycloak and connect it to your Cloudflare Workers frontend

---

## 🎯 Deployment Options

Keycloak requires a **persistent server** (not serverless), so we have these options:

### **Option 1: Railway (Recommended - Easiest) ⭐**
- **Cost:** Free tier available, then $5/month
- **Setup:** 10 minutes
- **Pros:** Simple, PostgreSQL included, automatic HTTPS
- **Cons:** Small resource limits on free tier

### **Option 2: Fly.io (Good Alternative)**
- **Cost:** Free tier available
- **Setup:** 15 minutes
- **Pros:** Global deployment, good performance
- **Cons:** Requires Docker knowledge

### **Option 3: Cloud Provider (AWS/GCP/Azure)**
- **Cost:** Variable ($10-50/month)
- **Setup:** 30-60 minutes
- **Pros:** Enterprise-grade, scalable
- **Cons:** More complex, more expensive

### **Option 4: Self-Host with Cloudflare Tunnel**
- **Cost:** Free (uses your server)
- **Setup:** 20 minutes
- **Pros:** Full control, free
- **Cons:** Need to maintain your own server

---

## 🚀 RECOMMENDED: Deploy to Railway

Railway is the easiest and most cost-effective option. Here's the complete guide:

### Step 1: Prepare Keycloak for Railway

**Create `railway.json` in project root:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "docker-compose -f docker-compose.keycloak.yml up",
    "healthcheckPath": "/health/ready",
    "healthcheckTimeout": 300
  }
}
```

**Create `Dockerfile.keycloak` for Railway:**
```dockerfile
FROM quay.io/keycloak/keycloak:23.0

# Environment variables will be set by Railway
ENV KC_DB=postgres
ENV KC_DB_URL_HOST=${PGHOST}
ENV KC_DB_URL_DATABASE=${PGDATABASE}
ENV KC_DB_USERNAME=${PGUSER}
ENV KC_DB_PASSWORD=${PGPASSWORD}
ENV KC_HOSTNAME_STRICT=false
ENV KC_PROXY=edge
ENV KC_HTTP_ENABLED=true

# Build Keycloak
RUN /opt/keycloak/bin/kc.sh build

# Start Keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", "--optimized"]
```

### Step 2: Deploy to Railway

1. **Go to Railway:** https://railway.app/

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository

3. **Add PostgreSQL:**
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will create database and set environment variables

4. **Add Keycloak Service:**
   - Click "+ New"
   - Select "Empty Service"
   - Name it "keycloak"

5. **Configure Keycloak Service:**
   - Go to service settings
   - Set "Root Directory" to `/` (or your Keycloak directory)
   - Add Dockerfile: `Dockerfile.keycloak`

6. **Set Environment Variables:**
   ```bash
   KEYCLOAK_ADMIN=admin
   KEYCLOAK_ADMIN_PASSWORD=<strong-password-here>
   KC_HOSTNAME_STRICT=false
   KC_PROXY=edge
   KC_HTTP_ENABLED=true
   ```

7. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - Railway will provide a URL like: `keycloak-production.up.railway.app`

8. **Enable Public Networking:**
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Your Keycloak URL: `https://your-keycloak.up.railway.app`

---

## 🔧 Configure Keycloak for Production

### Step 1: Access Keycloak Admin

1. Visit: `https://your-keycloak.up.railway.app`
2. Login with admin credentials
3. Go to **Clients** → **lumora-frontend**

### Step 2: Update Frontend Client

**Add Production URLs:**

**Valid Redirect URIs:**
```
https://lumora.aihack.workers.dev/*
http://localhost:5174/*
http://localhost:5173/*
```

**Valid Post Logout Redirect URIs:**
```
https://lumora.aihack.workers.dev/*
http://localhost:5174/*
```

**Web Origins:**
```
https://lumora.aihack.workers.dev
http://localhost:5174
http://localhost:5173
```

### Step 3: Update Backend Client

**Valid Redirect URIs:**
```
https://your-backend.up.railway.app/*
http://localhost:5001/*
```

**Web Origins:**
```
https://your-backend.up.railway.app
http://localhost:5001
```

---

## 🌐 Update Frontend for Production

### Step 1: Update Environment Variables

**For Cloudflare Workers, create `wrangler.toml`:**
```toml
name = "lumora-frontend"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
VITE_API_URL = "https://your-backend.up.railway.app"
VITE_KEYCLOAK_URL = "https://your-keycloak.up.railway.app"
VITE_KEYCLOAK_REALM = "lumora"
VITE_KEYCLOAK_CLIENT_ID = "lumora-frontend"
```

**Or use environment variables in Cloudflare Dashboard:**
1. Go to Cloudflare Dashboard
2. Select your Workers project
3. Settings → Variables
4. Add:
   - `VITE_KEYCLOAK_URL` = `https://your-keycloak.up.railway.app`
   - `VITE_KEYCLOAK_REALM` = `lumora`
   - `VITE_KEYCLOAK_CLIENT_ID` = `lumora-frontend`

### Step 2: Update Keycloak Config

**Update `frontend/src/config/keycloak.ts`:**
```typescript
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'https://your-keycloak.up.railway.app',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'lumora',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'lumora-frontend',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;

// ... rest of the file
```

### Step 3: Build and Deploy Frontend

```bash
cd frontend
npm run build
npx wrangler deploy
```

---

## 🔐 Update Backend for Production

### Step 1: Update Backend Environment

**On Railway (Backend service):**

Add environment variables:
```bash
KEYCLOAK_SERVER_URL=https://your-keycloak.up.railway.app
KEYCLOAK_REALM=lumora
KEYCLOAK_CLIENT_ID=lumora-backend
KEYCLOAK_CLIENT_SECRET=<your-client-secret>
USE_KEYCLOAK=true
```

### Step 2: Update CORS

**In `backend/app.py`:**
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

---

## 📋 Complete Deployment Checklist

### Keycloak Deployment
```
☐ Deploy Keycloak to Railway (or chosen platform)
☐ Access Keycloak admin console
☐ Create/verify "lumora" realm
☐ Update frontend client redirect URIs (add Cloudflare URL)
☐ Update backend client settings
☐ Copy backend client secret
☐ Test Keycloak is accessible via HTTPS
```

### Backend Configuration
```
☐ Update backend environment variables
☐ Add Keycloak server URL
☐ Add client secret
☐ Update CORS to include Cloudflare Workers URL
☐ Deploy backend to Railway
☐ Test backend API endpoints
```

### Frontend Configuration
```
☐ Update Keycloak URL in config
☐ Set production environment variables
☐ Update API URL to production backend
☐ Build frontend
☐ Deploy to Cloudflare Workers
☐ Test login flow
```

### Testing
```
☐ Visit https://lumora.aihack.workers.dev
☐ Click "Sign In"
☐ Should redirect to Keycloak
☐ Login with test credentials
☐ Should redirect back to Cloudflare Workers
☐ User should be authenticated
☐ API calls should include token
☐ Backend should validate token
```

---

## 🧪 Testing the Integration

### Test 1: Frontend to Keycloak

**Visit:**
```
https://lumora.aihack.workers.dev
```

**Expected:**
- Show Lumora login page
- Click "Sign In" → Redirects to Keycloak
- URL changes to: `https://your-keycloak.up.railway.app/realms/lumora/...`

### Test 2: Keycloak Login

**On Keycloak page:**
- Enter credentials
- Click login
- Should redirect back to `https://lumora.aihack.workers.dev`

### Test 3: API Calls

**Check browser console:**
```javascript
// Should see token in requests
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI...
```

### Test 4: Backend Validation

**Backend logs should show:**
```
✓ Keycloak authentication enabled
✓ Token validated successfully
✓ User authenticated: sailesh.sharma@gmail.com
```

---

## 🔒 Security Considerations

### HTTPS Only
- ✅ Keycloak: `https://your-keycloak.up.railway.app`
- ✅ Backend: `https://your-backend.up.railway.app`
- ✅ Frontend: `https://lumora.aihack.workers.dev`

### CORS Configuration
- ✅ Only allow specific origins
- ✅ No wildcards in production
- ✅ Credentials enabled for cookie-based auth

### Environment Variables
- ✅ Never commit secrets to git
- ✅ Use Railway environment variables
- ✅ Different secrets for dev/prod

### Client Configuration
- ✅ Frontend: Public client (no secret)
- ✅ Backend: Confidential client (with secret)
- ✅ PKCE enabled for frontend

---

## 💰 Cost Estimate

### Railway (Recommended)
- **Keycloak:** Free tier (512MB RAM, 1GB disk)
  - Or $5/month for hobby plan
- **PostgreSQL:** Free tier (512MB RAM, 1GB disk)
  - Or $5/month for hobby plan
- **Total:** $0-10/month

### Fly.io
- **Keycloak:** Free tier (256MB RAM)
  - Or $2-5/month
- **PostgreSQL:** Free tier
- **Total:** $0-5/month

---

## 🚀 Quick Start Guide

### 1. Deploy Keycloak to Railway (10 minutes)

```bash
# 1. Create account on Railway.app
# 2. Create new project from GitHub
# 3. Add PostgreSQL database
# 4. Add Keycloak service with Dockerfile
# 5. Set environment variables
# 6. Deploy and get URL
```

### 2. Configure Keycloak (5 minutes)

```bash
# 1. Visit https://your-keycloak.up.railway.app
# 2. Login as admin
# 3. Go to lumora-frontend client
# 4. Add: https://lumora.aihack.workers.dev/* to redirects
# 5. Save
```

### 3. Update Frontend (5 minutes)

```bash
# Update keycloak.ts
url: 'https://your-keycloak.up.railway.app'

# Deploy to Cloudflare
cd frontend
npm run build
npx wrangler deploy
```

### 4. Update Backend (5 minutes)

```bash
# On Railway backend service, add env vars:
KEYCLOAK_SERVER_URL=https://your-keycloak.up.railway.app
KEYCLOAK_REALM=lumora
KEYCLOAK_CLIENT_ID=lumora-backend
KEYCLOAK_CLIENT_SECRET=<secret>
USE_KEYCLOAK=true
```

### 5. Test (2 minutes)

```bash
# Visit https://lumora.aihack.workers.dev
# Click "Sign In"
# Login on Keycloak
# Redirected back to app
# Success! ✅
```

**Total Time:** 27 minutes
**Total Cost:** $0-10/month

---

## 📞 Troubleshooting

### "Invalid redirect URI"

**Problem:** Frontend can't redirect back from Keycloak

**Solution:**
1. Go to Keycloak Admin
2. Clients → lumora-frontend
3. Add to Valid Redirect URIs:
   ```
   https://lumora.aihack.workers.dev/*
   ```
4. Save

### "CORS Error"

**Problem:** Frontend can't call backend

**Solution:**
1. Update backend CORS to include:
   ```python
   "https://lumora.aihack.workers.dev"
   ```
2. Redeploy backend

### "Cannot connect to Keycloak"

**Problem:** Keycloak not accessible

**Solution:**
1. Check Railway deployment status
2. Check domain is generated
3. Test: `curl https://your-keycloak.up.railway.app/health/ready`
4. Check environment variables

### "Token validation failed"

**Problem:** Backend can't validate token

**Solution:**
1. Check client secret matches in backend
2. Check realm name is correct ("lumora")
3. Check Keycloak URL is HTTPS
4. Check backend logs for specific error

---

## 🎯 Next Steps

After deployment:

1. **✅ Change Default Passwords**
   - Keycloak admin password
   - User passwords

2. **✅ Configure SMTP**
   - For password reset emails
   - For email verification

3. **✅ Enable Social Login**
   - Google OAuth
   - GitHub OAuth

4. **✅ Customize Theme**
   - Match Lumora branding
   - Custom login page

5. **✅ Set Up Monitoring**
   - Railway metrics
   - Keycloak logs
   - Error tracking

6. **✅ Backup Configuration**
   - Export realm configuration
   - Document client secrets
   - Save in secure location

---

## 📚 Helpful Resources

**Railway:**
- Docs: https://docs.railway.app
- Community: https://railway.app/discord

**Keycloak:**
- Docs: https://www.keycloak.org/documentation
- Server Admin: https://www.keycloak.org/docs/latest/server_admin/

**Cloudflare Workers:**
- Docs: https://developers.cloudflare.com/workers/
- Wrangler: https://developers.cloudflare.com/workers/wrangler/

---

## 🎉 Summary

To deploy Keycloak with your Cloudflare Workers frontend:

1. **Deploy Keycloak** to Railway (easiest) or Fly.io
2. **Configure redirect URIs** to include `https://lumora.aihack.workers.dev/*`
3. **Update frontend** Keycloak config with production URL
4. **Update backend** environment variables
5. **Deploy frontend** to Cloudflare Workers
6. **Test** the complete authentication flow

**Estimated Time:** 30 minutes
**Estimated Cost:** $0-10/month
**Difficulty:** Easy (with Railway)

---

**Ready to deploy! 🚀**
