import firebase from 'firebase/app' 

import 'firebase/firestore'
const firebaseConfig = {
    apiKey: "AIzaSyAAKvvfaguX8l4LD0xjqIggxhQqLmpnvZ8",
    authDomain: "chat-app-16fdd.firebaseapp.com",
    projectId: "chat-app-16fdd",
    storageBucket: "chat-app-16fdd.firebasestorage.app",
    messagingSenderId: "161988951827",
    appId: "1:161988951827:web:ab51ddc8203bcdef8c64e6"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

export{db, auth}