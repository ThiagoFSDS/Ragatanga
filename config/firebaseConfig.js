// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB6UH-uuPmSSpgm169z56SpgWQWXmBDLC0",
    authDomain: "hackaton-13f8f.firebaseapp.com",
    projectId: "hackaton-13f8f",
    storageBucket: "hackaton-13f8f.firebasestorage.app",
    messagingSenderId: "762918522059",
    appId: "1:762918522059:web:062f3a94f4daf5c6595f4e",
    measurementId: "G-XZB6ZDSSCF"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
