# Security Policy for Open Door Relief

## Purpose

This document outlines the security measures, best practices, and policies for Open Door Relief to ensure the safety and privacy of all users during disasters.

## Security Principles

1. **User Protection**: Users' safety and privacy are our top priority
2. **Data Protection**: All personal data is encrypted and protected
3. **Trust & Transparency**: We're transparent about how data is used
4. **Continuous Improvement**: Security is regularly reviewed and enhanced
5. **Compliance**: We follow industry standards and best practices

## Authentication & Verification

### Email Verification

- All users must verify their email address before accessing the platform
- Verification is required to create requests, pledges, or contact other users
- Users receive an email with a verification link
- Links expire after 24 hours for security

### Phone Verification

- Enhanced verification uses Firebase Phone Authentication
- Optional but recommended for increased trust
- SMS verification codes are one-time use and expire after 10 minutes

### Background Checks (Optional)

- Users may optionally complete background verification
- Third-party verification services handle all background check data
- Results are securely stored with appropriate access controls

## Data Security

### Encryption

- All data in transit is encrypted using TLS 1.2 or higher
- Sensitive data at rest is encrypted using Google Cloud encryption
- Firebase automatically handles encryption key management

### Access Control

- Users can only access their own profile and publicly posted requests/pledges
- Admin users can manage verification status and remove inappropriate content
- Database rules enforce access control at the Firestore level

### Data Privacy

- User contact information is only shared with explicit user consent
- Users control which contact methods (email, phone) are visible to others
- Email addresses are never publicly displayed without user consent

## Firebase Security Rules

Our Firestore security rules implement:

```javascript
// Only verified users can create requests and pledges
function isVerified() {
  return isSignedIn() && request.auth.token.email_verified == true;
}

// Users can only modify their own data
function isOwner(userId) {
  return isSignedIn() && request.auth.uid == userId;
}

// Admins can manage content and verify users
function isAdmin() {
  return isSignedIn() && request.auth.token.email.matches('.*@opendoorrelief\\.org$');
}
```

See `firestore.rules` for complete rule implementation.

## Content Moderation

### Automated Filtering

- Inappropriate language is automatically filtered
- Addresses and contact information are preserved for legitimate use
- Flagged content is marked for admin review

### Manual Review

- Admins review flagged content within 24 hours
- Content is removed if it violates platform policies
- Users are notified if their content is removed

### Reporting Mechanism

- Users can report inappropriate behavior or dangerous content
- Reports are reviewed by administrators
- Serious violations may result in account suspension

## User Accountability

### Verified Badges

- Verified users display a badge on their profile
- Verification levels indicate enhanced identity verification
- This builds trust between community members

### Reputation System

- User ratings and reviews (future feature)
- Community feedback helps identify trustworthy users
- Dangerous behavior results in account suspension or termination

### Account Termination

- Accounts can be terminated for:
  - Threatening or harassing other users
  - Providing false information for verification
  - Attempting to defraud other users
  - Violating platform terms of service

## Incident Response

### Security Incident Procedures

1. **Detection**: Automated alerts monitor for suspicious activity
2. **Containment**: Affected systems are isolated immediately
3. **Investigation**: Security team investigates the incident
4. **Notification**: Users are notified if their data is compromised
5. **Remediation**: Fixes are applied and tested
6. **Prevention**: Measures are implemented to prevent recurrence

### Breach Notification

In case of a security breach:

- Users will be notified within 24 hours
- We will provide information about:
  - What data was compromised
  - What we're doing to fix it
  - What users can do to protect themselves
  - Contact information for support

## Developer Security

### Code Review

- All code changes are reviewed for security issues
- Security-critical code receives additional scrutiny
- Automated security scanning is performed on all commits

### Dependencies

- Dependencies are regularly updated
- Security vulnerabilities are patched immediately
- `npm audit` is run before every deployment

### Secrets Management

- API keys and credentials are never committed to Git
- Environment variables are used for sensitive data
- Firebase Admin SDK is used for server-side operations
- Credentials are rotated quarterly

## Third-Party Services

### Firebase

- Google Cloud Platform manages all infrastructure security
- Compliant with HIPAA, SOC 2, ISO 27001, and other standards
- Regular security audits by Google and third parties

### Google Maps API

- Map data is used for location-based matching
- No raw location data is stored; only user-provided text locations
- Google Maps API keys are restricted to this application

### Email & SMS Services

- Firebase handles email verification and SMS delivery
- All communications are encrypted end-to-end
- Service providers are vetted for security compliance

## Compliance & Regulations

### Data Protection

- GDPR: User data can be exported or deleted on request
- CCPA: California residents have data privacy rights
- HIPAA: Not applicable (we don't handle health information)

### Accessibility

- WCAG 2.1 Level AA compliance (ongoing effort)
- All public content is accessible to users with disabilities
- Screen reader support for critical functions

## User Best Practices

### Strong Passwords

- Use unique, strong passwords (12+ characters)
- Include uppercase, lowercase, numbers, and symbols
- Don't share your password with anyone

### Email Security

- Keep your registered email address secure
- Use two-factor authentication on your email provider
- Don't click links in suspicious emails

### Verification

- Verify user profiles before accepting offers
- Trust verified badges but use common sense
- Report suspicious behavior immediately

### Communication

- Don't share personal details until you've verified the other user
- Meet in public places during initial conversations
- Tell someone where you're going

## Reporting Security Issues

### Responsible Disclosure

If you discover a security vulnerability:

1. **Don't** post it publicly
2. **Do** email security@opendoorrelief.org with:
   - Description of the vulnerability
   - Steps to reproduce it
   - Potential impact
   - Your contact information

3. We will:
   - Acknowledge receipt within 48 hours
   - Investigate and fix the issue
   - Credit you in the fix (if desired)
   - Keep you updated on progress

### Disclosure Timeline

- 7 days: Initial response
- 30 days: Good faith attempt to fix
- 90 days: Public disclosure (if not fixed)

## Regular Security Audits

- Quarterly internal security reviews
- Annual third-party security assessment
- Continuous monitoring for suspicious activity
- Regular penetration testing

## Documentation

- Security documentation is kept up-to-date
- All security decisions are documented
- Process changes are recorded with justification

## Policy Updates

This security policy is reviewed:

- Quarterly for policy effectiveness
- Immediately when new threats emerge
- Annually for comprehensive updates

Changes are communicated to all users and stakeholders.

## Emergency Support

For security emergencies:

- **Email**: security@opendoorrelief.org (monitored 24/7)
- **During Disaster**: Emergency lines are prioritized
- **Escalation**: Senior security team is paged for critical issues

## Acknowledgments

We're grateful to:
- Firebase/Google Cloud for infrastructure security
- The security research community for responsible disclosures
- Our users for helping us maintain a safe platform

---

**Last Updated**: November 8, 2025

**Next Review**: February 8, 2026

If you have questions about our security practices, please contact:
security@opendoorrelief.org
