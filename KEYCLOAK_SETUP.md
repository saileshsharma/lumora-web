# Keycloak Setup Guide for AI Outfit Assistant

## Overview

This guide walks you through setting up Keycloak as the Identity and Access Management (IAM) solution for the AI Outfit Assistant.

**What You'll Get:**
- ✅ Enterprise-grade authentication
- ✅ Role-based access control (RBAC)
- ✅ Social login (Google, Facebook, GitHub)
- ✅ Multi-factor authentication (MFA)
- ✅ Admin console for user management
- ✅ OAuth2/OIDC standard compliance

---

## Prerequisites

- Docker and Docker Compose installed
- At least 1GB RAM available
- Ports 8080 (Keycloak) available

**Check Docker:**
```bash
docker --version
docker-compose --version
```

---

## Phase 1: Deploy Keycloak (15 minutes)

### Step 1: Start Keycloak Services

```bash
# Navigate to project root
cd /Users/yatika/prod-outfit/AI-Outfit-Assistant/outfit-assistant

# Start Keycloak and PostgreSQL
docker-compose -f docker-compose.keycloak.yml up -d

# Check logs
docker-compose -f docker-compose.keycloak.yml logs -f keycloak
```

**Wait for this message:**
```
Keycloak 23.0.0 started in XXXms. Listening on: http://0.0.0.0:8080
```

**Press Ctrl+C to exit logs**

### Step 2: Verify Keycloak is Running

```bash
# Check services status
docker-compose -f docker-compose.keycloak.yml ps

# Test health endpoint
curl http://localhost:8080/health/ready
```

**Expected:** `{"status":"UP"}`

### Step 3: Access Admin Console

1. Open browser: **http://localhost:8080**
2. Click **"Administration Console"**
3. Login:
   - **Username:** `admin`
   - **Password:** `admin_change_in_production`

**✅ You should see the Keycloak Admin Console!**

---

## Phase 2: Configure Keycloak Realm (20 minutes)

### Step 1: Create Realm

1. **Hover over "master"** in top-left dropdown
2. Click **"Create Realm"**
3. Enter details:
   - **Realm name:** `lumora`
   - **Enabled:** ON
4. Click **"Create"**

### Step 2: Configure Realm Settings

1. Go to **Realm Settings** (left sidebar)
2. Click **"Login"** tab
3. Enable features:
   - ✅ User registration
   - ✅ Forgot password
   - ✅ Remember me
   - ✅ Email as username
   - ✅ Login with email
4. Click **"Save"**

### Step 3: Configure Email Settings (Optional but Recommended)

1. Go to **Realm Settings** → **Email** tab
2. Configure SMTP:
   ```
   Host: smtp.gmail.com (or your SMTP server)
   Port: 587
   From: noreply@lumora.com
   Enable StartTLS: ON
   Authentication: ON
   Username: your-email@gmail.com
   Password: your-app-password
   ```
3. Click **"Save"**
4. Click **"Test connection"**

