# How to Use "Rate My Outfit" Locally

**Date:** November 22, 2025
**Status:** ✅ All Systems Working

---

## 🎯 Quick Start

The "Rate My Outfit" feature is **working perfectly**! Here's how to use it:

### Step 1: Start All Services

Make sure all services are running:

```bash
# From the outfit-assistant directory
./start.sh
```

This starts:
- ✅ Keycloak (Port 8080) - Authentication
- ✅ PostgreSQL (Port 5432) - Database
- ✅ Backend API (Port 5001) - Python Flask
- ✅ Frontend (Port 5174) - React App

---

## Step 2: Login to the Application

1. **Open your browser** and visit:
   ```
   http://localhost:5174
   ```

2. **You'll see the Keycloak login page** (this is REQUIRED - you cannot use the app without logging in)

3. **Login with test credentials:**
   ```
   Email: sailesh.sharma@gmail.com
   Password: Admin@123
   ```

4. **After successful login**, you'll see the main application with:
   - Header with your name
   - User menu (click your name for Profile/Logout)
   - Navigation tabs (Rater, Generator, Arena, etc.)

---

## Step 3: Rate Your Outfit

1. **Click on "Rate My Outfit"** tab (should be selected by default)

2. **Upload a photo:**
   - Click "Upload Photo" or "Take Photo"
   - Select an image of your outfit
   - Supported formats: JPEG, PNG, WebP (max 10MB)

3. **Select occasion:** Choose from:
   - Casual
   - Formal
   - Business
   - Party
   - Wedding
   - Date Night
   - Gym
   - Beach
   - Travel
   - Or enter custom occasion

4. **Select budget (optional):**
   - Under $50
   - $50-$100
   - $100-$200
   - $200-$500
   - Above $500
   - No budget limit

5. **Click "Rate My Outfit"** button

6. **Wait for AI analysis** (takes 10-15 seconds)

7. **View your results:**
   - Wow Factor Score (1-10)
   - Occasion Fitness Score (1-10)
   - Overall Rating (1-10)
   - Detailed feedback
   - Strengths
   - Areas for improvement
   - Specific suggestions
   - Humorous "roast"
   - Shopping recommendations

---

## ✅ System Health Check

All services are confirmed working:

| Service | Status | Port | Health Check |
|---------|--------|------|--------------|
| Keycloak | ✅ Running | 8080 | http://localhost:8080/health/ready |
| PostgreSQL | ✅ Running | 5432 | Connected via Keycloak |
| Backend API | ✅ Running | 5001 | http://localhost:5001/api/health |
| Frontend | ✅ Running | 5174 | http://localhost:5174 |

---

## 🔐 Authentication Flow

The app uses **Keycloak** for enterprise-grade authentication:

1. **First Visit:** Shows Keycloak login page
2. **Login:** Authenticates with Keycloak server
3. **Token:** Receives OAuth2 access token (expires in 5 minutes)
4. **Auto-Refresh:** Token refreshes automatically every 4 minutes
5. **Logout:** Click your name → Logout (with confirmation)

**Why authentication is required:**
- Protects against abuse
- Rate limiting per user
- Tracks user preferences
- Enables personalized features
- Enterprise-grade security

---

## 🐛 Troubleshooting

### "Not Working" - Common Issues

#### Issue 1: Not Logged In
**Symptom:** Can't see the "Rate My Outfit" interface
**Solution:** Login at http://localhost:5174 with credentials above

#### Issue 2: Services Not Running
**Symptom:** Cannot connect to server
**Solution:**
```bash
# Check if services are running
docker ps | grep keycloak
curl http://localhost:5001/api/health
curl http://localhost:5174

# Restart services
./start.sh
```

#### Issue 3: Token Expired
**Symptom:** "Unauthorized" error after being idle
**Solution:** The app auto-refreshes tokens. If you still get errors, logout and login again

#### Issue 4: Keycloak Not Responding
**Symptom:** Login page doesn't load
**Solution:**
```bash
# Restart Keycloak
docker restart lumora-keycloak

# Wait 30 seconds for it to start
sleep 30

# Check health
curl http://localhost:8080/health/ready
```

