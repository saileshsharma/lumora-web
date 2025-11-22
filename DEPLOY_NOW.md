# 🚀 Deploy Lumora to Production - Step by Step

**Status:** Ready to Deploy
**Estimated Time:** 30-45 minutes

---

## ✅ Prerequisites Verified

- ✅ Railway CLI: Logged in as sailesh.sharma@gmail.com
- ✅ Wrangler CLI: Logged in to Cloudflare
- ✅ Frontend URL: https://lumora.aihack.workers.dev
- ✅ All configuration files ready

---

## 📝 Deployment Steps

### STEP 1: Create Railway Project (5 min)

**Option A: Create New Project**
```bash
cd /Users/yatika/prod-outfit/AI-Outfit-Assistant/outfit-assistant
railway init --name lumora-production
```

**Option B: Link Existing Project**
```bash
railway link
# Select from: distinguished-analysis, vigilant-exploration, athletic-eagerness, adorable-transformation
```

**Verify:**
```bash
railway status
```

---

### STEP 2: Add PostgreSQL Database (2 min)

**Create database:**
```bash
railway add --database postgres
```

**Verify:**
```bash
railway service list
# Should show: postgres
```

---

### STEP 3: Deploy Keycloak (10 min)

**Create Keycloak service:**
```bash
railway service create keycloak
```

**Set environment variables:**

Go to Railway Dashboard → Select project → keycloak service → Variables

Add these variables:
```bash
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=Admin@123
KC_HOSTNAME_STRICT=false
KC_PROXY=edge
KC_HTTP_ENABLED=true
KC_DB=postgres
KC_HEALTH_ENABLED=true
KC_METRICS_ENABLED=true
```

**Link to PostgreSQL:**

In Variables tab, click "Add Reference" → Select PostgreSQL

Add database connection variables:
```bash
KC_DB_URL_HOST=${PGHOST}
KC_DB_URL_DATABASE=${PGDATABASE}
KC_DB_USERNAME=${PGUSER}
KC_DB_PASSWORD=${PGPASSWORD}
```

**Configure build settings:**

Settings → Build:
- Builder: Dockerfile
- Dockerfile Path: Dockerfile.keycloak

**Deploy:**
```bash
railway up --service keycloak --dockerfile Dockerfile.keycloak
```

**Generate domain:**

Settings → Networking → Generate Domain

**Save the URL:** (example: `lumora-keycloak.up.railway.app`)

**Test:**
```bash
curl https://[your-keycloak-domain]/health/ready
# Should return: {"status":"UP"}
```

---

### STEP 4: Configure Keycloak (10 min)

**Access Admin Console:**
```
URL: https://[your-keycloak-domain]/admin
Username: admin
Password: Admin@123
```

**Configure lumora realm:**

1. Select "lumora" realm (or create if not exists)

**Configure frontend client:**

Clients → lumora-frontend → Settings:
```
Client Type: Public
Valid Redirect URIs:
  - https://lumora.aihack.workers.dev/*
  - http://localhost:5174/*

Web Origins:
  - https://lumora.aihack.workers.dev
  - http://localhost:5174

Save
```

**Configure backend client:**

Clients → lumora-backend → Settings:
```
Client Type: Confidential
Valid Redirect URIs:
  - https://[your-backend].up.railway.app/*
  - http://localhost:5001/*

Web Origins:
  - https://[your-backend].up.railway.app
  - http://localhost:5001

Save
```

Credentials tab → Copy **Client Secret** (save for next step!)

---

### STEP 5: Deploy Backend (8 min)

**Create backend service:**
```bash
railway service create backend
```

**Set environment variables:**

Railway Dashboard → backend service → Variables:
```bash
KEYCLOAK_SERVER_URL=https://[your-keycloak-domain]
KEYCLOAK_REALM=lumora
KEYCLOAK_CLIENT_ID=lumora-backend
KEYCLOAK_CLIENT_SECRET=[paste-from-step-4]
USE_KEYCLOAK=true
```

**Deploy:**
```bash
railway up --service backend -d ./backend
```

**Generate domain:**

Settings → Networking → Generate Domain

**Save the URL:** (example: `lumora-backend.up.railway.app`)

**Test:**
```bash
curl https://[your-backend-domain]/api/health
# Should return: {"status":"ok"}
```

---

### STEP 6: Deploy Frontend to Cloudflare (5 min)

**Set secrets:**
```bash
cd frontend

# Set Keycloak URL
echo "https://[your-keycloak-domain]" | wrangler secret put VITE_KEYCLOAK_URL

# Set Backend URL
echo "https://[your-backend-domain]" | wrangler secret put VITE_API_URL
```

**Install dependencies:**
```bash
npm install
```

**Build:**
```bash
npm run build
```

**Deploy:**
```bash
wrangler deploy
```

**Verify:**
```bash
curl -I https://lumora.aihack.workers.dev
# Should return: 200 OK
```

---

### STEP 7: Final Testing (5 min)

**Test 1: Frontend loads**
- Visit: https://lumora.aihack.workers.dev
- Should see: Beautiful Lumora login page ✅

**Test 2: Authentication flow**
1. Click "Sign In"
2. Redirects to Keycloak ✅
3. Enter: sailesh.sharma@gmail.com / Admin@123
4. Redirects back to app ✅
5. User authenticated ✅

**Test 3: API integration**
- Open DevTools → Network
- Perform action (e.g., generate outfit)
- Check request headers include: `Authorization: Bearer ...` ✅

**Test 4: Token refresh**
- Keep app open for 5+ minutes
- Perform another action
- Should work without re-login ✅

---

## 📊 Deployment Summary

After completion, you'll have:

| Service | URL |
|---------|-----|
| **Keycloak** | `https://[keycloak-domain].up.railway.app` |
| **Keycloak Admin** | `https://[keycloak-domain].up.railway.app/admin` |
| **Backend** | `https://[backend-domain].up.railway.app` |
| **Frontend** | `https://lumora.aihack.workers.dev` |

**Credentials:**
- Keycloak Admin: admin / Admin@123
- Test User: sailesh.sharma@gmail.com / Admin@123

---

## 🎉 Success!

When all tests pass:
✅ Production deployment complete!
✅ All 3 services running
✅ End-to-end authentication working
✅ App live at: https://lumora.aihack.workers.dev

---

## 🐛 Troubleshooting

**If something fails, check:**

1. Railway logs: `railway logs --service [service-name]`
2. Keycloak admin console for configuration
3. Browser DevTools console for frontend errors
4. Environment variables are set correctly

**Common issues:**
- "Invalid redirect URI" → Add production URL to Keycloak client
- CORS error → Check backend CORS includes Cloudflare Workers URL
- Token validation fails → Verify client secret matches

---

## 📞 Need Help?

Refer to:
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Detailed checklist
- `KEYCLOAK_CLOUDFLARE_DEPLOYMENT.md` - Platform-specific guide
- `DEPLOYMENT_QUICK_START.md` - Quick reference

---

**Ready to deploy! Start with STEP 1 above. 🚀**
