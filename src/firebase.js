// src/firebase.js

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- Import the Auth service
import { getFirestore } from "firebase/firestore"; // <-- Import the Firestore service
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxUdvC4sBFXIrpOrl5MAFwbD2526iYCys",
  authDomain: "ecometer-hack.firebaseapp.com",
  projectId: "ecometer-hack",
  storageBucket: "ecometer-hack.firebasestorage.app",
  messagingSenderId: "1088605319381",
  appId: "1:1088605319381:web:70446231c12fdb05fdb25c",
  measurementId: "G-4V6V8G5Y5H"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app); // Still needed to initialize, but will cause a warning if not used after initialization

export { auth, db, app, analytics };