# 🚀 Lumora Production Deployment - Quick Start

**Date:** November 22, 2025
**Estimated Time:** 30-45 minutes

---

## 🎯 Deployment Options

### Option 1: Interactive Wizard (Recommended) ⭐

**Best for:** First-time deployment, step-by-step guidance

```bash
cd /Users/yatika/prod-outfit/AI-Outfit-Assistant/outfit-assistant
./deploy-interactive.sh
```

The wizard will guide you through:
1. ✅ Railway project setup
2. ✅ PostgreSQL database creation
3. ✅ Keycloak deployment
4. ✅ Keycloak configuration
5. ✅ Backend deployment
6. ✅ Frontend deployment to Cloudflare Workers

---

### Option 2: Fully Automated (Advanced)

**Best for:** Experienced users, faster deployment

```bash
cd /Users/yatika/prod-outfit/AI-Outfit-Assistant/outfit-assistant
./deploy-all-production.sh
```

⚠️ Note: This requires manual Keycloak configuration afterwards

---

### Option 3: Manual Deployment

**Best for:** Custom configuration, troubleshooting

Follow the detailed guide: `PRODUCTION_DEPLOYMENT_CHECKLIST.md`

---

## ✅ Prerequisites

Before starting, ensure you have:

- [x] Railway CLI installed and logged in
  ```bash
  railway whoami
  # Should show: sailesh.sharma@gmail.com
  ```

- [x] Wrangler CLI installed and logged in
  ```bash
  wrangler whoami
  # Should show: sailesh.sharma@gmail.com
  ```

- [x] Access to Cloudflare Workers
  - Frontend URL: https://lumora.aihack.workers.dev

- [x] Admin credentials ready
  - Email: sailesh.sharma@gmail.com
  - Default password: Admin@123 (change if desired)

---

## 📋 Deployment Checklist

### Phase 1: Railway Setup

- [ ] Create or select Railway project
- [ ] Add PostgreSQL database
- [ ] Generate public domains for services

### Phase 2: Keycloak

- [ ] Deploy Keycloak service
- [ ] Wait for health check to pass
- [ ] Access admin console
- [ ] Configure lumora realm
- [ ] Set up frontend client (public)
- [ ] Set up backend client (confidential)
- [ ] Copy backend client secret
- [ ] Add redirect URIs for production

### Phase 3: Backend

- [ ] Deploy backend service
- [ ] Set Keycloak environment variables
- [ ] Configure CORS for production
- [ ] Generate public domain
- [ ] Verify backend is running

### Phase 4: Frontend

- [ ] Set Cloudflare secrets (VITE_KEYCLOAK_URL, VITE_API_URL)
- [ ] Build production bundle
- [ ] Deploy to Cloudflare Workers
- [ ] Verify deployment

### Phase 5: Testing

- [ ] Visit https://lumora.aihack.workers.dev
- [ ] Click "Sign In"
- [ ] Login with Keycloak credentials
- [ ] Verify redirect back to app
- [ ] Test API calls with authentication
- [ ] Test token refresh
- [ ] Test logout

---

## 🔑 Important URLs

After deployment, you'll have:

| Service | URL Pattern | Example |
|---------|-------------|---------|
| **Keycloak** | `https://[name].up.railway.app` | `https://lumora-keycloak.up.railway.app` |
| **Keycloak Admin** | `https://[name].up.railway.app/admin` | `https://lumora-keycloak.up.railway.app/admin` |
| **Backend** | `https://[name].up.railway.app` | `https://lumora-backend.up.railway.app` |
| **Backend API** | `https://[name].up.railway.app/api` | `https://lumora-backend.up.railway.app/api` |
| **Frontend** | Fixed | `https://lumora.aihack.workers.dev` |

---

## 🔐 Keycloak Configuration Reference

### Frontend Client (lumora-frontend)

```
Client ID: lumora-frontend
Client Type: Public
Access Type: public

Valid Redirect URIs:
  - https://lumora.aihack.workers.dev/*
  - http://localhost:5174/*
  - http://localhost:5173/*

Valid Post Logout Redirect URIs:
  - https://lumora.aihack.workers.dev/*
  - http://localhost:5174/*

Web Origins:
  - https://lumora.aihack.workers.dev
  - http://localhost:5174
  - http://localhost:5173

Standard Flow: Enabled
Direct Access Grants: Enabled
PKCE: Enabled (S256)
```

### Backend Client (lumora-backend)

```
Client ID: lumora-backend
Client Type: Confidential
Access Type: confidential

Service Accounts Enabled: Yes
Authorization Enabled: Yes

Valid Redirect URIs:
  - https://[your-backend].up.railway.app/*
  - http://localhost:5001/*

Web Origins:
  - https://[your-backend].up.railway.app
  - http://localhost:5001

Copy the Client Secret from Credentials tab!
```

---

## 🌐 Environment Variables

### Backend (Railway)

```bash
# Keycloak Configuration
KEYCLOAK_SERVER_URL=https://[your-keycloak].up.railway.app
KEYCLOAK_REALM=lumora
KEYCLOAK_CLIENT_ID=lumora-backend
KEYCLOAK_CLIENT_SECRET=[client-secret-from-keycloak]
USE_KEYCLOAK=true

# CORS (already configured in code, but verify)
# Includes: https://lumora.aihack.workers.dev
```

