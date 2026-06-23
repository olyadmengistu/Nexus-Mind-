import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB8EdR-Cy5JmPmdMLzJf8sMN0AvQvxnMdk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexusmind-e8130.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexusmind-e8130",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexusmind-e8130.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "589148042704",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:589148042704:web:c30febfd62a944f76835d5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-P7W9LKFXYP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
