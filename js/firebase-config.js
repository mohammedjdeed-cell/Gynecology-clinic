// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBUW3lgkFWvDygfgBD4kSBRh4wx9d4h0Q",
  authDomain: "hiam-khder.firebaseapp.com",
  projectId: "hiam-khder",
  storageBucket: "hiam-khder.firebasestorage.app",
  messagingSenderId: "731921655421",
  appId: "1:731921655421:web:e3e867d33c8df4ed48f314",
  measurementId: "G-7Y5WLJWL6H"
};

// Initialize App & Firestore safely
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
