import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdrgAesHPCVtm7rdaKmzNrlVqDDKtkjd8",
  authDomain: "calcwallet.firebaseapp.com",
  projectId: "calcwallet",
  storageBucket: "calcwallet.firebasestorage.app",
  messagingSenderId: "854785212440",
  appId: "1:854785212440:web:803667e23f4e1755a2c36d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
