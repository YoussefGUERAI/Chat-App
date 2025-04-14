// firebase/config.js
import firebase from 'firebase/app'           // core Firebase
import 'firebase/firestore'                  // Firestore
import 'firebase/auth'                       // line for Auth

const firebaseConfig = {
  apiKey: "AIzaSyAAKvvfaguX8l4LD0xjqIggxhQqLmpnvZ8",
  authDomain: "chat-app-16fdd.firebaseapp.com",
  projectId: "chat-app-16fdd",
  storageBucket: "chat-app-16fdd.firebasestorage.app",
  messagingSenderId: "161988951827",
  appId: "1:161988951827:web:ab51ddc8203bcdef8c64e6"
};

// Step 1: Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Step 2: Initialize services
const db = firebase.firestore();
const auth = firebase.auth();          // ✅ Auth service

// Step 3: Export services
export { db, auth };