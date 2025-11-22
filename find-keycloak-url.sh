#!/bin/bash

echo "========================================="
echo "🔍 Finding Keycloak URL from Railway"
echo "========================================="
echo ""

PROJECTS=("distinguished-analysis" "vigilant-exploration" "athletic-eagerness" "adorable-transformation")
BACKEND_URL="web-production-81b07.up.railway.app"

for project in "${PROJECTS[@]}"; do
  echo "Checking project: $project"

  # Link to project
  railway link $project > /dev/null 2>&1

  # Get services
  services=$(railway service 2>&1)

  # Check if this project has our backend
  if echo "$services" | grep -q "web"; then
    echo "  ✅ Found backend service in: $project"
    echo ""
    echo "  Services in this project:"
    railway service 2>&1
    echo ""
    echo "  Getting domains for all services..."
    echo ""

    # Try to get variables for each service to find Keycloak
    railway variables 2>&1 | grep -i "keycloak\|KC_" | head -5

    echo ""
    echo "========================================="
    echo "Found the project! Linking to: $project"
    echo "========================================="
    railway link $project
    break
  else
    echo "  ⏭️  No backend service found, skipping..."
  fi
  echo ""
done

echo ""
echo "Getting all services in the linked project..."
railway service

echo ""
echo "To get Keycloak URL, we need to check the service domain."
echo "Run: railway domain"
