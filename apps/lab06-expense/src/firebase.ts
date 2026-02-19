// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSrJywGXwRH2UZ4UQgsrj37t-Iodhcgzc",
  authDomain: "lab06-expense-c5aba.firebaseapp.com",
  projectId: "lab06-expense-c5aba",
  storageBucket: "lab06-expense-c5aba.firebasestorage.app",
  messagingSenderId: "1011213981975",
  appId: "1:1011213981975:web:24826592e06943a0e03f52",
  measurementId: "G-D035M9K786"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ถ้าต้องการ analytics ก็ export ได้
// export const analytics = getAnalytics(app);