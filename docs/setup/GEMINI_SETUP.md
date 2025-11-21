# Google Gemini Integration Setup Guide

This guide will help you set up Google Gemini for AI-powered outfit image generation.

## What Changed

We've replaced the Replicate virtual try-on with **Google Gemini 2.0**, which provides:

✅ **Same person's face and identity** preserved  
✅ **New outfit** matching recommendations  
✅ **Dynamic pose and gesture** appropriate for the occasion  
✅ **Occasion-appropriate background** (office, street, restaurant, etc.)  
✅ **Matching facial expression and mood**  
✅ **Photo-realistic quality**  

## Setup Steps

### 1. Get Your Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy your API key (starts with `AIza...`)

**Note**: Google Gemini API is currently **free** with generous rate limits!

### 2. Add API Key to .env File

1. Open `outfit-assistant/backend/.env`
2. Add your Google API key:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_key_here

# Google Gemini API Configuration (for image generation)
GOOGLE_API_KEY=AIzaSy...your_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### 3. Restart Your Backend Server

```bash
# Stop the server (Ctrl+C)
# Start again:
python outfit-assistant/backend/app.py
```

## How It Works

### Process Flow

1. **User uploads photo** → Your image is saved
2. **GPT-4 generates outfit recommendations** → Text description of perfect outfit
3. **Gemini generates final image** → Takes your photo + outfit description + occasion
4. **Result**: Same person wearing new outfit with appropriate background and pose!

### Example Process

**Input:**
- Your photo (casual pose, home background)
- Occasion: Job Interview
- Outfit: Navy suit, white shirt, burgundy tie

**Gemini Output:**
- **Same face/person** as your photo
- **Professional pose** (standing confidently)
- **Serious/professional expression**
- **Office background** (professional lobby)
- **Complete outfit** matching recommendations

## Testing

1. **Start the backend:**
   ```bash
   python outfit-assistant/backend/app.py
   ```

2. **Open the frontend:**
   - Open `outfit-assistant/frontend/index.html` in your browser

3. **Generate an outfit:**
   - Go to "Outfit Generator" tab
   - Upload a clear photo of yourself
   - Select occasion (e.g., "Job Interview")
   - Click "Generate Outfit"

4. **Watch the console** for progress:
   ```
   ============================================================
   GENERATING IMAGE WITH GOOGLE GEMINI
   ============================================================
   ✓ Person image saved: ...
   ✓ Occasion: Job Interview
   ✓ Outfit: ...
   ✓ Background: professional office lobby...
   ✓ Image loaded: (width, height)
   
   Calling Gemini API...
   ✓ Gemini response received
   ✓ Image generated and saved: ...
   
   ============================================================
   IMAGE GENERATION SUCCESSFUL!
   ============================================================
   ```

## Benefits vs Previous Approach

### Previous (Replicate Virtual Try-On)
- ✅ Same person
- ✅ New outfit
- ❌ Original pose/background
- ❌ Fixed expression
- 💰 Cost: ~$0.03 per generation

### New (Google Gemini)
- ✅ Same person
- ✅ New outfit
- ✅ **Dynamic pose for occasion**
- ✅ **Occasion-appropriate background**
- ✅ **Matching expression/mood**
- 💰 Cost: **FREE** (with rate limits)

## Troubleshooting

### "GOOGLE_API_KEY not configured"
- Make sure you added the key to your `.env` file
- Restart the backend server after adding the key

### "Gemini did not return an image"
- Check your API key is valid
- Ensure you have Gemini API access enabled
- Check rate limits on Google AI Studio

### Image quality issues
- Upload a clear, well-lit photo
- Full or 3/4 body shots work best
- Ensure face is clearly visible
- Neutral background in original photo helps

## API Costs

- **Google Gemini 2.0**: Currently FREE
  - Free tier: 60 requests per minute
  - Plenty for personal use!

- **OpenAI GPT-4**: ~$0.03 per outfit recommendation
  - Still needed for fashion recommendations
  - Gemini generates the image

**Total per generation**: ~$0.03 (just GPT-4 for recommendations)

## Rate Limits

- **Gemini Free Tier**: 60 requests/minute, 1500/day
- More than enough for testing and personal use!

## Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify your API key is correct
3. Ensure you have internet connectivity
4. Check Google AI Studio for API status

Enjoy creating stunning outfit visualizations! 🎉
