import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Environment variable configuration for the custom user Firebase project (stationery-pro)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'stationery-pro.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'stationery-pro',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'stationery-pro.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable Google Authentication
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Resolve custom Firestore database ID dynamically via VITE_FIREBASE_FIRESTORE_DATABASE_ID
const dbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
export const db = (dbId && dbId !== "(default)") ? getFirestore(app, dbId) : getFirestore(app);

export { signInWithPopup };

