# Keycloak Quick Setup for Sailesh

## 🚀 Start Keycloak

```bash
# Option 1: Use the setup script (Recommended)
./setup-keycloak.sh

# Option 2: Manual start
docker-compose -f docker-compose.keycloak.yml up -d
```

**Wait 60-90 seconds for Keycloak to start**

---

## 🔑 Access Keycloak

**URL:** http://localhost:8080

**Admin Login:**
- Username: `admin`
- Password: `admin_change_in_production`

---

## ⚙️ Configuration Steps (15 minutes)

### 1️⃣ Create Realm

1. Hover over "master" (top-left dropdown)
2. Click "Create Realm"
3. **Realm name:** `lumora`
4. Click "Create"

### 2️⃣ Configure Login Settings

1. Go to **Realm Settings** → **Login** tab
2. Enable:
   - ✅ User registration
   - ✅ Forgot password
   - ✅ Remember me
   - ✅ Email as username
   - ✅ Login with email
3. Click **Save**

### 3️⃣ Configure Email (SMTP)

1. Go to **Realm Settings** → **Email** tab
2. Configure:
   - **Host:** `smtp.gmail.com`
   - **Port:** `587`
   - **From:** `noreply@lumora.com`
   - **From Display Name:** `Lumora`
   - **Enable StartTLS:** `ON`
   - **Enable Authentication:** `ON`
   - **Username:** `sailesh.sharma@gmail.com`
   - **Password:** `[Your Gmail App Password]`
3. Click **Save**
4. Click **Test connection**

**📧 Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with sailesh.sharma@gmail.com
3. Create app password for "Keycloak"
4. Copy the 16-character password
5. Paste in Keycloak Email settings

### 4️⃣ Create Frontend Client

1. Go to **Clients** → **Create client**
2. **General Settings:**
   - Client ID: `lumora-frontend`
   - Client type: OpenID Connect
3. Click **Next**
4. **Capability config:**
   - Client authentication: `OFF`
   - Standard flow: `ON`
   - Direct access grants: `ON`
5. Click **Next**
6. **Login settings:**

   **Valid redirect URIs:**
   ```
   http://localhost:5174/*
   http://localhost:5173/*
   http://127.0.0.1:5174/*
   ```

   **Valid post logout redirect URIs:**
   ```
   http://localhost:5174/*
   http://localhost:5173/*
   ```

   **Web origins:**
   ```
   http://localhost:5174
   http://localhost:5173
   http://127.0.0.1:5174
   ```
7. Click **Save**

### 5️⃣ Create Backend Client

1. Go to **Clients** → **Create client**
2. **General Settings:**
   - Client ID: `lumora-backend`
   - Client type: OpenID Connect
3. Click **Next**
4. **Capability config:**
   - Client authentication: `ON`
   - Service accounts roles: `ON`
