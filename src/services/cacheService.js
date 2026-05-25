import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
    PRODUCTS: '@stocktrack_products_cache',
    LAST_SYNC: '@stocktrack_last_sync'
};

/**
 * Saves the live Firestore product array directly to local device hardware memory.
 * @param {Array} products - Array of product objects from Firestore
 */
export const cacheProductsLocally = async (products) => {
    try {
        const jsonValue = JSON.stringify(products);
        await AsyncStorage.setItem(CACHE_KEYS.PRODUCTS, jsonValue);
        await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
        console.log('StockTrack Success: Inventory successfully cached offline.');
    } catch (error) {
        console.error('StockTrack Cache Error (Save):', error);
    }
};

/**
 * Retrieves the cached supermarket catalog when the app goes completely offline.
 * @returns {Promise<Array|null>} Returns the array of cached products or null
 */
export const getCachedProducts = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(CACHE_KEYS.PRODUCTS);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('StockTrack Cache Error (Retrieve):', error);
        return null;
    }
};

/**
 * Gets the timestamp of when the local data was last synchronized with the database.
 * @returns {Promise<string|null>} Timestamp string
 */
export const getLastSyncTime = async () => {
    try {
        return await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    } catch (error) {
        return null;
    }
};