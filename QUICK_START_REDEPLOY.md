# Quick Start: Clean Redeployment Guide

## Problem
Your Firebase site (https://disaster-relief-app-c67e7.web.app) is still showing the old test version.

## Solution: Complete Clean Deployment

### Step 1: Verify Code Changes

All test account code has been removed from:
- ✅ `src/components/Auth/LoginForm.jsx`
- ✅ `src/components/Auth/SignupForm.jsx`
- ✅ `firestore.rules`
- ✅ `src/App.jsx`
- ✅ `src/firebase.js` (with better error handling)

### Step 2: Build Clean Production Version

```bash
# Navigate to project directory
cd /Users/olivia/Documents/coding/disaster-relief-app

# Clear node modules cache (optional but recommended)
rm -rf dist node_modules package-lock.json

# Reinstall dependencies
npm install

# Run linter to check for any issues
npm run lint

# Build for production
npm run build

# Verify build succeeded and check output
ls -lah dist/
```

### Step 3: Verify No Test Code in Build

```bash
# Search for any remaining test account references
grep -r "test@reliefapp" dist/

# Should return NOTHING if clean
# If anything found, fix and rebuild
```

### Step 4: Test Production Build Locally

```bash
npm run preview
```

Visit `http://localhost:4173` in your browser and test:
- [ ] Can access login page
- [ ] Can sign up (requires real email for verification)
- [ ] Cannot login without email verification
- [ ] Browser console has no errors
- [ ] Check DevTools > Application > Cache to see no old files

### Step 5: Deploy to Firebase

```bash
# Deploy only hosting (fastest if rules haven't changed)
npm run deploy:hosting

# Or deploy everything (if you made other changes)
npm run deploy

# Watch for "Deploy complete!" message
```

### Step 6: Clear Browser Cache

After deployment completes, clear your browser cache:

**Chrome/Edge**:
- Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Select "All time"
- Clear browsing data

**Firefox**:
- Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Click "Clear"

**Safari**:
- Develop menu > Empty Web Sites Cache
- Or History > Clear History

### Step 7: Hard Refresh Production URL

Visit: https://disaster-relief-app-c67e7.web.app/auth?redirect=/in-need

**Hard refresh** to force reload:
- Windows/Linux: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

### Step 8: Verify Production Deployment

1. **New user signup flow**:
   - Create account with test email (e.g., test.user@gmail.com)
   - Verify you're redirected to verification pending page
   - Check inbox for verification email
   - Click verification link
   - Now you can log in

2. **Test login**:
   - Enter unverified account email
   - Should get error requiring email verification
   - Cannot bypass verification

3. **Check browser console**:
   - Press F12 to open DevTools
   - Go to Console tab
   - Look for any errors
   - You should see Firebase config validation messages

---

## Troubleshooting Redeployment

### Deployment Shows Old Version

**Problem**: Still seeing old test account access

**Solutions** (in order):

1. **Verify deployment completed**:
   ```bash
   firebase hosting:channel:list
   firebase deploy --only hosting --verbose
   ```

2. **Clear Firebase CDN cache**:
   ```bash
   # Option A: Delete and redeploy
   firebase hosting:delete --site disaster-relief-app-c67e7
   npm run deploy:hosting
   
   # Option B: Just redeploy
   npm run deploy:hosting
   ```

3. **Force browser to reload build files**:
   - Clear ALL cache (not just the last hour)
   - Use incognito/private window to test
   - Try different browser

4. **Check deployment status**:
   ```bash
   firebase deploy --only hosting --verbose
   # Look for "Deploy complete!" confirmation
   ```

### Build Fails with Errors

**Problem**: `npm run build` has errors

**Solution**:
```bash
# Fix any lint errors
npm run lint --fix

# Clear cache and try again
rm -rf dist
npm run build

# If still fails, check for specific errors:
npm run lint
```

### Firebase Configuration Error

**Problem**: "Firebase App not initialized" or authentication fails

**Solution**:
```bash
# Check .env.local exists
ls -la .env.local

# Ensure all values are set
cat .env.local

# If missing variables, copy from example
cp .env.example .env.local

# Edit with your Firebase credentials
nano .env.local

# Restart dev server
npm run dev
```

---

## Verification Checklist

After redeployment, verify:

- [ ] Production URL loads without errors: https://disaster-relief-app-c67e7.web.app
- [ ] Auth page works: https://disaster-relief-app-c67e7.web.app/auth
- [ ] Cannot login without email verification
- [ ] Signup redirects to verification pending page
- [ ] Verification email is received
- [ ] Can login after email verification
- [ ] Browser console shows no errors
- [ ] Network requests show successful Firebase calls

---

## Complete Clean Deployment Script

Run all steps at once:

```bash
#!/bin/bash
cd /Users/olivia/Documents/coding/disaster-relief-app

echo "🧹 Cleaning build..."
rm -rf dist node_modules package-lock.json

echo "📦 Installing dependencies..."
npm install

echo "🔍 Linting code..."
npm run lint

echo "🏗️  Building for production..."
npm run build

echo "✅ Verifying no test code..."
if grep -r "test@reliefapp" dist/ > /dev/null 2>&1; then
  echo "❌ ERROR: Test account code found in build!"
  exit 1
fi

echo "🚀 Deploying to Firebase..."
npm run deploy:hosting

echo "✨ Deployment complete!"
echo "🔄 Now:"
echo "   1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Visit: https://disaster-relief-app-c67e7.web.app/auth"
echo "   3. Test the full signup/verification flow"
```

Save this as `deploy.sh` and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Need Help?

Check these docs:
- **General Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Troubleshooting**: See [FIREBASE_TROUBLESHOOTING.md](FIREBASE_TROUBLESHOOTING.md)
- **Security**: See [SECURITY.md](SECURITY.md)

Contact: support@opendoorrelief.org

---

**Last Updated**: November 8, 2025

Your app is now production-ready with all test code removed! 🎉
