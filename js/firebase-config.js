// js/firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyDBUW3lgkFWvDygfgBD4kSBRh4wx9d4h0Q",
  authDomain: "hiam-khder.firebaseapp.com",
  projectId: "hiam-khder",
  storageBucket: "hiam-khder.firebasestorage.app",
  messagingSenderId: "731921655421",
  appId: "1:731921655421:web:e3e867d33c8df4ed48f314",
  measurementId: "G-7Y5WLJWL6H"
};

let db = null;

try {
  if (window.firebase) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("✅ Firebase Firestore Connected");
  }
} catch (e) {
  console.warn("⚠️ Firebase offline, running in local-first mode", e);
}

export { db };
