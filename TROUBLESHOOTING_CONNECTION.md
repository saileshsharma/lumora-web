# Frontend-Backend Connection Troubleshooting Guide

## Issue Fixed
✅ Updated CORS configuration to allow connections from `http://localhost:5174`
✅ Verified API endpoints are correctly configured
✅ Created test script to verify backend connectivity

## Quick Start

### 1. Start Both Servers
```bash
cd outfit-assistant
./start.sh
```

This will:
- Start backend on `http://localhost:5001`
- Start frontend on `http://localhost:5174`
- Automatically open browser

### 2. Test Backend Connection
```bash
cd outfit-assistant
./test_backend_connection.sh
```

This will verify:
- Backend is running and responding
- CORS headers are configured correctly
- API health endpoint is accessible

## Configuration Details

### Frontend API Configuration
- **Location**: `frontend/src/constants/index.ts`
- **Local API URL**: `http://localhost:5001/api`
- **Production API URL**: `https://web-production-c70ba.up.railway.app/api`

The frontend automatically detects if running locally and uses the correct URL.

### Backend CORS Configuration
- **Location**: `backend/app.py` (lines 40-59)
- **Allowed Origins**:
  - `http://localhost:5174` (NEW - Vite dev server)
  - `http://localhost:5173` (OLD - Vite dev server)
  - `http://127.0.0.1:5174`
  - `http://127.0.0.1:5173`
  - Production URLs

### API Endpoints
All endpoints are prefixed with `/api`:

- `GET /api/health` - Health check
- `POST /api/rate-outfit` - Rate outfit
- `POST /api/generate-outfit` - Generate outfit
- `POST /api/regenerate-outfit` - Regenerate outfit
- `POST /api/arena/submit` - Submit to arena
- `GET /api/arena/submissions` - Get submissions
- `GET /api/arena/leaderboard` - Get leaderboard
- `POST /api/arena/vote` - Vote on submissions
- `POST /api/arena/like` - Like submission

## Common Issues & Solutions

### Issue 1: "Cannot connect to server"

**Symptoms**: Frontend shows error "Cannot connect to server. Please ensure the backend is running."

**Solution**:
1. Check if backend is running:
   ```bash
   curl http://localhost:5001/api/health
   ```
2. If not running, start it:
   ```bash
   cd outfit-assistant/backend
   python3 app.py
   ```

### Issue 2: CORS Error in Browser Console

**Symptoms**: Browser console shows errors like "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**:
1. Verify backend CORS includes your frontend port
2. Restart backend to pick up CORS changes:
   ```bash
   # Kill backend process
   pkill -f "python3 app.py"

   # Restart
   cd outfit-assistant/backend
   python3 app.py
   ```

### Issue 3: API Returns 404

**Symptoms**: Network tab shows 404 errors

**Solution**:
1. Verify endpoint URL includes `/api` prefix
2. Check backend routes are registered:
   ```bash
   grep "@app.route" outfit-assistant/backend/app.py
   ```

### Issue 4: "Rate My Outfit" Button Not Working

**Symptoms**: Button click does nothing or shows error

**Checklist**:
1. ✅ Image is uploaded
2. ✅ Occasion is selected
3. ✅ Backend is running on port 5001
4. ✅ Frontend is accessing `http://localhost:5001/api/rate-outfit`
5. ✅ CORS allows `http://localhost:5174`

**Debug Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Rate My Outfit"
4. Look for POST request to `/api/rate-outfit`
5. Check request status:
   - **Pending/Failed**: Backend not running
   - **CORS Error**: Backend needs restart
   - **400/422**: Check request payload
   - **500**: Backend error - check backend logs

### Issue 5: "Generate Outfit" Button Not Working

**Symptoms**: Similar to Issue 4

**Same debugging steps as Issue 4**, but check:
- Endpoint: `/api/generate-outfit`
- Request body includes `user_image` field (not `image`)

## Manual Testing

### Test Rate Outfit API
```bash
curl -X POST http://localhost:5001/api/rate-outfit \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5174" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KG...",
    "occasion": "Casual",
    "budget": "Under $50"
  }'
```

### Test Generate Outfit API
```bash
curl -X POST http://localhost:5001/api/generate-outfit \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5174" \
  -d '{
    "user_image": "data:image/png;base64,iVBORw0KG...",
    "occasion": "Formal",
    "budget": "$100-$200"
  }'
```

## Environment Variables

### Backend `.env` File
Location: `backend/.env`

Required variables:
```env
OPENAI_API_KEY=sk-proj-...
FAL_API_KEY=...
FLASK_DEBUG=True
FLASK_ENV=development
```

### Frontend Environment
Location: `frontend/.env.local` (optional)

```env
VITE_API_URL=http://localhost:5001/api
```

## Logs

### Backend Logs
- Location: `backend/logs/outfit_assistant_YYYYMMDD.log`
- Console output when running backend

### Browser Console
- Open DevTools (F12)
- Console tab: JavaScript errors
- Network tab: API requests/responses

## Port Configuration

### Current Setup
- **Frontend**: 5174 (changed from 5173)
- **Backend**: 5001

### To Change Ports

**Frontend**:
1. Update `start.sh` line 71: `npm run dev -- --port YOUR_PORT`
2. Update backend CORS in `backend/app.py`

**Backend**:
1. Set `PORT` environment variable
2. Or change default in `backend/app.py` line 929

## Success Indicators

When everything is working:
1. ✅ Backend console shows: "Running on http://0.0.0.0:5001"
2. ✅ Frontend shows: "http://localhost:5174"
3. ✅ Browser console has no CORS errors
4. ✅ Network tab shows successful API calls
5. ✅ Buttons respond with loading states
6. ✅ Results appear after API calls

## Still Having Issues?

1. Run the test script: `./test_backend_connection.sh`
2. Check backend logs in `backend/logs/`
3. Verify all environment variables are set
4. Try clearing browser cache and reloading
5. Restart both frontend and backend
6. Check if port 5001 is already in use:
   ```bash
   lsof -i :5001
   ```

## Contact & Support

If issues persist:
1. Check backend logs for detailed error messages
2. Check browser console for JavaScript errors
3. Verify API keys are valid and not expired
4. Ensure Python dependencies are installed: `pip install -r requirements.txt`
5. Ensure Node dependencies are installed: `cd frontend && npm install`
