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

export const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'web') return false;

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        return finalStatus === 'granted';
    } catch (error) {
        console.error('Notification setup failed:', error);
        return false;
    }
};

/**
 * Triggers an immediate hardware alert
 * @param {string} message - The full alert message to display
 */
export const sendOutOfStockAlert = async (message) => {
    if (Platform.OS === 'web') {
        console.warn(`⚠️ WEB CONSOLE NOTICE: ${message}`);
        return;
    }

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '⚠️ STOCK ALERT', // Ginawa nating generic na "STOCK ALERT"
                body: message,          // Gagamitin na natin ang mismong message na galing sa HomeScreen
                sound: true,
            },
            trigger: null, // trigger instantly
        });
    } catch (error) {
        console.error('StockTrack Notification Error:', error);
    }
};