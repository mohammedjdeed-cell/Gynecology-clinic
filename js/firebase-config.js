// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your exact Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBUW3lgkFWvDygfgBD4kSBRh4wx9d4h0Q",
  authDomain: "hiam-khder.firebaseapp.com",
  projectId: "hiam-khder",
  storageBucket: "hiam-khder.firebasestorage.app",
  messagingSenderId: "731921655421",
  appId: "1:731921655421:web:e3e867d33c8df4ed48f314",
  measurementId: "G-7Y5WLJWL6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Offline Cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