**Note:** For Gmail, you need an [App Password](https://support.google.com/accounts/answer/185833)

---

## Phase 3: Create Client Application (15 minutes)

### Step 1: Create Client

1. Go to **Clients** (left sidebar)
2. Click **"Create client"**
3. **General Settings:**
   - **Client type:** OpenID Connect
   - **Client ID:** `lumora-frontend`
4. Click **"Next"**

### Step 2: Configure Capability

1. **Capability config:**
   - ✅ Client authentication: OFF (public client)
   - ✅ Authorization: OFF
   - ✅ Standard flow: ON
   - ✅ Direct access grants: ON
   - ✅ Implicit flow: OFF
   - ✅ Service accounts roles: OFF
2. Click **"Next"**

### Step 3: Login Settings

1. **Valid redirect URIs:**
   ```
   http://localhost:5174/*
   http://localhost:5173/*
   http://127.0.0.1:5174/*
   https://lumora.aihack.workers.dev/*
   https://your-production-domain.com/*
   ```

2. **Valid post logout redirect URIs:**
   ```
   http://localhost:5174/*
   http://localhost:5173/*
   http://127.0.0.1:5174/*
   https://lumora.aihack.workers.dev/*
   https://your-production-domain.com/*
   ```

3. **Web origins:**
   ```
   http://localhost:5174
   http://localhost:5173
   http://127.0.0.1:5174
   https://lumora.aihack.workers.dev
   https://your-production-domain.com
   ```

4. Click **"Save"**

### Step 4: Create Backend Client (for token validation)

1. Go to **Clients** → Click **"Create client"**
2. **General Settings:**
   - **Client ID:** `lumora-backend`
   - **Client type:** OpenID Connect
3. Click **"Next"**
4. **Capability config:**
   - ✅ Client authentication: ON (confidential)
   - ✅ Authorization: OFF
   - ✅ Service accounts roles: ON
5. Click **"Save"**
6. Go to **"Credentials"** tab
7. **Copy the Client Secret** (you'll need this for backend)

---

## Phase 4: Create Roles (10 minutes)

### Step 1: Create Realm Roles

1. Go to **Realm roles** (left sidebar)
2. Click **"Create role"**

**Create these roles:**

**Role 1: user**
- **Role name:** `user`
- **Description:** Regular user with basic access
- Click **"Save"**

**Role 2: admin**
- **Role name:** `admin`
- **Description:** Administrator with full access
- Click **"Save"**

**Role 3: premium**
- **Role name:** `premium`
- **Description:** Premium user with extended features
- Click **"Save"**

### Step 2: Set Default Roles

1. Go to **Realm settings** → **User registration** tab
2. **Default roles:** Add `user` role
3. Click **"Save"**

---

## Phase 5: Configure Social Login (Optional - 20 minutes)

### Google Login

1. Go to **Identity providers** (left sidebar)
2. Click **"Add provider"** → Select **"Google"**
3. Enter:
   - **Client ID:** (from Google Cloud Console)
   - **Client Secret:** (from Google Cloud Console)
4. Click **"Add"**

**Get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI:
   ```
   http://localhost:8080/realms/lumora/broker/google/endpoint
   ```

### GitHub Login

1. Go to **Identity providers**
2. Click **"Add provider"** → Select **"GitHub"**
3. Enter:
   - **Client ID:** (from GitHub OAuth Apps)
   - **Client Secret:** (from GitHub OAuth Apps)
4. Click **"Add"**

**Get GitHub OAuth credentials:**
1. Go to GitHub → Settings → Developer settings
2. OAuth Apps → New OAuth App
3. Authorization callback URL:
   ```
   http://localhost:8080/realms/lumora/broker/github/endpoint
   ```

---

## Phase 6: Create Test User (5 minutes)

### Manual User Creation

1. Go to **Users** (left sidebar)
2. Click **"Add user"**
3. Enter:
   - **Username:** `testuser@lumora.com`
   - **Email:** `testuser@lumora.com`
   - **First name:** Test
   - **Last name:** User
   - **Email verified:** ON
   - **Enabled:** ON
4. Click **"Create"**

### Set Password

1. Click on the created user
2. Go to **"Credentials"** tab
3. Click **"Set password"**
4. Enter:
   - **Password:** `Test123!`
   - **Password confirmation:** `Test123!`
   - **Temporary:** OFF
5. Click **"Save"**

### Assign Roles

1. Go to **"Role mapping"** tab
2. Click **"Assign role"**
3. Select **"user"** role
4. Click **"Assign"**

---

## Phase 7: Test Authentication (10 minutes)

### Test with Keycloak Account Console

1. Open new browser tab: **http://localhost:8080/realms/lumora/account**
2. Login with:
   - **Username:** `testuser@lumora.com`
   - **Password:** `Test123!`
3. You should see the Account Console

### Test Token Generation

```bash
# Get access token
curl -X POST \
  http://localhost:8080/realms/lumora/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=lumora-frontend' \
  -d 'username=testuser@lumora.com' \
  -d 'password=Test123!' \
  -d 'grant_type=password'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGc...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "...",
  "scope": "profile email"
}
```

**✅ If you see the token, Keycloak is working!**

---

## Configuration Summary

### Keycloak URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Admin Console | http://localhost:8080/admin | Manage users, roles, clients |
| Account Console | http://localhost:8080/realms/lumora/account | User self-service |
| Token Endpoint | http://localhost:8080/realms/lumora/protocol/openid-connect/token | Get tokens |
| Auth Endpoint | http://localhost:8080/realms/lumora/protocol/openid-connect/auth | Login redirect |
| Logout Endpoint | http://localhost:8080/realms/lumora/protocol/openid-connect/logout | Logout |
| User Info | http://localhost:8080/realms/lumora/protocol/openid-connect/userinfo | Get user details |

### Credentials to Save

**Admin Console:**
- Username: `admin`
- Password: `admin_change_in_production`

**Backend Client:**
- Client ID: `lumora-backend`
- Client Secret: `[Copy from Keycloak]`

**Test User:**
- Email: `testuser@lumora.com`
- Password: `Test123!`

---

## Environment Variables

Add these to `backend/.env`:

```bash
# Keycloak Configuration
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=lumora
KEYCLOAK_CLIENT_ID=lumora-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret-here

# For production, use HTTPS
# KEYCLOAK_SERVER_URL=https://keycloak.your-domain.com
```

Add these to `frontend/.env`:

```bash
# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=lumora
VITE_KEYCLOAK_CLIENT_ID=lumora-frontend
```

---

## Docker Management Commands

### Start Services
```bash
docker-compose -f docker-compose.keycloak.yml up -d
```

### Stop Services
```bash
docker-compose -f docker-compose.keycloak.yml down
```

### View Logs
```bash
docker-compose -f docker-compose.keycloak.yml logs -f
```

### Restart Services
```bash
docker-compose -f docker-compose.keycloak.yml restart
```

### Remove All Data (Reset)
```bash
docker-compose -f docker-compose.keycloak.yml down -v
```

---

## Troubleshooting

### Keycloak Won't Start

**Check logs:**
```bash
docker-compose -f docker-compose.keycloak.yml logs keycloak
```

**Common issues:**
- Port 8080 already in use
- Not enough RAM (need 1GB+)
- PostgreSQL not ready

### Can't Access Admin Console

1. Check Keycloak is running:
   ```bash
   curl http://localhost:8080/health/ready
   ```

2. Check Docker container:
   ```bash
   docker ps | grep keycloak
   ```

3. Restart services:
   ```bash
   docker-compose -f docker-compose.keycloak.yml restart
   ```

### Token Generation Fails

1. Verify realm name is correct: `lumora`
2. Check client ID: `lumora-frontend`
3. Verify user credentials
4. Check user is enabled and email verified

---

## Security Recommendations

### For Production:

1. **Change Default Passwords:**
   ```yaml
   KEYCLOAK_ADMIN_PASSWORD: use-strong-password-here
   POSTGRES_PASSWORD: use-strong-password-here
   ```

2. **Use HTTPS:**
   - Set up reverse proxy (Nginx, Traefik)
   - Use SSL/TLS certificates
   - Update KC_HOSTNAME and KC_HOSTNAME_STRICT

3. **Secure Database:**
   - Use strong PostgreSQL password
   - Restrict network access
   - Enable SSL for database connections

4. **Enable Rate Limiting:**
   - Configure brute force detection
   - Set password policies
   - Enable CAPTCHA

5. **Backup Database:**
   ```bash
   docker exec lumora-postgres pg_dump -U keycloak keycloak > keycloak-backup.sql
   ```

---

## Next Steps

✅ **Completed:**
- Keycloak deployed with Docker
- Realm created and configured
- Clients created (frontend + backend)
- Roles defined (user, admin, premium)
- Test user created

🚀 **Next Phase:**
- Integrate Keycloak with Flask backend
- Update frontend to use Keycloak authentication
- Migrate existing users
- Test end-to-end authentication flow

---

## Support

**Keycloak Documentation:**
- Official Docs: https://www.keycloak.org/documentation
- Getting Started: https://www.keycloak.org/getting-started
- Admin Guide: https://www.keycloak.org/docs/latest/server_admin/

**Common Issues:**
- Check logs: `docker-compose -f docker-compose.keycloak.yml logs`
- Health check: `curl http://localhost:8080/health/ready`
- Restart: `docker-compose -f docker-compose.keycloak.yml restart`

Ready to proceed to Phase 2: Backend Integration? 🚀