#### Issue 5: Backend Errors
**Symptom:** Analysis fails or times out
**Solution:**
```bash
# Check backend logs
tail -50 backend/logs/application_*.log
tail -50 backend/logs/errors_*.log

# Restart backend
cd backend
python app.py
```

---

## 📊 Recent Test Results

**Tested:** November 22, 2025, 19:17:45

```bash
✅ Keycloak: Healthy
✅ Backend: Healthy
✅ Frontend: Accessible
✅ Authentication: Working (token obtained)
✅ Rate Outfit API: HTTP 200 Success
✅ GPT-4 Vision: Processing images
✅ Complete Flow: End-to-end working
```

**Test Request Log:**
```
2025-11-22 19:17:45 - RATE OUTFIT REQUEST RECEIVED
Parameters - Occasion: casual, Budget: $50-$100
2025-11-22 19:17:54 - Rating analysis completed successfully
✅ SUCCESS in 9 seconds
```

---

## 🚀 Example Usage

### Complete Flow

1. **Visit:** http://localhost:5174
2. **Login:** sailesh.sharma@gmail.com / Admin@123
3. **Upload:** Photo of your outfit
4. **Select:** Occasion = "Party", Budget = "$100-$200"
5. **Click:** "Rate My Outfit"
6. **Wait:** 10-15 seconds for AI analysis
7. **Read:** Detailed ratings and recommendations
8. **Action:** Use "Generate Improved Outfit" or "Submit to Arena"

### What You Get

- **Numeric Scores:** Objective ratings (1-10)
- **Detailed Feedback:** What works, what doesn't
- **Actionable Suggestions:** Colors, fit, accessories
- **Shopping Recommendations:** Specific items with prices
- **Fun Roast:** Humorous, witty fashion critique

---

## 💡 Tips for Best Results

### Photo Quality
- ✅ Good lighting (natural light preferred)
- ✅ Full outfit visible (head to shoes)
- ✅ Clear focus (not blurry)
- ✅ Neutral background
- ✅ Standing pose (not sitting)

### Accuracy
- ✅ Match occasion to your actual need
- ✅ Set realistic budget
- ✅ Use recent photos
- ✅ Show complete outfit (including shoes, accessories)

---

## 🎨 Other Features

After rating your outfit, you can:

1. **Generate Improved Outfit:**
   - Click "Generate Improved Outfit" button
   - AI creates a better version based on recommendations
   - Uses your photo + suggestions

2. **Submit to Fashion Arena:**
   - Share your outfit with community
   - Get votes and feedback
   - Compete on leaderboard

3. **View Profile:**
   - Click your name → My Profile
   - See your stats and preferences
   - Manage account settings

---

## 🔧 Technical Details

### API Endpoint
```
POST http://localhost:5001/api/rate-outfit
Content-Type: application/json
Authorization: Bearer <keycloak-token>

{
  "image": "data:image/png;base64,...",
  "occasion": "casual",
  "budget": "$50-$100"
}
```

### Response Format
```json
{
  "data": "{...json string...}",
  "success": true
}
```

### AI Model
- **Model:** GPT-4 Vision (gpt-4o)
- **Max Tokens:** 1500
- **Average Response Time:** 8-12 seconds
- **Rate Limit:** 20 requests per hour

---

## ✅ Confirmed Working

As of November 22, 2025:

- ✅ All services running
- ✅ Keycloak authentication working
- ✅ Backend processing requests
- ✅ Frontend displaying results
- ✅ GPT-4 Vision analyzing outfits
- ✅ No errors in logs
- ✅ CORS configured correctly
- ✅ Token refresh working
- ✅ Complete end-to-end flow tested

---

## 📞 Need Help?

If you're still having issues:

1. **Check this guide** - Most issues are covered above
2. **Check logs:**
   ```bash
   tail -50 backend/logs/application_*.log
   tail -50 backend/logs/errors_*.log
   ```
3. **Restart services:** `./start.sh`
4. **Clear browser cache** and try again
5. **Try different browser** (Chrome, Firefox, Safari)

---

**Status:** ✅ WORKING PERFECTLY
**Last Tested:** November 22, 2025
**Version:** 2.0 with Keycloak Authentication
