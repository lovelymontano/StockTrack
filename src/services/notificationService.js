import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up the hardware display behavior ONLY for physical mobile devices
if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

/**
 * Requests native hardware device permissions for displaying alerts
 */
export const registerForPushNotificationsAsync = async () => {
    // Safe exit point if testing inside a computer local host browser
    if (Platform.OS === 'web') {
        console.log('StockTrack Web Mode: Skipping mobile hardware alert handshake.');
        return false;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('StockTrack Notice: Notification permissions denied by user.');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Notification setup failed safely:', error);
        return false;
    }
};

/**
 * Triggers an immediate hardware alert when an item sells out completely
 * @param {string} productName - The name of the depleted product
 */
export const sendOutOfStockAlert = async (productName) => {
    // If user is inside local host browser, print a clean backup web log instead of crashing
    if (Platform.OS === 'web') {
        console.warn(`⚠️ WEB CONSOLE NOTICE: "${productName}" is completely out of stock!`);
        return;
    }

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '⚠️ OUT OF STOCK ALERT',
                body: `"${productName}" has completely run out of stock in the supermarket repository!`,
                sound: true,
            },
            trigger: null, // trigger instantly
        });
    } catch (error) {
        console.error('StockTrack Notification Error:', error);
    }
};