import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBak8XwAcbQHs6PGkqJ-ZrZYIuuHiC2ke4",
  authDomain: "kompos-dcb8a.firebaseapp.com",
  projectId: "kompos-dcb8a",
  storageBucket: "kompos-dcb8a.firebasestorage.app",
  messagingSenderId: "847391249254",
  appId: "1:847391249254:web:2294729a5eb41923f7aea7",
  measurementId: "G-TD67FEL3CD"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };