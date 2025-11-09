# Contributing to Open Door Relief

Thank you for considering contributing to Open Door Relief! We welcome contributions from developers, designers, disaster relief professionals, and community members.

## Code of Conduct

All contributors must adhere to our Code of Conduct:

- Be respectful and inclusive
- Focus on what's best for the community
- Accept constructive criticism gracefully
- Report unacceptable behavior to maintainers

## Getting Started

### Prerequisites

- Node.js v14.0.0 or higher
- npm v6.0.0 or higher
- Git
- A Firebase account (for development)

### Local Development Setup

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR-USERNAME/open-door-relief.git
cd open-door-relief

# Add upstream remote
git remote add upstream https://github.com/opendoorrelief/open-door-relief.git

# Install dependencies
npm install
cd functions && npm install && cd ..

# Create environment file
cp .env.example .env.local

# Fill in Firebase credentials
# (Ask project maintainers for development Firebase credentials)
```

### Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your changes live.

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/add-map-search` for new features
- `fix/login-error` for bug fixes
- `docs/update-readme` for documentation
- `test/add-auth-tests` for tests

### 2. Make Your Changes

- Follow the project's code style
- Keep commits atomic and descriptive
- Write clear commit messages

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

Ensure:
- No linting errors
- Production build succeeds
- No console warnings/errors

### 4. Commit and Push

```bash
# Stage changes
git add .

# Commit with clear message
git commit -m "Add feature: brief description"

# Push to your fork
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template with:
   - Clear description of changes
   - Related issues (if any)
   - Screenshots for UI changes
   - Testing instructions

## Code Standards

### JavaScript/React

- Use ES6+ syntax
- Follow ESLint configuration (`eslint.config.js`)
- Use meaningful variable names
- Keep functions focused and testable
- Add comments for complex logic

```javascript
// Good
function calculateReliefCenterDistance(userLat, userLon, centerLat, centerLon) {
  // Haversine formula for accurate distance calculation
  const R = 6371; // Earth radius in km
  const dLat = (centerLat - userLat) * Math.PI / 180;
  const dLon = (centerLon - userLon) * Math.PI / 180;
  // ... calculation
  return distance;
}

// Avoid
function calc(a, b, c, d) {
  // calculation without comments
  return result;
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Prop validation with PropTypes or TypeScript

```javascript
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export function RequestCard({ request, onConnect }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="request-card">
      {/* Component JSX */}
    </div>
  );
}

RequestCard.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.string.required,
    location: PropTypes.string.required,
  }).isRequired,
  onConnect: PropTypes.func.required,
};
```

### CSS

- Use BEM naming convention for classes
- Keep styles organized and commented
- Use CSS variables for colors and spacing
- Mobile-first responsive design

```css
/* Good */
.request-card {
  padding: var(--spacing-md);
}

.request-card__title {
  font-size: var(--font-size-lg);
}

.request-card--featured {
  border: 2px solid var(--color-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .request-card {
    padding: var(--spacing-sm);
  }
}
```

### Firebase Rules

- Test thoroughly in Rules Simulator
- Comment complex rules
- Use helper functions for reusable logic
- Always check authentication and authorization

```javascript
// Good: Clear and well-commented
function isVerified() {
  // Users must have verified their email address
  return isSignedIn() && request.auth.token.email_verified == true;
}

function canModify(userId) {
  // Only the owner or admins can modify
  return isOwner(userId) || isAdmin();
}

match /requests/{requestId} {
  allow read: if true; // Public can view requests
  allow create: if isVerified(); // Only verified users
  allow update, delete: if canModify(resource.data.userId);
}
```

## Testing

### What to Test

- Critical user flows (sign up, create request, contact)
- Data validation
- Error handling
- Edge cases

### How to Test

```bash
# Linting
npm run lint

# Manual testing
npm run dev

# Production build
npm run build
npm run preview
```

### Bug Reporting

Include:
- Detailed description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment (OS, browser, etc.)

## Documentation

### README Updates

Update README.md if you:
- Add new features
- Change file structure
- Modify deployment process
- Update technology stack

### Code Comments

- Add comments for "why", not "what"
- Document public functions/components
- Explain complex algorithms
- Include examples for utilities

### Changelog

Significant changes should be logged in CHANGELOG.md:
- Breaking changes
- New features
- Bug fixes
- Deprecations

Format:
```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature description

### Fixed
- Bug fix description

### Changed
- Change description
```

## Pull Request Process

1. **Update from main**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests locally**
   ```bash
   npm run lint
   npm run build
   ```

3. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create pull request**
   - Fill in the template completely
   - Link related issues
   - Request review from maintainers

5. **Address feedback**
   - Make requested changes
   - Push to the same branch
   - Don't force push (let reviewer see updates)

6. **Rebase before merge**
   ```bash
   git fetch upstream
   git rebase upstream/main
   git push origin feature/your-feature-name
   ```

## Common Contributions

### Bug Fixes

1. Create an issue describing the bug
2. Create a branch from main
3. Fix the bug
4. Add a comment referencing the issue
5. Test thoroughly
6. Submit PR

### New Features

1. Discuss feature in an issue first
2. Get approval from maintainers
3. Create feature branch
4. Implement with tests
5. Update documentation
6. Submit PR

### Documentation

1. Create a branch
2. Make documentation changes
3. Verify formatting
4. Submit PR

### Testing & Performance

- Add tests for new functions
- Profile performance-critical code
- Suggest optimizations

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue with reproduction steps
- **Security Issues**: Email security@opendoorrelief.org
- **General Help**: Check existing documentation

## Development Tips

### Browser DevTools

- React DevTools extension (debug component state)
- Firebase DevTools extension (monitor database)
- Chrome/Firefox built-in network tab

### Debugging Firebase

```javascript
// Enable debug logging
import { connectAuthEmulator, connectFirestoreEmulator } from 'firebase/firestore';

// Development only
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` and restart dev server |
| Firebase auth errors | Check `.env.local` configuration |
| Linting errors | Run `npm run lint -- --fix` |
| Build fails | Clear `node_modules` and `dist`, reinstall |

## Contributor Recognition

We recognize and appreciate all contributions:

- Contributors listed in README.md
- Significant contributors become maintainers
- Annual recognition for top contributors

## Questions?

- Check documentation
- Search GitHub issues
- Ask in discussions
- Email maintainers

---

**Thank you for helping Open Door Relief connect communities during disasters!**

Remember: Every contribution, no matter how small, helps us save lives and support communities.
