import firebase from "firebase/app"; // the core part of firebase package
// Then we import any features from firebase that we want to use // in our case it is cloud firestore
import "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyAAKvvfaguX8l4LD0xjqIggxhQqLmpnvZ8",
    authDomain: "chat-app-16fdd.firebaseapp.com",
    projectId: "chat-app-16fdd",
    storageBucket: "chat-app-16fdd.firebasestorage.app",
    messagingSenderId: "161988951827",
    appId: "1:161988951827:web:ab51ddc8203bcdef8c64e6",
};
// Step 1 : init firebase
// we use the firebaseConfig to init the connection to our firebase backend firebase.initializeApp(firebaseConfig)
// Step 2 : Init the firestore service
// If we want to do any communication with the firestore db (eg. add documents)
// we can use projectFirestore variable
const projectFirestore = firebase.firestore();
//Step 3 : Export projectFirestore
// This will enable the use the firebase in different components export {projectFirestore}
export { projectFirestore };
