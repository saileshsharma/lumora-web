#!/bin/bash

# Production URL Checker for Lumora Deployment

echo "========================================="
echo "🔍 LUMORA PRODUCTION URL CHECKER"
echo "========================================="
echo ""

# Known URLs
BACKEND_URL="https://web-production-81b07.up.railway.app"
FRONTEND_URL="https://lumora.aihack.workers.dev"

echo "📍 Known URLs:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo ""

echo "========================================="
echo "✅ Testing Backend Health"
echo "========================================="
curl -s "$BACKEND_URL/api/health" | jq '.' 2>/dev/null || curl -s "$BACKEND_URL/api/health"
echo ""

echo "========================================="
echo "🔐 Testing Backend Auth Status"
echo "========================================="
curl -s "$BACKEND_URL/api/auth/status" | jq '.' 2>/dev/null || curl -s "$BACKEND_URL/api/auth/status"
echo ""

echo "========================================="
echo "🔑 Checking Keycloak Configuration"
echo "========================================="
echo "Attempting to get Keycloak config from backend..."
curl -s "$BACKEND_URL/api/auth/keycloak-config" | jq '.' 2>/dev/null || curl -s "$BACKEND_URL/api/auth/keycloak-config"
echo ""

echo "========================================="
echo "📋 Available Endpoints Test"
echo "========================================="
echo "Testing common endpoints:"

endpoints=(
  "/api/health"
  "/api/auth/status"
  "/api/auth/keycloak-config"
  "/api/outfit/rate"
  "/api/outfit/generate"
)

for endpoint in "${endpoints[@]}"; do
  echo -n "  $endpoint ... "
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL$endpoint")
  if [ "$status_code" -eq 200 ]; then
    echo "✅ $status_code"
  elif [ "$status_code" -eq 401 ]; then
    echo "🔒 $status_code (Auth required - OK)"
  elif [ "$status_code" -eq 405 ]; then
    echo "⚠️  $status_code (Method not allowed - endpoint exists)"
  else
    echo "❌ $status_code"
  fi
done
echo ""

echo "========================================="
echo "🌐 Testing Frontend"
echo "========================================="
echo -n "Frontend accessibility ... "
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$frontend_status" -eq 200 ]; then
  echo "✅ $frontend_status"
else
  echo "❌ $frontend_status"
fi
echo ""

echo "========================================="
echo "🔍 Searching for Keycloak URL"
echo "========================================="
echo "Checking Railway environment variables..."
echo "Please provide your Keycloak Railway URL."
echo ""
echo "To find it:"
echo "1. Go to Railway Dashboard"
echo "2. Find your Keycloak service"
echo "3. Go to Settings → Networking → Public Domain"
echo ""
read -p "Enter Keycloak URL (or press Enter to skip): " KEYCLOAK_URL

if [ -n "$KEYCLOAK_URL" ]; then
  echo ""
  echo "Testing Keycloak at: $KEYCLOAK_URL"
  echo -n "Keycloak health check ... "
  kc_status=$(curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_URL/health/ready")
  if [ "$kc_status" -eq 200 ]; then
    echo "✅ $kc_status"
    echo ""
    echo "Keycloak response:"
    curl -s "$KEYCLOAK_URL/health/ready" | jq '.' 2>/dev/null || curl -s "$KEYCLOAK_URL/health/ready"
  else
    echo "❌ $kc_status"
  fi

  echo ""
  echo -n "Keycloak realm endpoint ... "
  realm_status=$(curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_URL/realms/lumora")
  if [ "$realm_status" -eq 200 ]; then
    echo "✅ $realm_status (Realm 'lumora' exists!)"
  else
    echo "⚠️  $realm_status (Realm may not be configured yet)"
  fi
fi

echo ""
echo "========================================="
echo "📝 SUMMARY"
echo "========================================="
echo "Frontend:  $FRONTEND_URL"
echo "Backend:   $BACKEND_URL"
if [ -n "$KEYCLOAK_URL" ]; then
  echo "Keycloak:  $KEYCLOAK_URL"
else
  echo "Keycloak:  ⚠️  NOT PROVIDED"
fi
echo ""
echo "Next Steps:"
echo "1. If Keycloak URL is missing, check Railway dashboard"
echo "2. Configure Keycloak realm 'lumora' if not exists"
echo "3. Create frontend and backend clients in Keycloak"
echo "4. Update backend KEYCLOAK_SERVER_URL environment variable"
echo "5. Update frontend with production URLs"
echo ""
echo "========================================="
