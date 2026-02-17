import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeZwySXZB-DI480oWu4VLkFGsf8g-wfpc",
  authDomain: "yousifandsons-boltedit.firebaseapp.com",
  projectId: "yousifandsons-boltedit",
  storageBucket: "yousifandsons-boltedit.firebasestorage.app",
  messagingSenderId: "119474906836",
  appId: "1:119474906836:web:b07b4a76a68ef3fbe87d41"
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with SESSION persistence (user logs out when browser/tab closes)
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence).catch(console.error);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
