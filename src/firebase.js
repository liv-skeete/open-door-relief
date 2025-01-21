// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase app configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvv-_nzeq31fdzAnqpmE19tHICsS-ipgw",
  authDomain: "disaster-relief-app-c67e7.firebaseapp.com",
  projectId: "disaster-relief-app-c67e7",
  storageBucket: "disaster-relief-app-c67e7.appspot.com",
  messagingSenderId: "730696261392",
  appId: "1:730696261392:web:2cf324cb96b1d83e360f95",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };