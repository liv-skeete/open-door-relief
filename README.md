# Open Door Relief

## Connecting Communities During Disasters

![Open Door Relief Logo](src/assets/logo.png)

## About the Project

Open Door Relief is a platform designed to connect those displaced by disasters with community members offering temporary shelter. In times of crisis, when official shelters reach capacity and hotels are full, our platform creates a community-based alternative by facilitating safe connections between those in need and those willing to help.

### Inspiration

This project was inspired by the devastating wildfires and the importance of community support during times of crisis. While many people want to contribute during disasters, they often don't know how to directly help those affected. Open Door Relief bridges this gap by creating opportunities for direct action and meaningful connections.

Beyond the immediate impact, this platform reflects the best of humanity — our capacity for kindness and generosity. By empowering communities to help each other during disasters, this app creates opportunities for direct action and meaningful connections.

### Environmental Impact

Wildfires and other natural disasters leave communities displaced and strain resources, but community-driven solutions can help mitigate their long-term effects. By facilitating the reuse of existing spaces and reducing the demand for temporary housing infrastructure, this app supports sustainability while helping people take direct action.

## Features

### Core Functionality

- **Request Help**: Those displaced by disasters can submit requests for space, including specific needs like pet-friendly accommodations.
- **Offer Help**: Community members can pledge spaces such as bedrooms, garages, or offices and indicate their preferences for hosting.
- **Filter and Connect**: The app simplifies finding and offering help through filters like location, space type, and emergency type.
- **User Profiles**: Centralized management of requests, pledges, and contact information.

### Enhanced Security

- **Verified Contact Methods**: Multi-level verification system for email, phone, and other contact methods.
- **Background Checks**: Optional enhanced verification with ID verification and background checks.
- **Content Moderation**: Automatic filtering of inappropriate content while allowing legitimate addresses.
- **Privacy Controls**: Users choose which verified contact methods to share.

### Advanced Features

- **Map-Based Search**: Visual interface for finding nearby help or requests.
- **Relief Center Directory**: Information about official support facilities and resources.
- **Donation System**: Support the platform's mission through one-time or recurring donations.
- **Admin Dashboard**: Platform management tools for administrators.

## Technology Stack

- **Frontend**: React.js for the user interface
- **Backend**: Firebase Firestore for real-time database functionality
- **Authentication**: Firebase Authentication for secure user management
- **Hosting**: Firebase Hosting for seamless deployment
- **Maps Integration**: Google Maps API for location-based features
- **Verification**: Firebase Phone Authentication for SMS verification

## Development Journey

### Challenges Faced

- **Trust and Safety**: Creating a secure platform that protects both those seeking help and those offering it.
- **Verification System**: Implementing a multi-level verification system to build trust between users.
- **Real-Time Filtering**: Developing an efficient filtering system to ensure users could find the most relevant matches quickly.
- **Content Moderation**: Building a system that can filter inappropriate content while allowing legitimate addresses.

### Solutions Implemented

- **Multi-Level Verification**: Implemented email, phone, and enhanced verification options.
- **Contact Privacy**: Created a system where users can choose which verified contact methods to share.
- **Firestore Security Rules**: Implemented comprehensive security rules to protect user data.
- **Map-Based Interface**: Developed an intuitive map interface for finding nearby help or requests.

## Future Development

- **Expanded Verification**: Integration with third-party identity verification services.
- **Community Ratings**: Implement a rating system for users after successful connections.
- **Resource Coordination**: Coordinate with official emergency services and relief organizations.
- **Mobile Applications**: Native mobile apps for iOS and Android platforms.
- **Offline Functionality**: Support for limited functionality during internet outages.

## Congressional App Challenge Submission

This project is being submitted to the Congressional App Challenge as a demonstration of how technology can be used to address real-world problems and strengthen communities during times of crisis.

### Impact Statement

Open Door Relief addresses a critical gap in disaster response: when shelters reach capacity and hotels are full, where do people go? Our platform creates a secure community-based alternative by connecting those needing shelter with those willing to share their space. Using verified profiles, location-based matching, and integration with official relief resources, we've created a solution that complements existing systems while fostering community resilience. In disasters, the difference between despair and hope is often just an open door.

## Non-Profit Status

Open Door Relief is being established as a 501(c)(3) non-profit organization dedicated to:

1. Maintaining and improving the platform
2. Verifying users to ensure safety and trust
3. Providing support services during disasters
4. Expanding our reach to help more communities
5. Developing new features to better serve those in need

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Firebase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/open-door-relief.git
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up Firebase
   - Create a Firebase project
   - Enable Authentication (Email/Password and Phone)
   - Create a Firestore database
   - Add your Firebase configuration to `src/firebase.js`

4. Start the development server
   ```
   npm run dev
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact us at support@opendoorrelief.org.

---

*Open Door Relief - Connecting Communities During Disasters*
