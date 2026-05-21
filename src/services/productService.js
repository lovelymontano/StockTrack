import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'products';

// CREATE: Magdagdag ng Bagong Item (May timestamps)
export const addProduct = async (productData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            name: productData.name,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock, 10),
            unit: productData.unit || 'Box',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Firestore Insert Error: ", error);
        throw error;
    }
};

// READ: Realtime Event Stream Subscription (Sorted sa pinakabago)
export const subscribeToProducts = (onUpdate, onError) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        onUpdate(list);
    }, (err) => {
        if (onError) onError(err);
    });
};

// UPDATE: Baguhin ang mga Detalye ng Stock Data
export const updateProduct = async (id, updatedData) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...updatedData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Firestore Update Error: ", error);
        throw error;
    }
};

// DELETE: Permanenteng pagbura ng records sa cluster
export const deleteProduct = async (id) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error("Firestore Delete Error: ", error);
        throw error;
    }
};