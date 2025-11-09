# Open Door Relief - Production Deployment Guide

This guide provides step-by-step instructions for deploying Open Door Relief to production on Firebase Hosting.

## Pre-Deployment Checklist

- [ ] All code has been tested locally
- [ ] Environment variables are configured in `.env.local`
- [ ] Firestore security rules have been reviewed and updated for production
- [ ] Firebase project is set up with Firestore and Authentication enabled
- [ ] Custom domain is registered (optional but recommended)
- [ ] SSL certificate is configured (automatic with Firebase Hosting)

## Prerequisites

1. **Firebase Account**: Create an account at [firebase.google.com](https://firebase.google.com)
2. **Firebase CLI**: Install globally via npm
   ```bash
   npm install -g firebase-tools
   ```
3. **Node.js**: v14.0.0 or higher
4. **Git**: For version control

## Step 1: Set Up Firebase Project

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project" or "Create a project"
3. Enter your project name (e.g., "open-door-relief-prod")
4. Accept the default settings and create the project
5. Wait for the project to finish initializing

### Enable Firebase Services

1. **Authentication**
   - Navigate to "Authentication" in the left sidebar
   - Click "Get Started"
   - Enable "Email/Password" sign-in method
   - Enable "Phone" sign-in method (for SMS verification)

2. **Firestore Database**
   - Navigate to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Start in "Production mode" (security rules will protect your data)
   - Select your preferred database location
   - Click "Create"

3. **Hosting**
   - Navigate to "Hosting" in the left sidebar
   - Click "Get Started"
   - Follow the initial setup (you'll run `firebase init` next)

## Step 2: Configure Your Local Environment

### Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/open-door-relief.git
cd open-door-relief

# Install dependencies
npm install
cd functions && npm install && cd ..
```

### Set Up Environment Variables

1. Create `.env.local` by copying the example:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase credentials:
   - Get credentials from Firebase Console > Project Settings > General tab
   - Scroll down to "Your apps" section
   - Click the web app config icon
   - Copy the values to `.env.local`

### Initialize Firebase Locally

```bash
# Log in to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# When prompted:
# - Choose: Firestore, Functions, Hosting
# - Select your Firebase project
# - Accept default settings for Firestore
# - Choose JavaScript for Functions
# - Use dist as your public directory for Hosting
# - Set up automatic builds/deploys (yes)
```

## Step 3: Review and Deploy Firestore Security Rules

### Review Current Rules

1. Open `firestore.rules` in your editor
2. Verify that development-only rules have been removed
3. Ensure `isVerified()` only checks `email_verified == true` (no test accounts)

### Deploy Rules

```bash
firebase deploy --only firestore:rules
```

**Important**: Always review security rules before deploying to production!

## Step 4: Build for Production

```bash
npm run build
```

This creates an optimized, minified build in the `dist/` directory:
- Removes console logs
- Minifies JavaScript and CSS
- Splits vendor code into separate chunks
- Generates production-ready assets

## Step 5: Test Production Build Locally

Before deploying to Firebase, test the production build locally:

```bash
npm run preview
```

This runs a local server with your production build. Visit `http://localhost:4173` and verify:
- [ ] Authentication works
- [ ] Email verification is required
- [ ] User can create requests/pledges after verification
- [ ] Map features work (if implemented)
- [ ] Forms submit correctly
- [ ] No console errors

## Step 6: Deploy to Firebase Hosting

### Deploy Everything

```bash
# Deploy Firestore rules, functions, and hosting
firebase deploy
```

### Deploy Specific Components

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only functions
firebase deploy --only functions
```

## Step 7: Verify Deployment

1. Navigate to your Firebase Hosting URL (shown in CLI output)
2. Verify the site loads correctly
3. Test core functionality:
   - Sign up with a new email account
   - Verify email address
   - Create a request or pledge
   - Filter and search
   - Test offline functionality (if applicable)

4. Check Firebase Console:
   - Navigate to Hosting in the left sidebar
   - Verify deployment shows "Success"
   - View visit analytics

## Step 8: Set Up Custom Domain (Optional)

1. In Firebase Console, go to Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Verify domain ownership following Firebase's instructions
5. Update DNS settings as guided by Firebase
6. SSL certificate will be provisioned automatically (can take 24 hours)

## Post-Deployment

### Monitor Your Application

1. **Error Tracking**
   - Firebase Console > Functions > Logs
   - Check for any runtime errors

2. **Performance Monitoring**
   - Firebase Console > Performance
   - Monitor load times and user engagement

3. **Database Usage**
   - Firebase Console > Firestore > Usage
   - Monitor read/write operations to optimize costs

### Regular Maintenance

- **Weekly**: Review Firestore security rules
- **Monthly**: Check error logs and performance metrics
- **Quarterly**: Review and update security practices
- **As needed**: Deploy bug fixes and new features

### Update Deployment Process

To redeploy after code changes:

```bash
# Build for production
npm run build

# Deploy
firebase deploy
```

## Troubleshooting

### Build Errors

```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install

# Clear build cache
rm -rf dist/
npm run build
```

### Deployment Fails

```bash
# Check your Firebase login
firebase login

# Use specific project
firebase deploy --project your-project-id
```

### Performance Issues

1. Check bundle size:
   ```bash
   npm run build
   ```
   Look for warnings about large chunks

2. Optimize images and assets
3. Review Firestore queries for efficiency
4. Consider implementing pagination

### High Costs

- Review Firestore read/write operations
- Implement request caching
- Use indexes for frequently queried fields
- Consider rate limiting for API calls

## Rollback

If you need to rollback to a previous version:

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to specific version
firebase hosting:releases:list
firebase deploy --only hosting --message "Rollback to previous version"
```

## Security Best Practices

1. **Keep Dependencies Updated**
   ```bash
   npm update
   npm audit fix
   ```

2. **Rotate Credentials Regularly**
   - Regenerate Firebase credentials quarterly
   - Update `.env.local` with new credentials

3. **Monitor Security Alerts**
   - Enable Firebase Security Alerts
   - Set up alerts for suspicious activity

4. **Review Firestore Rules**
   - Test rules thoroughly before deployment
   - Use the Firestore Rules Simulator in Console

5. **Enable Audit Logging**
   - Firebase automatically logs all actions
   - Review logs regularly for unusual activity

## Performance Optimization

### Content Delivery Network (CDN)

Firebase Hosting automatically serves content through Google's global CDN:
- Assets are cached at 1 year (immutable files)
- HTML is cached at 1 hour
- Further optimization can be configured in `firebase.json`

### Code Splitting

The `vite.config.js` is configured to split vendor code:
- React and React-DOM in separate chunk
- Firebase in separate chunk
- Application code in main chunk

This allows better browser caching when dependencies don't change.

## Support

For issues or questions:

- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **GitHub Issues**: Report bugs and request features
- **Email Support**: support@opendoorrelief.org

---

**Remember**: In a disaster, every second counts. Ensure your deployment is reliable, fast, and always available for those who need help.
