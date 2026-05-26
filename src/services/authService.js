import { auth, db } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Account Creation Interface Logic
 * Automatically initializes internal accounts with explicit "staff" management capabilities.
 */
export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Securely push the profile metadata template into your cloud database
        // Fixed: Set to 'staff' instantly since guest/buyers browse anonymously without accounts
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role: 'staff'
        });

        return { success: true, user: user };
    } catch (error) {
        console.error("Registration Error: ", error.message);
        throw error;
    }
};

/**
 * Login Interface Logic
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login Error: ", error.message);
        throw error;
    }
};

/**
 * Application Session Sign-out
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Logout Error: ", error.message);
        throw error;
    }
};

/**
 * Queries the background Firestore configuration layer to verify user authority parameters.
 * Used across the presentation views to dynamically restrict admin layout accessibility features.
 * * @param {string} uid - The authenticated user's unique identification string
 * @returns {Promise<string>} Returns the localized role string ('staff' or 'guest')
 */
export const getUserRole = async (uid) => {
    // If no user session exists (unauthenticated Guest Buyer), return guest profile immediately
    if (!uid) return 'guest';

    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log(`StockTrack Auth: Profile role localized as "${userData.role}"`);
            return userData.role || 'guest';
        } else {
            // Fallback state if user exists in Auth but has no database document yet
            console.log('StockTrack Auth: No document template found. Defaulting to guest permissions.');
            return 'guest';
        }
    } catch (error) {
        console.error('StockTrack RBAC Extraction Error:', error);
        return 'guest';
    }
};

/**
 * Password Reset Initialization Logic
 * Sends a recovery sequence tracking link to the assigned registration address.
 */
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email.trim());
        return { success: true };
    } catch (error) {
        console.error("Password Reset Error: ", error.message);
        throw error;
    }
};