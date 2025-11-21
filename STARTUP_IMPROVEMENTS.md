# Startup Script Improvements

## Overview
The `start.sh` script has been significantly improved to provide better error handling, status checking, and user feedback.

## Key Improvements

### 1. System Requirements Check ✅
The script now verifies all required tools are installed before starting:
- **Python 3** - Shows version number
- **Node.js** - Shows version number
- **npm** - Shows version number

If any are missing, the script exits with a clear error message.

### 2. Correct .env File Location ✅
**Before**: Checked for `.env` in root directory (incorrect)
**Now**: Checks for `backend/.env` (correct location)

Features:
- Verifies `backend/.env` exists
- If missing, automatically copies from `backend/.env.example`
- Validates that API keys are actually configured (not just empty)
- Shows status for each API key:
  - ✓ OpenAI API key configured
  - ✓ FAL API key configured
  - ⚠️ Warns if keys appear to be missing

### 3. Frontend Dependencies Check ✅
- Checks if `frontend/node_modules` exists
- Automatically runs `npm install` if missing
- Shows clear status messages

### 4. Server Startup Verification ✅
**Backend**:
- Starts on port 5001
- Waits 3 seconds for initialization
- Verifies process is running
- Tests health endpoint (`/api/health`)
- Exits with error if backend fails to start
- Logs output to `backend.log`

**Frontend**:
- Starts on port 5174
- Waits 2 seconds for initialization
- Verifies process is running
- Exits with error if frontend fails to start
- Kills backend if frontend fails
- Logs output to `frontend.log`

### 5. Better Logging ✅
- Backend output → `backend.log`
- Frontend output → `frontend.log`
- Both files shown in success message
- Both files already ignored by `.gitignore`

### 6. Improved Status Display ✅
The final success message now shows:
```
╔════════════════════════════════════════════╗
║          🎉 All Systems Ready! 🎉          ║
╠════════════════════════════════════════════╣
║                                            ║
║  Frontend: http://localhost:5174           ║
║  Backend:  http://localhost:5001           ║
║                                            ║
║  Logs:                                     ║
║    • backend.log  (Backend output)         ║
║    • frontend.log (Frontend output)        ║
║                                            ║
║  Press Ctrl+C to stop all servers          ║
║                                            ║
╚════════════════════════════════════════════╝
```

### 7. Enhanced Error Messages ✅
Clear, actionable error messages for:
- Missing system requirements
- Missing .env file
- Failed API key configuration
- Backend startup failure
- Frontend startup failure

Each error includes specific instructions on how to fix it.

### 8. Port Configuration ✅
- **Frontend**: Port 5174 (updated from 5173)
- **Backend**: Port 5001
- CORS configured to allow both ports

## Usage

### Start Application
```bash
cd outfit-assistant
./start.sh
```

### What It Does
1. Checks Python, Node.js, npm are installed
2. Creates/activates Python virtual environment
3. Installs backend dependencies (Python packages)
4. Checks for `backend/.env` file
5. Validates API keys are configured
6. Checks/installs frontend dependencies (npm packages)
7. Starts backend server (port 5001)
8. Verifies backend is responding
9. Starts frontend server (port 5174)
10. Verifies frontend is running
11. Opens browser automatically (macOS)
12. Displays success message with URLs and log files

### Stop Application
Press `Ctrl+C` - This will gracefully shut down both servers.

## Debugging

### Check Logs
If something goes wrong:
```bash
# Backend logs
tail -f outfit-assistant/backend.log

# Frontend logs
tail -f outfit-assistant/frontend.log

# Or both at once
tail -f outfit-assistant/*.log
```

### Test Backend Connection
```bash
cd outfit-assistant
./test_backend_connection.sh
```

### Manual Health Check
```bash
# Check backend
curl http://localhost:5001/api/health

# Should return: {"status": "healthy", ...}
```

### View Running Processes
```bash
# Check if backend is running
lsof -i :5001

# Check if frontend is running
lsof -i :5174
```

## Common Issues

### "Backend failed to start"
1. Check `backend.log` for errors
2. Verify API keys in `backend/.env`
3. Check if port 5001 is already in use: `lsof -i :5001`

### "Frontend failed to start"
1. Check `frontend.log` for errors
2. Verify `node_modules` installed: `cd frontend && npm install`
3. Check if port 5174 is already in use: `lsof -i :5174`

### "API keys appear to be missing"
1. Edit `backend/.env`
2. Add valid API keys:
   ```env
   OPENAI_API_KEY=sk-proj-...
   FAL_API_KEY=...
   ```
3. Restart application

## Files Modified

1. **start.sh** - Main startup script with all improvements
2. **backend/app.py** - CORS updated to include port 5174
3. **test_backend_connection.sh** - New testing script (created)
4. **TROUBLESHOOTING_CONNECTION.md** - Comprehensive guide (created)

## Benefits

✅ **Faster debugging** - Log files make it easy to see what went wrong
✅ **Better UX** - Clear status messages and error handling
✅ **Automated checks** - Verifies everything before starting
✅ **Self-healing** - Auto-creates missing files, installs dependencies
✅ **Safety** - Exits early if requirements aren't met
✅ **Transparency** - Shows exactly what's happening at each step
