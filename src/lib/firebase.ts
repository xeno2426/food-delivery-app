import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp, increment } from 'firebase/firestore';

// Firebase configuration - Replace with your own config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBXuwkz6ZYD94dMOBnopdHcz2wCmjUyEcE",
  authDomain: "food-delivery-app-7d4f3.firebaseapp.com",
  projectId: "food-delivery-app-7d4f3",
  storageBucket: "food-delivery-app-7d4f3.firebasestorage.app",
  messagingSenderId: "593500424218",
  appId: "1:593500424218:web:6f28c6200957b556d469a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const registerUser = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginUser = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

// Firestore functions
export { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, 
  Timestamp, increment 
};

export default app;
