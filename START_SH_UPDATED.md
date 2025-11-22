# ✅ start.sh Updated with Keycloak Support!

**Date:** November 22, 2025
**Status:** UPDATED & ENHANCED 🎉

---

## 🎯 What's New

The `start.sh` script has been updated to include **full Keycloak support**!

### New Features

1. **✅ Docker Detection**
   - Checks if Docker is installed
   - Warns if Keycloak is enabled but Docker unavailable

2. **✅ Keycloak Auto-Start**
   - Automatically starts Keycloak if `USE_KEYCLOAK=true`
   - Checks if Keycloak is already running (doesn't restart)
   - Waits for Keycloak to be ready (health check)

3. **✅ Environment Validation**
   - Checks Keycloak configuration in `.env`
   - Validates Keycloak server URL and client secret
   - Shows authentication mode (Keycloak or Legacy JWT)

4. **✅ Smart Cleanup**
   - Asks if you want to stop Keycloak on exit
   - Keeps Keycloak running by default (for faster restarts)
   - Provides command to stop Keycloak later

5. **✅ Enhanced Status Display**
   - Shows Keycloak URL if running
   - Displays authentication mode
   - Shows login credentials when using Keycloak

---

## 🚀 How It Works

### Startup Sequence

```
1. Check system requirements
   ├─ Docker (for Keycloak)
   ├─ Python3
   ├─ Node.js
   └─ npm

2. Check environment configuration
   ├─ backend/.env exists
   ├─ API keys configured
   ├─ JWT secret configured
   └─ Keycloak settings (if enabled)

3. Install dependencies
   ├─ Backend (Python packages)
   └─ Frontend (npm packages)

4. Start Keycloak (if enabled)
   ├─ Check if already running
   ├─ Start Docker containers
   ├─ Wait for initialization
   └─ Verify health status

5. Start Backend (Port 5001)
   └─ Log output to backend.log

6. Start Frontend (Port 5174)
   └─ Log output to frontend.log

7. Open browser
   └─ http://localhost:5174
```

---

## 📋 Usage

### Basic Usage

```bash
./start.sh
```

That's it! The script handles everything:
- Checks requirements
- Starts Keycloak (if enabled)
- Starts backend
- Starts frontend
- Opens browser

### With Keycloak (Recommended)

Make sure `backend/.env` has:
```bash
USE_KEYCLOAK=true
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=lumora
KEYCLOAK_CLIENT_ID=lumora-backend
KEYCLOAK_CLIENT_SECRET=2UJLDxlu6tzJeKrg9YKtWNMsdnvj0tag
```

Then run:
```bash
./start.sh
```

### Without Keycloak (Legacy JWT)

Make sure `backend/.env` has:
```bash
USE_KEYCLOAK=false
```

Then run:
```bash
./start.sh
```

---

## 🖥️ Sample Output

### With Keycloak Enabled

```
╔════════════════════════════════════════════╗
║   AI Outfit Assistant - Startup Script    ║
╔════════════════════════════════════════════╗

🔍 Checking system requirements...
✅ Docker Docker version 24.0.6, build ed223bc found
✅ Python 3.11.5 found
✅ Node.js v20.9.0 found
✅ npm 10.1.0 found

🔧 Activating virtual environment...
📦 Checking backend dependencies...
✅ Backend dependencies ready

🔍 Checking environment configuration...
✅ Environment file found
   ✓ OpenAI API key configured
   ✓ FAL API key configured
   ✓ JWT secret key configured
   ✓ Admin password configured
   ℹ️  Keycloak authentication enabled
   ✓ Keycloak server URL configured
   ✓ Keycloak client secret configured

📦 Checking frontend dependencies...
✅ Frontend dependencies ready

🔐 Starting Keycloak Server...
⏳ Starting Keycloak and PostgreSQL containers...
✅ Keycloak containers started
⏳ Waiting for Keycloak to initialize (may take 30-60 seconds)...
.....
✅ Keycloak is ready at http://localhost:8080

🚀 Starting Backend Server (Port 5001)...
⏳ Waiting for backend to initialize...
✅ Backend is running and responding on http://localhost:5001

🚀 Starting Frontend Server (Port 5174)...
✅ Frontend is running on http://localhost:5174

╔════════════════════════════════════════════╗
║          🎉 All Systems Ready! 🎉          ║
╠════════════════════════════════════════════╣
║                                            ║
║  Frontend: http://localhost:5174           ║
║  Backend:  http://localhost:5001           ║
║  Keycloak: http://localhost:8080           ║
║                                            ║
║  Logs:                                     ║
║    • backend.log  (Backend output)         ║
║    • frontend.log (Frontend output)        ║
║                                            ║
║  Authentication: Keycloak                  ║
║    • User: sailesh.sharma@gmail.com        ║
║    • Password: Admin@123                   ║
║                                            ║
║  Press Ctrl+C to stop all servers          ║
║                                            ║
╚════════════════════════════════════════════╝

🌐 Opening browser...
```

---

## 🛑 Stopping the Application

### Press Ctrl+C

The script will prompt you:

```
🛑 Shutting down servers...
🔐 Keycloak is still running
Do you want to stop Keycloak? (y/N)
```

**Press 'N' (default):**
- Stops backend and frontend
- Keeps Keycloak running
- Faster startup next time

**Press 'Y':**
- Stops backend, frontend, and Keycloak
- Complete shutdown

---

## 🔧 Keycloak Management

### Check if Keycloak is Running

```bash
docker ps | grep keycloak
```

### Stop Keycloak Manually

```bash
docker-compose -f docker-compose.keycloak.yml down
```

### Start Keycloak Manually

```bash
docker-compose -f docker-compose.keycloak.yml up -d
```

### View Keycloak Logs

```bash
docker-compose -f docker-compose.keycloak.yml logs -f keycloak
```

### Restart Keycloak

```bash
docker-compose -f docker-compose.keycloak.yml restart
```

---

## 🐛 Troubleshooting

### "Docker is not installed"

**Problem:**
```
⚠️  Docker is not installed. Keycloak authentication will not be available.
```

**Solution:**
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Or disable Keycloak: Set `USE_KEYCLOAK=false` in `backend/.env`

---

### "Keycloak did not start in time"

**Problem:**
```
⚠️  Keycloak did not start in time, but continuing anyway...
```

**Solution:**
- Keycloak takes 30-60 seconds to start first time
- Check logs: `docker-compose -f docker-compose.keycloak.yml logs -f`
- Wait a bit longer, then refresh the frontend
- Verify Keycloak is running: `curl http://localhost:8080/health/ready`

---

### "Backend failed to start"

**Problem:**
```
❌ Backend failed to start. Check backend.log for errors.
```

**Solution:**
```bash
# View backend logs
cat backend.log

# Common issues:
# 1. Missing Python dependencies
pip3 install -r backend/requirements.txt

# 2. Missing Keycloak dependencies
pip3 install python-keycloak PyJWT

# 3. Port 5001 already in use
lsof -ti:5001 | xargs kill -9
```

---

### "Frontend failed to start"

**Problem:**
```
❌ Frontend failed to start. Check frontend.log for errors.
```

**Solution:**
```bash
# View frontend logs
cat frontend.log

# Common issues:
# 1. Missing npm packages
cd frontend && npm install

# 2. Port 5174 already in use
lsof -ti:5174 | xargs kill -9
```

---

## 📊 Comparison

### Before (Without Keycloak)

```bash
./start.sh
# Only starts backend and frontend
# Uses legacy JWT authentication
```

### After (With Keycloak)

```bash
./start.sh
# Checks Docker availability
# Starts Keycloak automatically
# Starts backend with Keycloak integration
# Starts frontend with Keycloak
# Shows Keycloak credentials
```

---

## ✅ What's Automated

The script now automatically handles:

1. **✅ Environment Detection**
   - Checks if Docker is available
   - Detects Keycloak configuration
   - Validates all settings

2. **✅ Keycloak Lifecycle**
   - Starts Keycloak if needed
   - Waits for initialization
   - Health checks
   - Smart cleanup on exit

3. **✅ Error Handling**
   - Graceful degradation if Docker unavailable
   - Timeout handling for Keycloak startup
   - Clear error messages
   - Helpful troubleshooting tips

4. **✅ User Experience**
   - Shows authentication mode
   - Displays login credentials
   - Provides Keycloak URL
   - Asks before stopping Keycloak

---

## 🎯 Benefits

### For Development

- **One command startup**: `./start.sh` does everything
- **Faster iterations**: Keycloak stays running between restarts
- **Clear feedback**: Know exactly what's running
- **Easy debugging**: Separate log files for each service

### For Production Readiness

- **Environment validation**: Catches configuration issues early
- **Dependency checks**: Ensures all requirements are met
- **Graceful shutdown**: Proper cleanup on exit
- **Status monitoring**: Health checks for all services

---

## 📝 Configuration Checklist

Before running `./start.sh`, ensure:

```
System Requirements:
✅ Docker Desktop installed and running
✅ Python 3.x installed
✅ Node.js installed
✅ npm installed

Backend Configuration (backend/.env):
✅ OPENAI_API_KEY set
✅ FAL_API_KEY set (optional)
✅ JWT_SECRET_KEY set
✅ ADMIN_PASSWORD set
✅ USE_KEYCLOAK=true (for Keycloak)
✅ KEYCLOAK_SERVER_URL set
✅ KEYCLOAK_CLIENT_SECRET set

Frontend Configuration (frontend/.env.local):
✅ VITE_API_URL set
✅ VITE_KEYCLOAK_URL set
✅ VITE_KEYCLOAK_REALM set
✅ VITE_KEYCLOAK_CLIENT_ID set

Keycloak:
✅ docker-compose.keycloak.yml exists
✅ Keycloak realm 'lumora' configured
✅ User sailesh.sharma@gmail.com created
```

---

## 🚀 Quick Start Guide

### First Time Setup

1. **Configure environment:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys and Keycloak settings

   # Frontend
   cp frontend/.env.example frontend/.env.local
   # Edit frontend/.env.local with Keycloak URLs
   ```

2. **Start everything:**
   ```bash
   ./start.sh
   ```

3. **Wait for all services to start:**
   - Keycloak: ~60 seconds
   - Backend: ~5 seconds
   - Frontend: ~10 seconds

4. **Browser opens automatically to http://localhost:5174**

5. **Login with Keycloak:**
   - Email: sailesh.sharma@gmail.com
   - Password: Admin@123

### Subsequent Runs

```bash
./start.sh
# Much faster! Keycloak is already running
```

---

## 🎉 Summary

The updated `start.sh` script now provides:

✅ **Automatic Keycloak management**
✅ **Smart environment detection**
✅ **One-command startup**
✅ **Clear status reporting**
✅ **Graceful shutdown**
✅ **Comprehensive error handling**

**You can now start the entire stack with a single command!**

```bash
./start.sh
```

---

**Enjoy your enterprise-grade authentication with zero hassle! 🚀**
