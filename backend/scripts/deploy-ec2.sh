#!/usr/bin/env bash
# ===================================================================
# ProductHub – One-Click AWS EC2 Ubuntu Deployment Script
# Usage: ./scripts/deploy-ec2.sh
# ===================================================================

set -e # Exit immediately if any command fails

echo "===================================================="
echo "🚀 INITIATING PRODUCTHUB EC2 DEPLOYMENT PIPELINE"
echo "===================================================="

APP_DIR="/home/ubuntu/ProductHub"

# 1. Check Directory
if [ -d "$APP_DIR" ]; then
    echo "📁 Navigating to application directory: $APP_DIR"
    cd "$APP_DIR"
else
    echo "❌ Directory $APP_DIR not found. Please ensure the repository is cloned at $APP_DIR."
    exit 1
fi

# 2. Check Environment Configuration File
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file is missing!"
    echo "👉 Please copy .env.example to .env and configure your MongoDB Atlas cluster URI:"
    echo "   cp .env.example .env && nano .env"
    exit 1
fi

echo "✅ Environment file .env detected."

# 3. Pull Latest Code from Git
echo "🔄 Pulling latest release from Git..."
git fetch --all
git pull origin master || git pull origin main || true

# 4. Install Production Dependencies
echo "📦 Installing production npm dependencies..."
npm install --omit=dev

# 5. Create Log Directories if Not Exists
mkdir -p logs

# 6. Seed Sample Documents if Needed
echo "🌱 Running database seed check..."
npm run seed || echo "⚠️ Notice: Seeding completed or skipped."

# 7. Start or Reload Application with PM2
echo "⚡ Updating PM2 process..."
if pm2 list | grep -q "producthub"; then
    echo "🔄 Reloading existing PM2 instance with zero-downtime..."
    pm2 reload ecosystem.config.js --env production
else
    echo "🚀 Starting new PM2 instance..."
    pm2 start ecosystem.config.js --env production
fi

# 8. Save PM2 Process List
pm2 save

# 9. Verify Local Health Check
echo "🩺 Verifying local application health on http://127.0.0.1:5000/api/health..."
sleep 2

HEALTH_CHECK=$(curl -s http://127.0.0.1:5000/api/health || echo "FAILED")

if echo "$HEALTH_CHECK" | grep -q '"status":"Healthy"'; then
    echo "===================================================="
    echo "🎉 DEPLOYMENT SUCCESSFUL! PRODUCTHUB IS RUNNING."
    echo "   Status: Healthy"
    echo "   Port: 5000"
    echo "   Process: PM2 (producthub)"
    echo "===================================================="
else
    echo "⚠️ Warning: Health check did not return 'Healthy'. Output:"
    echo "$HEALTH_CHECK"
    echo "👉 Please check PM2 logs with: pm2 logs producthub"
    exit 1
fi

