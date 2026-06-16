import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
const isConfigured = !!apiKey && apiKey !== 'YOUR_FIREBASE_API_KEY'

let app: FirebaseApp | null = null
let database: Database | null = null

if (isConfigured) {
  const firebaseConfig = {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  }

  // Prevent re-initializing on hot reload
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

  try {
    database = getDatabase(app)
  } catch (e) {
    console.warn('[Firebase] Failed to initialize Realtime Database:', e)
    database = null
  }
}

/** The Realtime Database instance, or null if Firebase is not configured */
export const db = database
