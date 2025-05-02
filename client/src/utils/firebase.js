// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSgJlKwoONkM3SompHSFSYkb-hNT8ECOY",
  authDomain: "freelancify-568fe.firebaseapp.com",
  projectId: "freelancify-568fe",
  storageBucket: "freelancify-568fe.firebasestorage.app",
  messagingSenderId: "6405282146",
  appId: "1:6405282146:web:8f175e5237894b4859343b",
  measurementId: "G-Q6X0HJG55D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;