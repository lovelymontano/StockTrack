import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, getFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAVuGb_od-_njN8CDmnZmSuaBOPWDOPl2c",
  authDomain: "stocktrack-e47a0.firebaseapp.com",
  projectId: "stocktrack-e47a0",
  storageBucket: "stocktrack-e47a0.firebasestorage.app",
  messagingSenderId: "37407505817",
  appId: "1:37407505817:web:3c030f116fd3254127a708",
  measurementId: "G-43ZD9Y37CP"
};

// Initialize the Firebase App context
const app = initializeApp(firebaseConfig);

// Enable Auth persistence to persist user login sessions
const auth = Platform.OS === 'web'
  ? initializeAuth(app, { persistence: browserLocalPersistence })
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

// Initialize Firestore with persistent local cache on native, default on web
const db = Platform.OS === 'web'
  ? getFirestore(app)
  : initializeFirestore(app, {
    localCache: persistentLocalCache()
  });

// Initialize Cloud Storage
const storage = getStorage(app);

// Export instances for use across forms and screens
export { auth, db, storage };