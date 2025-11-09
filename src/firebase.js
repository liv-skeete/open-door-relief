import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all required configuration values are present
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  console.error(
    `❌ Firebase Configuration Error: Missing required environment variables: ${missingConfig.join(', ')}`,
    '\n📋 Please ensure .env.local contains all required VITE_FIREBASE_* variables',
    '\n🔗 See .env.example for the required variables'
  );
}

// Development-only configuration logging removed for production

let app, db, auth;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Enable emulator in development (optional, for local testing)
  // Uncomment and configure these if using Firebase emulators locally
  // if (import.meta.env.DEV && window.location.hostname === 'localhost') {
  //   try {
  //     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  //     connectFirestoreEmulator(db, 'localhost', 8080);
  //     console.log('🔄 Connected to Firebase emulators (development mode)');
  //   } catch (err) {
  //     // Emulator already initialized
  //   }
  // }
  
  // Firebase initialized successfully
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

export { db, auth };