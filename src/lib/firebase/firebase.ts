import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDLTMTfe66zijg19mgG30vB8aZ7Q4XJLzE",
  authDomain: "pro-sude.firebaseapp.com",
  projectId: "pro-sude",
  storageBucket: "pro-sude.firebasestorage.app",
  messagingSenderId: "210712665492",
  appId: "1:210712665492:web:b360b4d7d69efa295e0381"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const generateToken = async () => {
  const permission = await Notification.requestPermission();

  if (permission === "granted"){
    const token = await getToken(messaging, {
      vapidKey: "BOYK7rY1co1mSncsTQa-7fAv0FAMU5QwwMkHyqyl1KW4NxP7IATgGogAZywAn5rTHXDAc38or7AeQSWz5XN-1Zg"
    });
    return token
  }
}