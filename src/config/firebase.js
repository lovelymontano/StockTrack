import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dito tinatawag ang mga tinago mong credentials mula sa .env file
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

// I-initialize ang Firebase App context
const app = initializeApp(firebaseConfig);

// I-on ang Auth persistence para maalala ng phone ang login session ng salesman
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// I-initialize ang Cloud Database at Storage services
const db = getFirestore(app);
const storage = getStorage(app);

// I-export ang mga ito para magamit sa inyong forms at screens
export { auth, db, storage };