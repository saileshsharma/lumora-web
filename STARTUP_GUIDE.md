# 🚀 Startup Guide

Quick guide to spin up both frontend and backend servers.

## Prerequisites

- **Python 3.7+** installed
- **OpenAI API Key** (required for outfit rating/generation)
- **FAL API Key** (required for image generation)

## Setup

### 1. Create `.env` file (first time only)

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
FAL_KEY=your_fal_key_here
```

### 2. Choose your startup method

## Option A: Bash Script (macOS/Linux) ⭐ Recommended

```bash
./start.sh
```

**Features:**
- ✅ Auto-creates virtual environment
- ✅ Installs dependencies
- ✅ Starts backend (Flask) on port 5000
- ✅ Starts frontend on port 8000
- ✅ Auto-opens browser
- ✅ Graceful shutdown with Ctrl+C
- ✅ Colored output

## Option B: Python Script (Cross-platform)

```bash
python3 start.py
```

**Features:**
- ✅ Works on Windows, macOS, Linux
- ✅ All features from bash script
- ✅ Better error handling
- ✅ Process monitoring

## Option C: Manual Start

### Terminal 1 - Backend
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd backend
python app.py
```

### Terminal 2 - Frontend
```bash
cd frontend
python3 -m http.server 8000
```

## Accessing the Application

Once started, the application will be available at:

- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:5000

The browser should open automatically to http://localhost:8000

## Stopping the Servers

Press **Ctrl+C** in the terminal where the script is running. Both servers will shut down gracefully.

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

**macOS/Linux:**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 8000 (frontend)
lsof -ti:8000 | xargs kill -9
```

**Windows:**
```cmd
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Missing API Keys

If you see warnings about missing API keys:
1. Create `.env` file in the root directory
2. Add your API keys as shown in Setup section
3. Restart the servers

### Virtual Environment Issues

If virtual environment fails to create:
```bash
# Remove existing venv
rm -rf venv

# Recreate
python3 -m venv venv
```

### Dependencies Won't Install

```bash
# Upgrade pip first
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Development Tips

### Live Reload

Frontend changes are immediately visible (just refresh browser).

For backend changes:
1. Stop servers (Ctrl+C)
2. Restart with `./start.sh` or `python3 start.py`

Or use Flask debug mode (edit backend/app.py, set `debug=True`).

### Checking Logs

Backend logs are stored in `logs/` directory:
```bash
tail -f logs/outfit_assistant_*.log
```

### Testing API Endpoints

You can test API endpoints directly:
```bash
# Health check
curl http://localhost:5000/api/health

# Get arena submissions
curl http://localhost:5000/api/arena/submissions
```

## Production Deployment

These scripts are for **local development only**. For production:

- Backend: Use Gunicorn/uWSGI with nginx
- Frontend: Use proper web server (nginx) or CDN
- Environment: Use proper secrets management
- SSL: Enable HTTPS with valid certificates

## Support

For issues:
1. Check backend logs in `logs/` directory
2. Check browser console (F12) for frontend errors
3. Ensure all API keys are configured correctly
4. Verify both servers are running on correct ports
