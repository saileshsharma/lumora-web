# Local Development Setup Guide

## Issue: Unable to Sign Up on Localhost

The sign-up issue was caused by a **port mismatch** between the frontend and backend.

### Root Cause
- **macOS AirPlay Receiver** uses port 5000 by default
- Backend is configured to run on port **5001** to avoid this conflict
- Frontend was incorrectly pointing to port 5000

### ✅ Fix Applied
Updated frontend authStore to use `http://localhost:5001` instead of `http://localhost:5000`

---

## How to Start the Application Locally

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd /Users/yatika/prod-outfit/AI-Outfit-Assistant/outfit-assistant/backend

# Activate virtual environment (if using one)
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Start the Flask server
python3 app.py
```

**Expected Output:**
```
============================================================
OUTFIT ASSISTANT APPLICATION STARTED
============================================================
Application Log: logs/application_20251122.log
API Calls Log: logs/api_calls_20251122.log
Errors Log: logs/errors_20251122.log
============================================================
✓ JWT authentication configured
✓ Rate limiting configured
✓ Security headers configured
✓ Authentication endpoints registered
============================================================
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5001
 * Running on http://192.168.x.x:5001
```

**Important:** The backend should be running on **port 5001**, NOT 5000!

### 2. Start the Frontend

```bash
# Open a new terminal
# Navigate to frontend directory
cd /Users/yatika/prod-outfit/AI-Outfit-Assistant/outfit-assistant/frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:5174
```

---

## Testing Authentication

### Test Sign Up

1. Click **"Sign Up"** on the login page
2. Fill in the form:
   - **Name:** Your Name
   - **Email:** test@example.com
   - **Password:** test123456 (min 6 characters)
   - **Confirm Password:** test123456
3. Click **"Create Account"**

### Expected Behavior

✅ **Success:**
- Toast notification: "Account created successfully!"
- Automatic login
- Redirect to main app

❌ **Errors:**
- "Email already registered" - Use a different email
- "Password must be at least 6 characters" - Use longer password
- "Passwords do not match" - Confirm password should match

### Test Login

1. Click **"Sign In"** if you already have an account
2. Enter your email and password
3. Click **"Sign In"**

### Expected Behavior

✅ **Success:**
- Toast notification: "Welcome back!"
- Redirect to main app
- User info loaded

❌ **Errors:**
- "Invalid email or password" - Check credentials
- Connection error - Backend not running

---

## Troubleshooting

### Problem: "Failed to connect" or "Network Error"

**Solution:**
1. Make sure the backend is running on port 5001
2. Check terminal for any errors
3. Verify backend started successfully

```bash
# Test backend health
curl http://localhost:5001/api/health
# Should return: {"status":"healthy","message":"Outfit Assistant API is running"}

# Test auth endpoint
curl http://localhost:5001/api/auth/stats
# Should return: {"total_users":X,"message":"Authentication system is running"}
```

### Problem: Port 5000 is occupied by AirPlay

**Solution 1 (Temporary):** Backend already uses port 5001, no action needed

**Solution 2 (Disable AirPlay - if needed):**
1. Open **System Settings**
2. Go to **General** → **AirDrop & Handoff**
3. Toggle off **AirPlay Receiver**

### Problem: "Module not found" errors in backend

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

Make sure all dependencies are installed:
- Flask
- Flask-CORS
- Flask-JWT-Extended
- bcrypt
- marshmallow
- openai
- python-dotenv

### Problem: Frontend can't connect to backend

**Check API URL:**
```bash
# The frontend should automatically use the correct port
# Check browser console (F12) for the actual API URL being used
# Should be: http://localhost:5001/api/auth/...
```

**Check CORS:**
Make sure the backend allows requests from http://localhost:5174

### Problem: JWT Secret Key not configured

**Solution:**
```bash
cd backend

# Generate a secure key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Add to .env file
echo 'JWT_SECRET_KEY=<generated-key>' >> .env
```

### Problem: Users database not created

**Solution:**
The database file `users_db.json` is created automatically when the first user registers.

Location: `/Users/yatika/prod-outfit/AI-Outfit-Assistant/outfit-assistant/backend/users_db.json`

---

## Environment Variables

### Backend (.env)

Required:
```bash
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET_KEY=your-generated-secret-here
ADMIN_PASSWORD=your-secure-password-here
```

Optional:
```bash
FAL_API_KEY=your-fal-key-here
NANOBANANA_API_KEY=your-nanobanana-key-here
FLASK_ENV=development
FLASK_DEBUG=False
```

### Frontend (.env)

Optional (for production):
```bash
VITE_API_URL=https://your-backend-url.railway.app
```

For local development, this is not needed (defaults to http://localhost:5001)

---

## Port Configuration Summary

| Service | Port | URL | Notes |
|---------|------|-----|-------|
| Backend (Flask) | 5001 | http://localhost:5001 | Avoids macOS AirPlay on 5000 |
| Frontend (Vite) | 5174 | http://localhost:5174 | Custom port to avoid conflicts |
| AirPlay Receiver | 5000 | - | macOS system service |

---

## Quick Start Checklist

- [ ] Backend running on port 5001
- [ ] Frontend running on port 5174
- [ ] .env file configured with API keys
- [ ] JWT_SECRET_KEY generated and added to .env
- [ ] No error messages in terminal
- [ ] Can access http://localhost:5174 in browser
- [ ] Sign up form appears
- [ ] Backend health check passes: `curl http://localhost:5001/api/health`

---

## Logs

Backend logs are stored in:
```
backend/logs/
├── application_YYYYMMDD.log  # General app flow
├── api_calls_YYYYMMDD.log    # External API calls
└── errors_YYYYMMDD.log        # Errors and exceptions
```

Check these files if something goes wrong!

---

## Support

If you continue to experience issues:

1. Check the logs in `backend/logs/`
2. Verify all environment variables are set
3. Make sure dependencies are installed
4. Try restarting both backend and frontend
5. Clear browser cache and localStorage

For authentication-specific issues, see [JWT_AUTHENTICATION.md](JWT_AUTHENTICATION.md)
