# Firebase Authentication & Configuration Troubleshooting Guide

## Common Firebase Authentication Errors - Solutions

### ❌ Error: "Firebase App not initialized"

**Cause**: Firebase configuration is missing or incomplete

**Solution**:
1. Check that `.env.local` exists and has all required variables
2. Copy from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in your actual Firebase credentials from [Firebase Console](https://console.firebase.google.com):
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Copy the config values

4. Restart dev server:
   ```bash
   npm run dev
   ```

5. Check browser console for config validation messages

---

### ❌ Error: "auth/invalid-api-key" or "auth/invalid-credential"

**Cause**: Firebase API key is invalid, disabled, or wrong

**Solution**:

1. **Verify API Key in Firebase Console**:
   - Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
   - Find your API Key
   - Check if it's restricted to your domain/app
   - If restricted, add your current domain

2. **Regenerate API Key** (if needed):
   - Click on the API key
   - Click "Edit" 
   - Under "API restrictions", select your Firebase project
   - Save

3. **Update .env.local** with correct key

4. **Clear browser cache**:
   - Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
   - Clear all cache
   - Refresh page

---

### ❌ Error: "auth/user-not-found" during login

**Cause**: Email account doesn't exist

**Solution**:
- User needs to sign up first at `/auth`
- Ensure they're using the correct email address
- Check if they might have used a different email

---

### ❌ Error: "auth/wrong-password"

**Cause**: Incorrect password

**Solution**:
- Verify password is correct (case-sensitive)
- Use password reset feature if forgotten
- Ensure caps lock is off

---

### ❌ Error: "auth/email-already-in-use"

**Cause**: Email is already registered

**Solution**:
- Use a different email address for signup, OR
- Log in with existing account if they already have one, OR
- Use password reset if they forgot credentials

---

### ❌ Error: "auth/too-many-requests"

**Cause**: Too many failed login/signup attempts

**Solution**:
- Wait 15-30 minutes before trying again
- Use password reset feature instead
- Try from a different device/network (if possible)

---

### ❌ Error: "auth/weak-password"

**Cause**: Password doesn't meet security requirements

**Solution**:
Use a stronger password with:
- At least 6 characters (recommended: 12+)
- Mix of uppercase and lowercase letters
- Numbers
- Special characters (!@#$%^&*)

Example: `Disaster@Relief2025!`

---

### ❌ Error: "Permission denied" or "PERMISSION_DENIED"

**Cause**: Firestore security rules are blocking the operation

**Solution**:

1. **Ensure email is verified**:
   - Check inbox for verification email
   - Click verification link
   - Wait a few seconds for verification to sync
   - Try login again

2. **Check Firestore Rules** in Firebase Console:
   - Go to Firestore > Rules
   - Verify rules match `firestore.rules` in the project
   - Deploy latest rules:
     ```bash
     firebase deploy --only firestore:rules
     ```

3. **For admin operations**:
   - Must use email ending in @opendoorrelief.org
   - Account must be verified

---

## Deployment Issues

### Issue: Site shows old test version after deploy

**Cause**: Browser cache or Firebase deployment incomplete

**Solution**:

1. **Clear Firebase Hosting cache**:
   ```bash
   firebase hosting:delete --site your-firebase-site
   npm run build
   firebase deploy --only hosting
   ```

2. **Hard refresh browser**:
   - Windows/Linux: `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`

3. **Clear browser cache**:
   - Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
   - Select "All time"
   - Clear

4. **Check deployment status**:
   ```bash
   firebase hosting:channel:list
   ```

5. **Verify production build doesn't have test account**:
   ```bash
   npm run build
   grep -r "test@reliefapp" dist/
   # Should return nothing if clean
   ```

---

### Issue: Environment variables not loading in production

**Cause**: Variables defined in `.env.local` don't exist in production

**Solution**:

1. **Firebase Hosting doesn't support .env.local files**
2. **Instead, use Firebase Environment Configuration**:

   a. Set environment variables in Firebase project:
   ```bash
   firebase functions:config:set firebase.apikey="YOUR_KEY"
   firebase functions:config:set firebase.authdomain="YOUR_DOMAIN"
   # etc.
   ```

   b. Or use environment-specific configuration in `vite.config.js`

3. **For client-side config** (recommended approach):
   - Keep sensitive config in `.env.local` (development only)
   - Use `firebase init hosting` to configure environment-specific settings
   - Set variables in Firebase Console when deploying

---

## Development Environment Setup

### Verify Configuration

Run this in browser console to debug:

```javascript
// Check if Firebase is initialized
console.log('Auth:', typeof auth !== 'undefined' ? 'Ready' : 'Not initialized');
console.log('Firestore:', typeof db !== 'undefined' ? 'Ready' : 'Not initialized');

// Check current user
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const auth = getAuth();
onAuthStateChanged(auth, user => {
  console.log('Current User:', user ? user.email : 'Not logged in');
  console.log('Email Verified:', user?.emailVerified);
});
```

### Enable Debug Logging

Add to `firebase.js`:

```javascript
import { enableLogging } from 'firebase/auth';
enableLogging(true); // Shows detailed auth logs
```

---

## Firestore Database Rules Testing

### Test Your Security Rules Locally

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore > Rules
4. Click "Rules Playground" on the right
5. Create test scenarios:

```javascript
// Test 1: Unverified user cannot create request
match /requests/{requestId} {
  // Simulate unverified user
  allow create: if request.auth.token.email_verified == true;
}

// Test with: request.auth.token.email_verified = false
// Expected: Denial
```

---

## Email Verification Not Arriving

### Troubleshooting

1. **Check spam folder**
   - Gmail: Check "Promotions" and "Updates" tabs
   - Outlook: Check "Junk" folder

2. **Check email address**
   - Typo in email during signup?
   - Try signing up again with correct email

3. **Resend verification email**
   - In app: Click "Resend verification email" on login form
   - Wait 5 minutes between resend attempts

4. **Check Firebase Email Settings**
   - Firebase Console > Authentication > Templates
   - Verify email template is configured
   - Check sender email is whitelisted

5. **Disable email filters** (if using corporate email)
   - Ask IT to whitelist noreply@firebase.com

---

## Performance Issues

### Slow Authentication

1. **Check network latency**:
   - Open DevTools > Network tab
   - Look for slow `identitytoolkit.googleapis.com` requests
   - High latency = use closer Firebase region

2. **Optimize Firestore queries**:
   - Avoid reading large documents
   - Use pagination for lists
   - Create indexes for common queries

3. **Monitor costs**:
   - Firebase Console > Firestore > Insights
   - Look for expensive queries
   - Optimize or add caching

---

## Security Best Practices

### Protect API Keys

1. **Don't commit credentials**:
   ```bash
   # Add to .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **Restrict API Key usage**:
   - Firebase Console > APIs & Services > Credentials
   - Edit API key > Application restrictions
   - Set to "HTTP referrers"
   - Add production domain

3. **Rotate credentials periodically**:
   - Regenerate Firebase app config quarterly
   - Update `.env.local` with new values

4. **Monitor suspicious activity**:
   - Firebase Console > Firestore > Insights
   - Look for unusual read/write patterns

---

## Getting Help

### Debug Information to Collect

When reporting issues, include:

1. **Browser Console Output**:
   ```javascript
   // Copy this from DevTools Console:
   JSON.stringify({
     timestamp: new Date().toISOString(),
     url: window.location.href,
     userAgent: navigator.userAgent,
     error: 'error message from console'
   }, null, 2)
   ```

2. **Firebase Configuration Status**:
   - Is API key configured? ✓/✗
   - Is email verified? ✓/✗
   - Is user logged in? ✓/✗

3. **Network Tab**:
   - Screenshot of failed Firebase API call
   - HTTP status code
   - Error message in response

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **Email**: support@opendoorrelief.org
- **Security Issues**: security@opendoorrelief.org (don't use GitHub)

---

## Quick Deployment Checklist

Before deploying to production:

- [ ] No `test@reliefapp.org` references in code
- [ ] `.env.local` configured with production credentials
- [ ] `npm run build` completes without errors
- [ ] `npm run preview` shows clean app (no console errors)
- [ ] Firestore rules deployed: `firebase deploy --only firestore:rules`
- [ ] Test authentication flow (signup → email verify → login)
- [ ] Hard refresh to clear cache
- [ ] Final deployment: `firebase deploy`

---

**Last Updated**: November 8, 2025

For the latest documentation, visit: [README.md](README.md) | [SECURITY.md](SECURITY.md) | [DEPLOYMENT.md](DEPLOYMENT.md)
