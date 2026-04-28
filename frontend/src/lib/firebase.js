import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD-ZwG0LYe2BIrCOmgTOIO98cOQKudtsoY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kreamz-feedback.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kreamz-feedback",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kreamz-feedback.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "528495839371",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:528495839371:web:a6295578ff89ae62f26c8e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
