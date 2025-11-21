# 🚀 Quick Start Guide

Get the AI Outfit Assistant running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd outfit-assistant/backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Step 2: Configure API Key

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
```

## Step 3: Start Backend

```bash
# In backend directory with venv activated
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
```

## Step 4: Open Frontend

**Option A - Simple (Double-click)**
- Navigate to `outfit-assistant/frontend/`
- Double-click `index.html`

**Option B - Local Server (Recommended)**
```bash
# In a new terminal
cd outfit-assistant/frontend
python -m http.server 8080
```
Then visit: http://localhost:8080

## 🎉 You're Ready!

### Try Outfit Rater:
1. Click "Outfit Rater" tab
2. Upload an outfit photo
3. Select an occasion
4. Click "Rate My Outfit"

### Try Outfit Generator:
1. Click "Outfit Generator" tab
2. Set your wow factor (1-10)
3. Enter budget (e.g., "$200-500")
4. Select occasion
5. Click "Generate Outfit"
6. Wait 20-30 seconds for AI magic! ✨

## 🆘 Need Help?

**Backend not starting?**
- Check Python version: `python --version` (need 3.8+)
- Ensure venv is activated
- Reinstall: `pip install -r requirements.txt`

**No API key error?**
- Create `.env` in `backend/` folder
- Add: `OPENAI_API_KEY=sk-your-key`
- Restart backend

**Frontend can't connect?**
- Ensure backend is running (port 5000)
- Check browser console for errors
- Try using local server (Option B)

## 💡 Tips

- First generation takes ~30 seconds (DALL-E 3 is creating art!)
- Each request costs ~$0.05-0.07 (OpenAI API)
- Monitor usage: https://platform.openai.com/usage
- Use demo photos to test before real use

## 📖 Full Documentation

See [README.md](README.md) for complete documentation.

---

**Happy Styling! 👗✨**
