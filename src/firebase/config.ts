import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Default Firebase Configuration for Finance Pigeon (Project 714203522649)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB_FinancePigeon_Default_ApiKey_Demo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "finance-pigeon-714203522649.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "finance-pigeon-714203522649",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "finance-pigeon-714203522649.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "714203522649",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:714203522649:web:a1b2c3d4e5f67890"
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {
  console.warn("Firebase Auth persistence fallback enabled");
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence for Firestore if available
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore offline persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore offline persistence is not supported by browser');
    }
  });
} catch (e) {
  console.warn('Firestore persistence init error:', e);
}

export const PROJECT_NUMBER = "714203522649";
export const PROJECT_NAME = "Finance Pigeon";
