// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBak8XwAcbQHs6PGkqJ-ZrZYIuuHiC2ke4",
  authDomain: "kompos-dcb8a.firebaseapp.com",
  projectId: "kompos-dcb8a",
  storageBucket: "kompos-dcb8a.firebasestorage.app",
  messagingSenderId: "847391249254",
  appId: "1:847391249254:web:2294729a5eb41923f7aea7",
  measurementId: "G-TD67FEL3CD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);