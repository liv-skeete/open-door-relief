# Open Door Relief

**Open Door Relief** is a disaster relief housing platform designed to connect individuals affected by emergencies with community members offering temporary spaces. This app fosters community-driven support during natural disasters like wildfires, floods, and hurricanes.

---

## Features

- **Submit a Pledge**: Community members can pledge spaces (e.g., bedrooms, garages, offices) with details like location, space type, and availability.
- **Request Help**: Individuals in need can submit requests for housing, specifying requirements such as location, party size, and pet-friendliness.
- **Filter Options**: Users can filter pledges or requests based on:
  - Location
  - Type of emergency
  - Space type
  - Pet-friendly options
- **Real-Time Data**: All pledges and requests are updated dynamically via Firebase Firestore.

---

## Tech Stack

- **Frontend**: React.js
- **Backend**: Firebase Firestore (NoSQL database)
- **Hosting**: Firebase Hosting
- **Future Enhancements**:
  - User authentication and account management
  - Push notifications for matched pledges/requests
  - Map integration for geographic search functionality
  - Security features like identity verification

---

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- Firebase project setup (see [Firebase Documentation](https://firebase.google.com/docs)).

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/OliviaSkeete/Open-Door-Relief.git
   cd Open-Door-Relief
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Firebase**:
   - Create a `.env` file in the root of your project.
   - Add the following environment variables with your Firebase credentials:

```plaintext
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

4. **Run the Application**:
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.

---

## Firebase Configuration

The `firebase.js` file should use the environment variables from your `.env` file to initialize Firebase. Here’s an example:

```javascript
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export default app;
```

Ensure `.env` is added to `.gitignore` to keep your credentials secure.

---

## How to Contribute

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature name"
   ```
4. Push the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License

This project is currently private. Future open-source licensing will be added.

---

## Contact

If you have questions or suggestions, feel free to reach out:
- **Email**: olivia@skeete.com
- **GitHub Issues**: [Open an Issue](https://github.com/OliviaSkeete/Open-Door-Relief/issues)

---

## Acknowledgements

- [Firebase](https://firebase.google.com/)
- [React.js](https://reactjs.org/)