### Frontend (Cloudflare Workers Secrets)

```bash
# Set via: echo "value" | wrangler secret put KEY_NAME

VITE_KEYCLOAK_URL=https://[your-keycloak].up.railway.app
VITE_API_URL=https://[your-backend].up.railway.app
VITE_KEYCLOAK_REALM=lumora  # (set in wrangler.toml)
VITE_KEYCLOAK_CLIENT_ID=lumora-frontend  # (set in wrangler.toml)
```

---

## 🧪 Testing the Deployment

### Test 1: Frontend Loads ✅

```bash
curl -I https://lumora.aihack.workers.dev
# Should return: 200 OK
```

**Browser:**
- Visit: https://lumora.aihack.workers.dev
- Should see: Beautiful Lumora login page
- No console errors

### Test 2: Keycloak Health ✅

```bash
curl https://[your-keycloak].up.railway.app/health/ready
# Should return: {"status":"UP"}
```

### Test 3: Backend Health ✅

```bash
curl https://[your-backend].up.railway.app/api/health
# Should return: {"status":"ok"}
```

### Test 4: Authentication Flow ✅

1. Visit: https://lumora.aihack.workers.dev
2. Click: "Sign In"
3. Redirects to: Keycloak login page
4. Enter credentials:
   - Email: sailesh.sharma@gmail.com
   - Password: Admin@123
5. Redirects back to: https://lumora.aihack.workers.dev
6. User authenticated ✅

### Test 5: API Integration ✅

**Open DevTools Console:**

```javascript
// Check token in requests
// Network tab → Select any API call → Headers
// Should see:
Authorization: Bearer eyJhbGci...
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid redirect URI"

**Symptom:** After Keycloak login, shows error

**Solution:**
1. Go to Keycloak Admin: `https://[keycloak]/admin`
2. Clients → lumora-frontend
3. Add to Valid Redirect URIs:
   ```
   https://lumora.aihack.workers.dev/*
   ```
4. Save

---

### Issue 2: CORS Error

**Symptom:** Browser console shows CORS error

**Solution:**
Verify backend `app.py` CORS configuration includes:
```python
"https://lumora.aihack.workers.dev"
```

---

### Issue 3: Environment Variables Not Working

**Symptom:** App uses localhost URLs in production

**Solution:**
For Cloudflare Workers, set as secrets:
```bash
echo "https://[keycloak-url]" | wrangler secret put VITE_KEYCLOAK_URL
echo "https://[backend-url]" | wrangler secret put VITE_API_URL
```

Then rebuild and redeploy:
```bash
cd frontend
npm run build
wrangler deploy
```

---

### Issue 4: Keycloak Won't Start

**Symptom:** Keycloak deployment fails or crashes

**Solution:**
1. Check Railway logs for errors
2. Verify PostgreSQL is connected
3. Ensure these variables are set:
   ```
   KC_DB_URL_HOST=${PGHOST}
   KC_DB_URL_DATABASE=${PGDATABASE}
   KC_DB_USERNAME=${PGUSER}
   KC_DB_PASSWORD=${PGPASSWORD}
   ```
4. Check Dockerfile.keycloak is used for build

---

### Issue 5: Backend Token Validation Fails

**Symptom:** 401 errors on API calls

**Solution:**
1. Verify client secret matches
2. Check `KEYCLOAK_SERVER_URL` is correct (HTTPS)
3. Check `USE_KEYCLOAK=true` is set
4. Check backend logs for specific error

---

## 📊 Cost Estimate

| Service | Platform | Cost |
|---------|----------|------|
| Keycloak | Railway | $0-5/month (512MB) |
| PostgreSQL | Railway | Free tier (included) |
| Backend | Railway | Existing deployment |
| Frontend | Cloudflare Workers | Free tier |
| **Total Additional** | | **$0-5/month** |

---

## 📞 Support & Documentation

**Deployment Guides:**
- This file: Quick start reference
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md`: Detailed checklist
- `KEYCLOAK_CLOUDFLARE_DEPLOYMENT.md`: Platform-specific guide

**Platform Documentation:**
- Railway: https://docs.railway.app
- Keycloak: https://www.keycloak.org/documentation
- Cloudflare Workers: https://developers.cloudflare.com/workers/

**Deployment Scripts:**
- `./deploy-interactive.sh`: Interactive wizard
- `./deploy-all-production.sh`: Automated deployment
- `./frontend/deploy-production.sh`: Frontend only

---

## 🎉 Success Criteria

Deployment is successful when:

✅ User visits https://lumora.aihack.workers.dev
✅ Sees Lumora login page (not errors)
✅ Clicks "Sign In" → Redirects to Keycloak
✅ Enters credentials → Successfully logs in
✅ Redirects back to Lumora app
✅ User is authenticated
✅ API calls include Bearer token
✅ Backend validates token
✅ No errors in console or logs

---

## 🚀 Ready to Deploy!

Choose your deployment method:

**Recommended for first-time:**
```bash
./deploy-interactive.sh
```

**For experienced users:**
```bash
./deploy-all-production.sh
```

**Estimated time:** 30-45 minutes

Good luck! 🎉
