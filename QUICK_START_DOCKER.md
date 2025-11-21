# Quick Start Guide - Docker

Get your AI Outfit Assistant running with Docker in 5 minutes!

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- API keys ready (OpenAI, FAL, NanoBanana)

## Step 1: Clone and Navigate

```bash
cd outfit-assistant
```

## Step 2: Set Up Environment Variables

Create a `.env` file with your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your real API keys:

```env
FLASK_ENV=production
FLASK_DEBUG=False

OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
FAL_API_KEY=YOUR_ACTUAL_FAL_KEY_HERE
NANOBANANA_API_KEY=YOUR_ACTUAL_NANOBANANA_KEY_HERE
```

## Step 3: Build and Run

### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up --build
```

Wait for the build to complete (first time takes 2-3 minutes).

When you see:
```
backend_1   | * Running on http://0.0.0.0:5000
frontend_1  | ... ready
```

Your app is ready!

### Option B: Using Single Dockerfile

```bash
docker build -t outfit-assistant .
docker run -p 8080:8080 --env-file .env outfit-assistant
```

## Step 4: Access Your Application

Open your browser:

**Docker Compose:**
- Frontend: http://localhost
- Backend API: http://localhost:5000

**Single Container:**
- Full App: http://localhost:8080

## Step 5: Test It Out

1. Login with any email/password (demo mode)
2. Upload a photo of your outfit
3. Select an occasion
4. Click "Rate My Outfit"
5. Get AI-powered fashion advice!

## Quick Commands

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Clean everything
```bash
docker-compose down -v
docker system prune -a
```

## Troubleshooting

### Port already in use?

Edit `docker-compose.yml` and change ports:
```yaml
frontend:
  ports:
    - "8080:80"  # Changed from 80:80
backend:
  ports:
    - "5001:5000"  # Changed from 5000:5000
```

### Backend not starting?

Check logs:
```bash
docker-compose logs backend
```

Verify API keys:
```bash
cat .env
```

### Can't connect to backend?

Make sure both services are running:
```bash
docker-compose ps
```

Both should show "Up" status.

## Production Deployment

For production, update `.env`:
```env
FLASK_ENV=production
FLASK_DEBUG=False
```

Then deploy to your preferred platform:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Heroku Container Registry

See `DOCKER_README.md` for detailed deployment instructions.

## Next Steps

- Read `DOCKER_README.md` for advanced configuration
- Check `README.md` for feature documentation
- Customize styles in `frontend/src/styles/`
- Add your own team info in `frontend/src/components/Team/TeamPage.tsx`

## Need Help?

1. Check logs: `docker-compose logs`
2. Verify environment: `docker-compose config`
3. Review `DOCKER_README.md` troubleshooting section
4. Open an issue on GitHub

Happy styling! 👔✨
