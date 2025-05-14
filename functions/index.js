import functions from "firebase-functions"; // Import CommonJS module
import admin from "firebase-admin";

admin.initializeApp(); // Initialize the Firebase Admin SDK

// Example HTTP function
export const helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});

// Add other Cloud Functions as needed