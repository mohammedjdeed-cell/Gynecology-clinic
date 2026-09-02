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

let dbInstance = null;

try {
  const app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization skipped/failed. Running offline mode:", error);
}

export const db = dbInstance;
