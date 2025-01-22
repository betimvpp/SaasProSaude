import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyDLTMTfe66zijg19mgG30vB8aZ7Q4XJLzE",
    authDomain: "pro-sude.firebaseapp.com",
    projectId: "pro-sude",
    storageBucket: "pro-sude.firebasestorage.app",
    messagingSenderId: "210712665492",
    appId: "1:210712665492:web:b360b4d7d69efa295e0381"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);