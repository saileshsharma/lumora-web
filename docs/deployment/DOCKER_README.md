# Docker Setup for AI Outfit Assistant

This guide explains how to run the AI Outfit Assistant application using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)
- API keys for OpenAI, FAL, and NanoBanana

## Quick Start

### 1. Environment Setup

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your actual API keys:

```
OPENAI_API_KEY=your_actual_openai_key
FAL_API_KEY=your_actual_fal_key
NANOBANANA_API_KEY=your_actual_nanobanana_key
```

### 2. Build and Run with Docker Compose

Start all services:

```bash
docker-compose up --build
```

Or run in detached mode:

```bash
docker-compose up -d --build
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:5000

### 3. Stop the Application

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

## Individual Service Deployment

### Backend Only

```bash
cd backend
docker build -t outfit-assistant-backend .
docker run -p 5000:5000 \
  -e OPENAI_API_KEY=your_key \
  -e FAL_API_KEY=your_key \
  -e NANOBANANA_API_KEY=your_key \
  outfit-assistant-backend
```

### Frontend Only

```bash
cd frontend
docker build -t outfit-assistant-frontend .
docker run -p 80:80 outfit-assistant-frontend
```

## Production Deployment

### Using Docker Compose

1. Update environment variables in `.env` for production
2. Build and run:

```bash
docker-compose -f docker-compose.yml up -d --build
```

### Using Single Dockerfile

Build the complete application:

```bash
docker build -t outfit-assistant:latest .
docker run -p 8080:8080 \
  -e OPENAI_API_KEY=your_key \
  -e FAL_API_KEY=your_key \
  -e NANOBANANA_API_KEY=your_key \
  outfit-assistant:latest
```

## Docker Commands Reference

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Execute Commands in Container

```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh
```

### Check Service Health

```bash
docker-compose ps
```

### Rebuild After Changes

```bash
# Rebuild all
docker-compose up --build

# Rebuild specific service
docker-compose up --build backend
```

## Container Management

### List Running Containers

```bash
docker ps
```

### Stop All Containers

```bash
docker stop $(docker ps -q)
```

### Remove All Containers

```bash
docker rm $(docker ps -aq)
```

### Clean Up Docker System

```bash
# Remove unused images, containers, networks
docker system prune -a

# Remove volumes as well
docker system prune -a --volumes
```

## Troubleshooting

### Port Already in Use

If port 80 or 5000 is already in use, modify the ports in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 80 to 8080
  backend:
    ports:
      - "5001:5000"  # Change 5000 to 5001
```

### API Connection Issues

1. Check if backend is running:
   ```bash
   curl http://localhost:5000/health
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Verify environment variables:
   ```bash
   docker-compose exec backend env | grep API_KEY
   ```

### Container Won't Start

1. Check logs:
   ```bash
   docker-compose logs
   ```

2. Verify Docker resources (memory, CPU)
3. Check if all required files are present
4. Rebuild with no cache:
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

### Frontend Can't Connect to Backend

Update the API base URL in `frontend/src/services/api.ts` to point to the correct backend URL.

For Docker Compose setup, nginx proxy is configured to forward `/api/` requests to the backend.

## Security Considerations

1. **Never commit `.env` files** with real API keys
2. Use Docker secrets for sensitive data in production
3. Update nginx security headers in `frontend/nginx.conf`
4. Use HTTPS in production with reverse proxy (nginx, Traefik, etc.)
5. Implement rate limiting for API endpoints
6. Regularly update base images for security patches

## Performance Optimization

### Multi-stage Builds

The Dockerfiles use multi-stage builds to minimize image size:
- Frontend: ~50MB (nginx-alpine)
- Backend: ~500MB (python slim)

### Caching

Docker layer caching is optimized by:
- Installing dependencies before copying source code
- Using `.dockerignore` to exclude unnecessary files

### Resource Limits

Add resource limits in `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          memory: 512M
```

## Cloud Deployment

### AWS ECS

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag outfit-assistant:latest <account>.dkr.ecr.us-east-1.amazonaws.com/outfit-assistant:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/outfit-assistant:latest
```

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/outfit-assistant
gcloud run deploy outfit-assistant --image gcr.io/PROJECT_ID/outfit-assistant --platform managed
```

### Azure Container Instances

```bash
az acr build --registry <registry-name> --image outfit-assistant:latest .
az container create --resource-group myResourceGroup --name outfit-assistant --image <registry-name>.azurecr.io/outfit-assistant:latest
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Review troubleshooting section
4. Check GitHub issues

## License

See main README.md for license information.
