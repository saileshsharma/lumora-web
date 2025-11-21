# AI Outfit Assistant - Documentation

Complete documentation for the AI Outfit Assistant project.

## 📚 Documentation Structure

### 🚀 Getting Started
- [README.md](../README.md) - Main project readme
- [Quick Start Guide](guides/QUICKSTART.md) - Get up and running quickly
- [Startup Guide](guides/STARTUP_GUIDE.md) - Detailed startup instructions

### 🔧 Setup & Configuration
- [FAL Setup](setup/FAL_SETUP_GUIDE.md) - FAL AI image generation setup
- [NanoBanana Integration](setup/NANOBANANA_INTEGRATION.md) - NanoBanana API setup
- [Gemini Setup](setup/GEMINI_SETUP.md) - Google Gemini integration
- [Imagen Setup](setup/IMAGEN_SETUP_GUIDE.md) - Google Imagen setup
- [Virtual Try-On Setup](setup/VIRTUAL_TRYON_SETUP.md) - Virtual try-on configuration

### 🏗️ Architecture
- [Frontend-Backend Connection](architecture/FRONTEND_BACKEND_CONNECTION.md) - API integration details
- [Refactoring Summary](architecture/REFACTORING_SUMMARY.md) - Backend refactoring documentation
- [Technical Limitations](architecture/TECHNICAL_LIMITATION.md) - Known limitations and constraints

### 📖 User Guides
- [Project Summary](guides/PROJECT_SUMMARY.md) - Overall project overview
- [Fashion Arena Guide](guides/FASHION_ARENA_GUIDE.md) - Using the Fashion Arena feature
- [Logging Guide](guides/LOGGING_GUIDE.md) - Application logging documentation

### 🚢 Deployment
- [Railway Deployment](deployment/RAILWAY_DEPLOYMENT_GUIDE.md) - Deploy to Railway
- [Docker Setup](deployment/DOCKER_README.md) - Docker deployment guide
- [Quick Start Docker](deployment/QUICK_START_DOCKER.md) - Fast Docker setup

### 🧪 Testing
- [Testing Summary](testing/TESTING_SUMMARY.md) - Automated testing documentation
- [Test API](testing/test_api.html) - API testing tool
- [Test Connectivity](testing/test_connectivity.html) - Connection testing
- [Test Frontend](testing/test_frontend.html) - Frontend testing suite

## 📁 Project Structure

```
outfit-assistant/
├── backend/              # Flask backend with Clean Architecture
│   ├── app/
│   │   ├── api/         # API routes and middlewares
│   │   ├── services/    # Business logic services
│   │   ├── config/      # Configuration management
│   │   └── utils/       # Utility functions
│   ├── logs/            # Application logs
│   └── tests/           # Backend tests
├── frontend/            # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   ├── store/       # Zustand state management
│   │   └── constants/   # Application constants
│   └── public/          # Static assets
└── docs/                # Documentation (you are here)
    ├── guides/          # User guides
    ├── setup/           # Setup instructions
    ├── deployment/      # Deployment guides
    ├── architecture/    # Technical architecture
    └── testing/         # Testing documentation
```

## 🔗 Quick Links

### For Developers
- [Backend Refactoring](architecture/REFACTORING_SUMMARY.md)
- [API Connection](architecture/FRONTEND_BACKEND_CONNECTION.md)
- [Testing Guide](testing/TESTING_SUMMARY.md)

### For Users
- [Getting Started](guides/QUICKSTART.md)
- [Fashion Arena](guides/FASHION_ARENA_GUIDE.md)
- [Project Overview](guides/PROJECT_SUMMARY.md)

### For DevOps
- [Railway Deploy](deployment/RAILWAY_DEPLOYMENT_GUIDE.md)
- [Docker Setup](deployment/DOCKER_README.md)

## 🆘 Common Tasks

### Setup Development Environment
1. Read [Startup Guide](guides/STARTUP_GUIDE.md)
2. Configure [FAL API](setup/FAL_SETUP_GUIDE.md)
3. Set up [NanoBanana](setup/NANOBANANA_INTEGRATION.md)

### Deploy to Production
1. Follow [Railway Deployment](deployment/RAILWAY_DEPLOYMENT_GUIDE.md)
2. Configure environment variables
3. Test with [API Test Tool](testing/test_api.html)

### Debug Issues
1. Check [Logging Guide](guides/LOGGING_GUIDE.md)
2. Use [Test Tools](testing/)
3. Review [Technical Limitations](architecture/TECHNICAL_LIMITATION.md)

## 📝 Contributing

When adding new documentation:
1. Place it in the appropriate category folder
2. Update this README with a link
3. Use clear, concise language
4. Include code examples where relevant

## 🏷️ Version

Documentation last updated: November 21, 2025

## 📧 Support

For issues or questions, please refer to the relevant guide above or check the main [README](../README.md).
