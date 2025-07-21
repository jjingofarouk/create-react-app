// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot, addDoc, deleteDoc, setDoc, doc, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => console.log("Firestore offline persistence enabled"))
  .catch((error) => {
    if (error.code === 'failed-precondition') {
      console.error("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (error.code === 'unimplemented') {
      console.error("The current browser does not support offline persistence.");
    }
  });

export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, collection, query, where, onSnapshot, addDoc, deleteDoc, setDoc, doc };