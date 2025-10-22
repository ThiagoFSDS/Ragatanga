// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);