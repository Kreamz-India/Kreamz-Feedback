import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyD-ZwG0LYe2BIrCOmgTOIO98cOQKudtsoY",
  authDomain: "kreamz-feedback.firebaseapp.com",
  projectId: "kreamz-feedback",
  storageBucket: "kreamz-feedback.firebasestorage.app",
  messagingSenderId: "528495839371",
  appId: "1:528495839371:web:a6295578ff89ae62f26c8e",
});

export const db = getFirestore(app);
export default app;