5. Click **Save**
6. Go to **Credentials** tab
7. **🔐 COPY THE CLIENT SECRET** (you'll need this!)

### 6️⃣ Create Roles

1. Go to **Realm roles** → **Create role**

**Create 3 roles:**

**Role 1: user**
- Role name: `user`
- Description: `Regular user with basic access`
- Click **Save**

**Role 2: admin**
- Role name: `admin`
- Description: `Administrator with full access`
- Click **Save**

**Role 3: premium**
- Role name: `premium`
- Description: `Premium user with extended features`
- Click **Save**

### 7️⃣ Set Default Roles

1. Go to **Realm roles**
2. Click **default-roles-lumora**
3. Click **Assign role**
4. Select **user** role
5. Click **Assign**

### 8️⃣ Create Your Admin User

1. Go to **Users** → **Add user**
2. **User details:**
   - Username: `sailesh.sharma@gmail.com`
   - Email: `sailesh.sharma@gmail.com`
   - First name: `Sailesh`
   - Last name: `Sharma`
   - Email verified: `ON`
   - Enabled: `ON`
3. Click **Create**

**Set Password:**
1. Go to **Credentials** tab
2. Click **Set password**
3. Enter your password (min 8 characters)
4. Confirm password
5. Temporary: `OFF`
6. Click **Save**

**Assign Admin Role:**
1. Go to **Role mapping** tab
2. Click **Assign role**
3. Select **admin** and **user** roles
4. Click **Assign**

---

## 📝 Update Environment Files

### Backend `.env`

Create/update `backend/.env`:

```bash
# Keycloak Configuration
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=lumora
KEYCLOAK_CLIENT_ID=lumora-backend
KEYCLOAK_CLIENT_SECRET=<paste-your-backend-client-secret-here>
USE_KEYCLOAK=true

# Other existing settings
OPENAI_API_KEY=your-openai-key
FAL_API_KEY=your-fal-key
ADMIN_PASSWORD=your-admin-password
JWT_SECRET_KEY=your-jwt-secret
```

### Frontend `.env.local`

Create `frontend/.env.local`:

```bash
# Backend API
VITE_API_URL=http://localhost:5001

# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=lumora
VITE_KEYCLOAK_CLIENT_ID=lumora-frontend
```

---

## 🧪 Test Your Setup

### 1. Test Keycloak Login

1. Open: http://localhost:8080/realms/lumora/account
2. Click **Sign In**
3. Login with:
   - **Email:** sailesh.sharma@gmail.com
   - **Password:** [your password]
4. Should see Account Console ✅

### 2. Test Token Generation

```bash
curl -X POST \
  http://localhost:8080/realms/lumora/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=lumora-frontend' \
  -d 'username=sailesh.sharma@gmail.com' \
  -d 'password=YOUR_PASSWORD' \
  -d 'grant_type=password'
```

Should return access_token ✅

### 3. Test with Frontend

```bash
# Start backend
cd backend
python3 app.py

# Start frontend (new terminal)
cd frontend
npm run dev
```

1. Open: http://localhost:5174
2. Click **Sign In**
3. Should redirect to Keycloak
4. Login with sailesh.sharma@gmail.com
5. Should redirect back to app ✅

---

## 🔧 Useful Commands

### View Logs
```bash
docker-compose -f docker-compose.keycloak.yml logs -f keycloak
```

### Stop Keycloak
```bash
docker-compose -f docker-compose.keycloak.yml down
```

### Restart Keycloak
```bash
docker-compose -f docker-compose.keycloak.yml restart
```

### Check Status
```bash
docker-compose -f docker-compose.keycloak.yml ps
```

### Health Check
```bash
curl http://localhost:8080/health/ready
```

---

## 🐛 Troubleshooting

### Keycloak Won't Start

**Check Docker is running:**
```bash
docker info
```

**View logs:**
```bash
docker-compose -f docker-compose.keycloak.yml logs keycloak
```

### Can't Access Admin Console

**Check if Keycloak is running:**
```bash
docker ps | grep keycloak
```

**Restart Keycloak:**
```bash
docker-compose -f docker-compose.keycloak.yml restart
```

### Gmail SMTP Not Working

**Common issues:**
1. Need App Password (not regular password)
2. 2-Factor Authentication must be enabled
3. Less secure apps might be blocked

**Get App Password:**
https://myaccount.google.com/apppasswords

### Frontend Can't Connect

**Check CORS settings:**
1. Keycloak Admin → Clients → lumora-frontend
2. Verify Web Origins includes:
   - http://localhost:5174
   - http://localhost:5173

---

## ✅ Configuration Checklist

- [ ] Docker Desktop is running
- [ ] Keycloak started successfully
- [ ] Accessed admin console (http://localhost:8080)
- [ ] Created "lumora" realm
- [ ] Configured login settings
- [ ] Configured email (SMTP)
- [ ] Created lumora-frontend client
- [ ] Created lumora-backend client
- [ ] Copied backend client secret
- [ ] Created user, admin, premium roles
- [ ] Set default role to "user"
- [ ] Created admin user for Sailesh
- [ ] Set password for Sailesh
- [ ] Assigned admin role to Sailesh
- [ ] Updated backend/.env with Keycloak settings
- [ ] Updated frontend/.env.local with Keycloak settings
- [ ] Tested Keycloak login
- [ ] Tested token generation
- [ ] Tested frontend authentication

---

## 📚 Next Steps

After setup is complete:

1. **Test the full flow**
   - Login with your account
   - Try all features
   - Test admin functions

2. **Add more users**
   - Go to Users → Add user
   - Or enable user registration

3. **Configure social login** (optional)
   - Google OAuth
   - GitHub OAuth
   - Facebook Login

4. **Customize theme** (optional)
   - Match your brand colors
   - Add your logo

---

## 🆘 Need Help?

**Documentation:**
- Complete Guide: `KEYCLOAK_COMPLETE_GUIDE.md`
- Detailed Setup: `KEYCLOAK_SETUP.md`
- Frontend Integration: `KEYCLOAK_FRONTEND_INTEGRATION.md`

**Keycloak Resources:**
- Official Docs: https://www.keycloak.org/documentation
- Getting Started: https://www.keycloak.org/getting-started

---

**Your Configuration:**
- **Email:** sailesh.sharma@gmail.com
- **Username:** sailesh.sharma@gmail.com
- **Roles:** admin, user
- **Realm:** lumora
- **Keycloak:** http://localhost:8080

**Ready to go! 🚀**
