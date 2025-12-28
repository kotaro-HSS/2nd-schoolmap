// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ↓↓↓ ここには、先ほどの uploadData.js で使った設定と同じものを貼ってください ↓↓↓
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_zgiD6dH-cS738z-TdwsxwfALMHWIgWs",
  authDomain: "schoolmap-hss.firebaseapp.com",
  projectId: "schoolmap-hss",
  storageBucket: "schoolmap-hss.firebasestorage.app",
  messagingSenderId: "801585784522",
  appId: "1:801585784522:web:5cb8d4f3ebc67405a7f633",
  measurementId: "G-JPDZ3QQE1N"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);