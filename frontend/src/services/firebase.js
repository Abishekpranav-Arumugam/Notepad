// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLQl6xlXa4UxG2Fjnz3Yg6KzrTcLqHnrM", // Consider Env Vars for security
  authDomain: "myapp-e88d6.firebaseapp.com",
  projectId: "myapp-e88d6",
  storageBucket: "myapp-e88d6.appspot.com", // Ensure this is correct
  messagingSenderId: "106220294737",
  appId: "1:106220294737:web:698b3e811b32c005b71e70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app); // <-- Initialize and export Firestore DB instance

// Create a Google Auth Provider instance
const googleProvider = new GoogleAuthProvider();

// Export the necessary Firebase services and providers
export { auth, db, googleProvider, signInWithPopup }; // <-- Export db