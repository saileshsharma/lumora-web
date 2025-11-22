# Quick Start Guide

## One-Command Startup

Run the application with a single command:

```bash
./start.sh
```

This will automatically:
- ✅ Check system requirements (Python3, Node.js, npm)
- ✅ Create virtual environment (if needed)
- ✅ Install all dependencies
- ✅ Validate environment variables
- ✅ Start backend server (port 5001)
- ✅ Start frontend server (port 5173)
- ✅ Open browser automatically
- ✅ Display real-time logs

## First Time Setup

### 1. Make the script executable (first time only)
```bash
chmod +x start.sh
```

### 2. Configure environment variables

The script will create `backend/.env` from `backend/.env.example` if it doesn't exist.

**Edit `backend/.env` and add your keys:**

```bash
# Required
OPENAI_API_KEY=sk-your-openai-key-here

# Generate JWT secret key
JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# Set admin password
ADMIN_PASSWORD=your-secure-password-here

# Optional
FAL_API_KEY=your-fal-key-here
NANOBANANA_API_KEY=your-nanobanana-key-here
```

**Quick JWT Secret Generation:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Run the startup script
```bash
./start.sh
```

## What the Script Does

### System Check
- Verifies Python3 is installed
- Verifies Node.js and npm are installed
- Shows installed versions

### Backend Setup
- Creates virtual environment in `backend/venv/`
- Installs Python dependencies from `backend/requirements.txt`
- Validates `.env` file exists
- Checks for required API keys

### Frontend Setup
- Installs npm dependencies (if needed)
- Checks `frontend/node_modules/`

### Server Startup
- **Backend:** Starts Flask on `http://localhost:5001`
- **Frontend:** Starts Vite dev server on `http://localhost:5173`
- Logs output to `backend.log` and `frontend.log`

### Browser Launch
- Automatically opens `http://localhost:5173` in your default browser

## Stopping the Servers

Press `Ctrl+C` in the terminal to stop both servers gracefully.

## Logs

Real-time logs are written to:
- `backend.log` - Flask backend output
- `frontend.log` - Vite frontend output

Backend also creates detailed logs in:
- `backend/logs/application_YYYYMMDD.log` - Application flow
- `backend/logs/api_calls_YYYYMMDD.log` - External API calls
- `backend/logs/errors_YYYYMMDD.log` - Errors and exceptions

## Troubleshooting

### Script won't run
```bash
# Make sure it's executable
chmod +x start.sh

# Run with bash explicitly
bash start.sh
```

### "Python3 not found"
Install Python 3.8 or higher from https://www.python.org/

### "Node.js not found"
Install Node.js from https://nodejs.org/

### "Backend failed to start"
Check `backend.log` for errors. Common issues:
- Missing API keys in `.env`
- Port 5001 already in use
- Missing Python dependencies

### "Frontend failed to start"
Check `frontend.log` for errors. Common issues:
- Port 5173 already in use
- npm dependencies not installed
- Node version too old

### Port conflicts
If ports are in use, stop other processes:
```bash
# Check what's using port 5001
lsof -i :5001

# Check what's using port 5173
lsof -i :5173

# Kill process by PID
kill <PID>
```

### Environment variables not loading
1. Make sure `backend/.env` exists
2. Check file format (no spaces around `=`)
3. Verify API keys are valid

### Authentication not working
1. Check `JWT_SECRET_KEY` is set in `backend/.env`
2. Generate a new secret if needed:
   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```
3. Restart the backend server

## Manual Startup (Alternative)

If you prefer to start servers manually:

### Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python3 app.py
```

### Frontend
```bash
cd frontend
npm run dev
```

## URLs

Once running, access:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/api/health

## Next Steps

1. Create an account (sign up)
2. Upload an outfit photo
3. Get AI-powered fashion feedback
4. Generate outfit recommendations
5. Share in Fashion Arena
6. Join Style Squads

## Support

For detailed setup instructions, see:
- [LOCALHOST_SETUP.md](LOCALHOST_SETUP.md) - Detailed local setup guide
- [JWT_AUTHENTICATION.md](JWT_AUTHENTICATION.md) - Authentication documentation
- [README.md](README.md) - Full project documentation
