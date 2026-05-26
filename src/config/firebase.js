import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
// Added initialization and caching imports for Offline Mode support
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Fetch hidden credentials from the .env file
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};

// Initialize the Firebase App context
const app = initializeApp(firebaseConfig);

// Enable Auth persistence to persist user login sessions
const auth = Platform.OS === 'web'
  ? initializeAuth(app, { persistence: browserLocalPersistence })
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

// FORCE OFFLINE MODE: Forces Firestore to save data locally on the device storage
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Cloud Storage
const storage = getStorage(app);

// Export instances for use across forms and screens
export { auth, db, storage };