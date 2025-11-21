# Makefile for AI Outfit Assistant Docker Operations

.PHONY: help build up down logs clean restart shell-backend shell-frontend test

# Default target
help:
	@echo "AI Outfit Assistant - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build          Build all Docker images"
	@echo "  up             Start all services"
	@echo "  down           Stop all services"
	@echo "  restart        Restart all services"
	@echo "  logs           Show logs from all services"
	@echo "  logs-backend   Show backend logs only"
	@echo "  logs-frontend  Show frontend logs only"
	@echo "  clean          Remove containers, volumes, and images"
	@echo "  shell-backend  Open shell in backend container"
	@echo "  shell-frontend Open shell in frontend container"
	@echo "  ps             Show running containers"
	@echo "  rebuild        Clean rebuild of all services"
	@echo "  prod           Build and run in production mode"
	@echo "  dev            Build and run in development mode"
	@echo ""

# Build all images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start all services
up:
	@echo "Starting all services..."
	docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost:5000"

# Start with logs
up-logs:
	@echo "Starting all services with logs..."
	docker-compose up

# Stop all services
down:
	@echo "Stopping all services..."
	docker-compose down

# Restart all services
restart:
	@echo "Restarting all services..."
	docker-compose restart

# Show logs
logs:
	docker-compose logs -f

# Show backend logs only
logs-backend:
	docker-compose logs -f backend

# Show frontend logs only
logs-frontend:
	docker-compose logs -f frontend

# Clean up everything
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f
	@echo "Cleanup complete!"

# Deep clean (removes images too)
clean-all:
	@echo "Performing deep clean..."
	docker-compose down -v --rmi all
	docker system prune -af --volumes
	@echo "Deep clean complete!"

# Open shell in backend container
shell-backend:
	docker-compose exec backend bash

# Open shell in frontend container
shell-frontend:
	docker-compose exec frontend sh

# Show running containers
ps:
	docker-compose ps

# Rebuild everything from scratch
rebuild: clean build up
	@echo "Rebuild complete!"

# Production build and run
prod:
	@echo "Building for production..."
	FLASK_ENV=production FLASK_DEBUG=False docker-compose up --build -d
	@echo "Production deployment complete!"

# Development build and run
dev:
	@echo "Building for development..."
	FLASK_ENV=development FLASK_DEBUG=True docker-compose up --build
	@echo "Development server started!"

# Check health of services
health:
	@echo "Checking service health..."
	@curl -f http://localhost:5000/api/health && echo "✓ Backend healthy" || echo "✗ Backend unhealthy"
	@curl -f http://localhost/ && echo "✓ Frontend healthy" || echo "✗ Frontend unhealthy"

# Run backend tests (if you have tests)
test-backend:
	docker-compose exec backend python -m pytest

# Show Docker resource usage
stats:
	docker stats --no-stream

# Backup volumes
backup:
	@echo "Creating backup of volumes..."
	docker run --rm -v outfit-assistant_backend_cache:/data -v $(PWD)/backups:/backup alpine tar czf /backup/backend_cache_$(shell date +%Y%m%d_%H%M%S).tar.gz -C /data .
	@echo "Backup complete!"

# Update images
update:
	@echo "Pulling latest base images..."
	docker-compose pull
	@echo "Rebuilding services..."
	docker-compose up --build -d
	@echo "Update complete!"
