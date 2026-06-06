import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

// Support VITE_ environment variables for custom production/Vercel deployments,
// falling back to local firebase-applet-config.json.
const metaEnv = (import.meta as any).env || {};

const config = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || (firebaseAppletConfig as any).firestoreDatabaseId || '(default)'
};

const app = initializeApp(config);

// Use initializeFirestore with optimized settings for containerized environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, config.firestoreDatabaseId);

export const auth = getAuth(app);

