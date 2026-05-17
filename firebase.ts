import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8EdR-Cy5JmPmdMLzJf8sMN0AvQvxnMdk",
  authDomain: "nexusmind-e8130.firebaseapp.com",
  projectId: "nexusmind-e8130",
  storageBucket: "nexusmind-e8130.firebasestorage.app",
  messagingSenderId: "589148042704",
  appId: "1:589148042704:web:c30febfd62a944f76835d5",
  measurementId: "G-P7W9LKFXYP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
