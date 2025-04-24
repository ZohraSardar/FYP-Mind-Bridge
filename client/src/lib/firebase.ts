import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyASUu1GSYxUWa5wnb2lymVaiThYWPgHeXw",
  authDomain: "mind-bridge-e77fa.firebaseapp.com",
  projectId: "mind-bridge-e77fa",
  storageBucket: "mind-bridge-e77fa.firebasestorage.app",
  messagingSenderId: "971551126204",
  appId: "1:971551126204:web:7a1e65e4fdbfd5a635d6b9",
  measurementId: "G-13WWS4DNX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services
export { auth, db }