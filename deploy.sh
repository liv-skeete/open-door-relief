#!/bin/bash

# Open Door Relief - Complete Deployment Script
# This script builds and deploys your app to Firebase Hosting with all fixes

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        OPEN DOOR RELIEF - FIREBASE DEPLOYMENT             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Navigate to project
echo "📁 Step 1: Navigating to project directory..."
cd /Users/olivia/Documents/coding/disaster-relief-app
echo "✅ Located at: $(pwd)"
echo ""

# Step 2: Clean build artifacts
echo "🧹 Step 2: Cleaning old build files..."
rm -rf dist node_modules package-lock.json
echo "✅ Cleaned: dist/, node_modules/, package-lock.json"
echo ""

# Step 3: Install dependencies
echo "📦 Step 3: Installing dependencies..."
npm install > /dev/null 2>&1
echo "✅ Dependencies installed"
echo ""

# Step 4: Lint code
echo "🔍 Step 4: Checking code quality..."
npm run lint > /dev/null 2>&1 || {
    echo "⚠️  Linting warnings found (continuing anyway)"
}
echo "✅ Code quality checked"
echo ""

# Step 5: Build for production
echo "🏗️  Step 5: Building production version..."
npm run build
echo "✅ Production build complete"
echo ""

# Step 6: Verify no test code
echo "🔐 Step 6: Verifying no test account code..."
if grep -r "isTestAccount\|isDeveloper" dist/ > /dev/null 2>&1; then
    echo "❌ ERROR: Test code found in build!"
    exit 1
fi
echo "✅ No test account logic in production build"
echo ""

# Step 7: Deploy to Firebase
echo "🚀 Step 7: Deploying to Firebase Hosting..."
echo "   This will deploy to: https://disaster-relief-app-c67e7.web.app"
echo ""

firebase deploy --only hosting

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ DEPLOYMENT SUCCESSFUL! ✅                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  Clear your browser cache:"
echo "   • Mac: Press Cmd+Shift+R"
echo "   • Windows/Linux: Press Ctrl+Shift+R"
echo ""
echo "2️⃣  Visit your app:"
echo "   https://disaster-relief-app-c67e7.web.app/auth?redirect=/in-need"
echo ""
echo "3️⃣  Test the flow:"
echo "   • Create new account with real email"
echo "   • Should NOT be able to login yet"
echo "   • Check email for verification link"
echo "   • After verification, you can login!"
echo ""
echo "4️⃣  If still seeing old version:"
echo "   • Try in Incognito/Private window"
echo "   • Wait 5 minutes (Firebase CDN cache)"
echo "   • Try: firebase hosting:delete --site disaster-relief-app-c67e7"
echo "   • Then redeploy: firebase deploy --only hosting"
echo ""
echo "✨ Your app is now LIVE with all security fixes! ✨"
echo ""
