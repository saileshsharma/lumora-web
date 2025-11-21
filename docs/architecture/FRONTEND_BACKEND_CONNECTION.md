# Frontend-Backend Connection Guide

## Overview

The frontend and refactored backend are now fully connected and working together seamlessly.

## Current Setup

### Backend (Refactored)
- **Server**: Running on `http://localhost:5001`
- **Entry Point**: `backend/app_refactored.py`
- **Architecture**: Clean Architecture with services, routes, and middleware
- **Status**: ✅ Running and healthy

### Frontend
- **Server**: Running on `http://localhost:5174`
- **Framework**: React + TypeScript + Vite
- **API Client**: `src/services/api.ts`
- **Status**: ✅ Running and connected

## API Endpoints

### Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "message": "Outfit Assistant API is running"
  }
  ```

### Rate Outfit
- **Endpoint**: `POST /api/rate-outfit`
- **Request**:
  ```json
  {
    "image": "data:image/png;base64,...",
    "occasion": "Casual Outing",
    "budget": "Under $50"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": "{...rating data as JSON string...}"
  }
  ```

### Generate Outfit
- **Endpoint**: `POST /api/generate-outfit`
- **Request**:
  ```json
  {
    "user_image": "data:image/png;base64,...",
    "occasion": "Casual Outing",
    "wow_factor": 5,
    "brands": ["Nike", "Adidas"],
    "budget": "Under $50",
    "conditions": "Prefer sustainable fashion"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": "{...outfit data and image as JSON string...}"
  }
  ```

## CORS Configuration

### Backend (app/config/settings.py)
```python
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://lumora-web-production.up.railway.app",
    "https://web-production-c70ba.up.railway.app",
]
```

### Frontend (src/constants/index.ts)
```typescript
const getApiBaseUrl = () => {
  // Development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5001/api';
  }

  // Production
  return 'https://web-production-c70ba.up.railway.app/api';
};
```

## How to Run Both Services

### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
source ../venv/bin/activate
python3 app_refactored.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using the Startup Script

```bash
# Create a startup script
./start.sh
```

Or use the Python startup script:
```bash
python3 start.py
```

## API Client Usage

### Frontend API Service (src/services/api.ts)

**Rate Outfit:**
```typescript
import { raterApi } from '../services/api';

const result = await raterApi.rateOutfit(
  imageBase64,
  'Casual Outing',
  'Under $50'
);
```

**Generate Outfit:**
```typescript
import { generatorApi } from '../services/api';

const result = await generatorApi.generateOutfit(
  imageBase64,
  'Casual Outing',
  'Under $50'
);
```

**Error Handling:**
```typescript
import { ApiException } from '../services/api';

try {
  const result = await raterApi.rateOutfit(...);
} catch (error) {
  if (error instanceof ApiException) {
    console.error('API Error:', error.message, error.status);
  }
}
```

## Response Format

Both backend endpoints return data in the same format:

```json
{
  "success": true,
  "data": "<JSON-stringified-data>"
}
```

The frontend automatically parses this:

```typescript
const response = await fetchWithErrorHandling<{ data: string }>('/rate-outfit', {...});
return JSON.parse(response.data);
```

## Testing the Connection

### 1. Test Backend Health
```bash
curl http://localhost:5001/api/health
```

Expected output:
```json
{
  "message": "Outfit Assistant API is running",
  "status": "healthy"
}
```

### 2. Test Frontend
Open browser to `http://localhost:5174`

### 3. Test API Connection
1. Upload an image in the frontend
2. Select an occasion
3. Click "Rate My Outfit"
4. Check browser console for API requests
5. Check backend terminal for request logs

## Troubleshooting

### CORS Errors

**Problem**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: Ensure backend CORS is configured correctly in `app/config/settings.py` and includes your frontend URL.

### Connection Refused

**Problem**: `Failed to fetch` or `Connection refused`

**Solution**:
1. Check backend is running: `curl http://localhost:5001/api/health`
2. Check correct port (5001 for backend, 5174 for frontend)
3. Verify `API_BASE_URL` in `frontend/src/constants/index.ts`

### 404 Not Found

**Problem**: `404 Not Found` on API endpoints

**Solution**:
1. Ensure endpoint URL includes `/api/` prefix
2. Check route is registered in `app/__init__.py`
3. Verify blueprint URL prefix

### Response Parsing Errors

**Problem**: `JSON.parse: unexpected character`

**Solution**:
1. Check backend returns `{ data: json.dumps(result) }`
2. Verify frontend uses `JSON.parse(response.data)`

## Environment Variables

### Backend (.env)
```bash
OPENAI_API_KEY=your_key_here
FAL_API_KEY=your_key_here
NANOBANANA_API_KEY=your_key_here
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5001
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5001/api
```

## Deployment

### Production Backend URL
```
https://web-production-c70ba.up.railway.app/api
```

### Production Frontend URL
```
https://lumora-web-production.up.railway.app
```

## Status

✅ **Backend**: Refactored with Clean Architecture
✅ **Frontend**: Connected to refactored backend
✅ **CORS**: Properly configured
✅ **API Endpoints**: `/health`, `/rate-outfit`, `/generate-outfit`
✅ **Error Handling**: Centralized with custom exceptions
✅ **Response Format**: Consistent JSON structure

## Next Steps

1. ✅ Test Rate Outfit endpoint with real image
2. ✅ Test Generate Outfit endpoint
3. ⏳ Add Arena endpoints to refactored backend
4. ⏳ Deploy refactored backend to Railway
5. ⏳ Update frontend deployment configuration

---

*Last Updated: November 21, 2025*
*Status: ✅ Frontend and Backend Connected*
