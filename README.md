# Open Door Relief - Connecting Communities During Disasters

**Connecting Those in Need with Community Members Willing to Help**

![Open Door Relief Logo](src/assets/logo.png)

---

## 🚨 The Problem

During natural disasters like wildfires, floods, and hurricanes, official shelters often reach capacity quickly, and hotels in safe areas become fully booked. Many displaced individuals and families are left without options, while at the same time, many community members want to help but don't know how to connect with those in need.

**Open Door Relief** solves this critical gap by creating a secure platform that bridges these communities.

## ✅ The Solution

Open Door Relief is a secure web platform that connects:
- **People displaced by disasters** who need temporary shelter
- **Community members** willing to share their spaces (spare rooms, guest houses, etc.)

The platform prioritizes safety through multi-level verification, provides location-based matching, and integrates with official relief resources to create a comprehensive disaster response solution.

### Why It Matters

In disasters, the difference between despair and hope is often just an open door. By empowering communities to support each other when traditional systems are overwhelmed, we create immediate alternatives and foster community resilience.

---

## 🎯 Key Features

### Core Functionality

- **Request Help**: Those displaced by disasters can submit requests for space, including specific needs like pet-friendly accommodations
- **Offer Help**: Community members can pledge spaces and indicate their preferences for hosting
- **Smart Matching**: Location-based search and filtering for efficient connections
- **User Profiles**: Centralized management of requests, pledges, and contact information

### Trust & Safety Features

- **Multi-Level Verification**: Email, phone, and optional enhanced verification with ID and background checks
- **Verified Contact Methods**: Users control which verified contact methods to share
- **Content Moderation**: Automatic filtering of inappropriate content while allowing legitimate addresses
- **Verified Badges**: Clear visual indicators of verification status
- **Admin Oversight**: Platform management tools for maintaining quality and safety

### Advanced Capabilities

- **Map-Based Search**: Visual interface for finding nearby help or requests
- **Real-Time Updates**: Instant synchronization of requests and pledges across all users
- **Relief Center Directory**: Information about official support facilities and resources
- **Offline Support**: Limited functionality during internet outages for disaster scenarios
- **Admin Dashboard**: Comprehensive tools for platform management and user verification

---

## 🏗️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React.js with React Router |
| **Backend** | Firebase Firestore (NoSQL) |
| **Authentication** | Firebase Authentication (Email/Password + Phone) |
| **Hosting** | Firebase Hosting |
| **Maps** | Google Maps API |
| **Verification** | Firebase Phone Authentication |
| **PWA Support** | Service Workers for offline capability |

---

## 🔒 Security & Privacy

The platform implements comprehensive security measures:

- **Firestore Security Rules** with field-level validation
- **Role-based Access Control** for administrative functions
- **Encryption** for sensitive data in transit and at rest
- **Privacy-First Design** where users control their contact information sharing
- **Content Moderation** to prevent malicious inputs

See `firestore.rules` for complete security rule implementation.

---

## 📊 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│ Firebase Auth   │────▶│ Firebase        │
│  (PWA Ready)    │     │                 │     │ Firestore       │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│                 │                           │                 │
│  Google Maps    │                           │ Firebase        │
│  API            │                           │ Storage         │
│                 │                           │                 │
└─────────────────┘                           └─────────────────┘
```

---

## 🚀 Deployment & Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Firebase account with a Firestore database
- Google Maps API key (for map features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/open-door-relief.git
   cd open-door-relief
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Firebase configuration:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Set up Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password and Phone)
   - Create a Firestore database with security rules from `firestore.rules`
   - Enable Firebase Hosting

5. **Start development server**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy
   ```

3. **Deploy Cloud Functions** (if needed)
   ```bash
   firebase deploy --only functions
   ```

4. **Update Firestore Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 📚 Database Schema

### Users Collection
```javascript
users/{userId}
  - email: string
  - displayName: string
  - emailVerified: boolean
  - contactMethods: {
      email: { value, verified, share },
      phone: { value, verified, share }
    }
  - verification: {
      status: string,
      idVerified: boolean,
      backgroundChecked: boolean
    }
  - createdAt: timestamp
```

### Requests Collection
```javascript
requests/{requestId}
  - userId: string
  - location: string
  - emergency: string (wildfire, flood, hurricane, etc.)
  - partySize: number
  - nightsNeeded: number
  - typeOfSpace: string
  - petFriendly: boolean
  - status: string (open, matched, completed)
  - timestamp: timestamp
```

### Pledges Collection
```javascript
pledges/{pledgeId}
  - userId: string
  - location: string
  - spaceType: string
  - maxPartySize: number
  - nightsOffered: number
  - petFriendly: boolean
  - status: string (open, matched, completed)
  - timestamp: timestamp
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Folder Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Form/           # Form components
│   ├── Contact/        # Contact method components
│   ├── Reputation/     # User reputation system
│   ├── OfflineSync/    # Offline functionality
│   └── Filter/         # Filtering components
├── pages/              # Page components
├── utils/              # Utility functions
├── styles/             # Global styles and design system
└── App.jsx             # Main app component

functions/             # Firebase Cloud Functions
public/               # Static assets
```

---

## 🔄 Development Process & Challenges

### Challenges Solved

| Challenge | Solution |
|-----------|----------|
| Building trust between strangers | Multi-level verification with visual indicators |
| Ensuring user safety | Content moderation + selective contact sharing |
| Handling sensitive location data | Strict Firestore security rules + privacy controls |
| Emergency usability | Offline support and simplified interfaces |
| Real-time matching | Firestore's real-time synchronization |

### Key Technical Achievements

- **Real-time data synchronization** during emergencies
- **Secure authentication** with phone verification
- **Content moderation** that allows legitimate addresses
- **Privacy-first design** with granular user controls
- **Progressive Web App** support for better accessibility

---

## 🌱 Roadmap & Future Development

### Short-Term Goals (3-6 months)

- [ ] Community ratings and feedback system
- [ ] Enhanced offline functionality
- [ ] Partnerships with local emergency management agencies
- [ ] Resource sharing beyond housing (supplies, transportation)
- [ ] Mobile-optimized responsive design refinement

### Long-Term Vision (1-3 years)

- [ ] Native iOS and Android applications
- [ ] Integration with FEMA and official response systems
- [ ] Expansion to all major disaster-prone regions in the US
- [ ] API for emergency services integration
- [ ] Multi-language support

### Organizational Goals

- Establish as a 501(c)(3) non-profit organization
- Secure funding and partnerships with disaster relief organizations
- Build a dedicated team of coordinators and moderators
- Create educational resources on disaster preparedness

---

## 💡 Design Philosophy

**User-Centric**: Every design decision prioritizes the real needs of users in crisis situations

**Trustworthy**: Multi-layer verification and transparency build confidence between strangers

**Resilient**: Offline support and simplified interfaces ensure functionality during outages

**Community-Focused**: The platform amplifies human kindness and community connections

**Privacy-Respecting**: Users maintain control over their personal information

---

## 🤝 Contributing

We welcome contributions from developers, designers, and disaster response professionals. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure all code follows ESLint standards and includes appropriate comments.

---

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

- **Email**: support@opendoorrelief.org
- **Website**: [opendoorrelief.org](https://opendoorrelief.org)
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for general questions

---

## 🙏 Acknowledgments

This project was inspired by the devastating impact of natural disasters and the incredible resilience and generosity of communities that come together to help. We're grateful to all the disaster response professionals, volunteers, and community members who provided guidance during development.

---

**Open Door Relief** - *Because in a disaster, everyone needs an open door, and everyone can be that door.*
