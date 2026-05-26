import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { auth, db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { cacheProductsLocally } from '../services/cacheService';
import { registerForPushNotificationsAsync, sendOutOfStockAlert } from '../services/notificationService';
import { getUserRole } from '../services/authService';
import { useIsFocused } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
    const isFocused = useIsFocused();

    const [userRole, setUserRole] = useState('guest');
    const [roleLoading, setRoleLoading] = useState(true);

    const [totalProducts, setTotalProducts] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);

    // ANTI-SPAM TRACKER: Remembers previous stock status mapping
    const previousStocksRef = useRef({});

    useEffect(() => {
        registerForPushNotificationsAsync();

        const productsRef = collection(db, 'products');

        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            const productList = [];
            let computedTotalValue = 0;
            let computedLowStock = 0;

            const currentStocks = { ...previousStocksRef.current };

            snapshot.forEach((doc) => {
                const data = doc.data();
                const stockNum = parseInt(data.stock || 0);
                const priceNum = parseFloat(data.price || 0);
                const productId = doc.id;
                const prevStock = currentStocks[productId];

                computedTotalValue += (stockNum * priceNum);
                if (stockNum <= 3) {
                    computedLowStock++;
                }

                // Notification Logic
                if (prevStock !== undefined && prevStock !== stockNum) {

                    // 1. OUT OF STOCK: Zero stock
                    if (stockNum === 0) {
                        sendOutOfStockAlert(`OUT OF STOCK: "${data.name}" is now out of stock.`);
                    }
                    // 2. LOW STOCK: 10 below
                    else if (stockNum > 0 && stockNum <= 10) {
                        sendOutOfStockAlert(`LOW STOCK: "${data.name}" is running low (${stockNum} remaining).`);
                    }
                    // 3. RESTOCK: 10 above and was previously out of stock or low stock
                    else if (stockNum > 10 && (prevStock === 0 || prevStock <= 10)) {
                        sendOutOfStockAlert(`RESTOCK: "${data.name}" is now available (${stockNum} in stock).`);
                    }
                }

                currentStocks[productId] = stockNum;
                productList.push({ id: productId, ...data });
            });

            previousStocksRef.current = currentStocks;
            setTotalProducts(productList.length);
            setTotalValue(computedTotalValue);
            setLowStockCount(computedLowStock);
            cacheProductsLocally(productList);
        }, (error) => {
            console.error("Realtime sync failed:", error);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const checkRole = async () => {
            if (auth.currentUser) {
                try {
                    const role = await getUserRole(auth.currentUser.uid);
                    setUserRole(role);
                } catch (e) {
                    setUserRole('guest');
                }
            } else {
                setUserRole('guest');
            }
            setRoleLoading(false);
        };

        if (isFocused) {
            checkRole();
        }
    }, [isFocused, auth.currentUser]);

    const handleStart = () => {
        navigation.navigate('Inventory');
    };

    const handleOpenMap = () => {
        navigation.navigate('Map');
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
            <View style={styles.headerRow}>
                <View style={styles.brandContainer}>
                    <Text style={styles.logoIcon}>📈</Text>
                    <Text style={styles.brandText}>STOCKTRACK</Text>
                </View>
                {roleLoading ? (
                    <ActivityIndicator size="small" color="#2d6a4f" />
                ) : (
                    <Text style={[styles.loginStatus, { color: userRole === 'staff' ? '#2d6a4f' : '#b7094c' }]}>
                        {userRole === 'staff' ? 'Staff Mode' : 'Guest Buyer'}
                    </Text>
                )}
            </View>

            {userRole === 'staff' ? (
                <View style={styles.analyticsWrapper}>
                    <Text style={styles.sectionDashboardTitle}>Supermarket Metrics Dashboard</Text>
                    <Text style={styles.sectionDashboardSubtitle}>Real-time cloud statistical query parameters</Text>

                    <View style={styles.mainValueCard}>
                        <Text style={styles.mainValueLabel}>Total Estimated Inventory Capital</Text>
                        <Text style={styles.mainValueText}>₱ {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.smallStatCard}>
                            <Text style={styles.smallCardIcon}>📦</Text>
                            <Text style={styles.smallCardValue}>{totalProducts}</Text>
                            <Text style={styles.smallCardLabel}>Unique SKUs Active</Text>
                        </View>

                        <View style={[styles.smallStatCard, lowStockCount > 0 && styles.lowStockAlertCard]}>
                            <Text style={styles.smallCardIcon}>⚠️</Text>
                            <Text style={[styles.smallCardValue, lowStockCount > 0 && styles.lowStockAlertText]}>
                                {lowStockCount}
                            </Text>
                            <Text style={styles.smallCardLabel}>Critical Low / Out Items</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.mapSecondaryButton} onPress={handleOpenMap}>
                        <Text style={styles.mapSecondaryButtonText}>📍 View Store Locations Map</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.heroSection}>
                    <Text style={styles.welcomeTitle}>Welcome to {'\n'}StockTrack!</Text>
                    <Text style={styles.welcomeSubtitle}>Your simple inventory companion.</Text>

                    <TouchableOpacity style={styles.mapSecondaryButton} onPress={handleOpenMap}>
                        <Text style={styles.mapSecondaryButtonText}>📍 Find Nearby Repositories</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleStart}>
                <Text style={styles.buttonText}>
                    {userRole === 'staff' ? 'Manage Inventory Sheets' : 'Start Browsing Products'}
                </Text>
                <Text style={styles.arrowIcon}>〉</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1, backgroundColor: '#e2e4dc', paddingHorizontal: 24, paddingVertical: 50, justifyContent: 'space-between' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    brandContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { fontSize: 24, marginRight: 6 },
    brandText: { fontSize: 20, fontWeight: 'bold', color: '#162b32', letterSpacing: 1 },
    loginStatus: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
    heroSection: { flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 40 },
    welcomeTitle: { fontSize: 36, fontWeight: 'bold', color: '#000', lineHeight: 44, marginBottom: 12, textAlign: 'center' },
    welcomeSubtitle: { fontSize: 16, color: '#444', textAlign: 'center' },
    analyticsWrapper: { flex: 1, justifyContent: 'center', marginVertical: 20 },
    sectionDashboardTitle: { fontSize: 22, fontWeight: 'bold', color: '#162b32', marginBottom: 4 },
    sectionDashboardSubtitle: { fontSize: 13, color: '#666', marginBottom: 20 },
    mainValueCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: '#c0c4b8' },
    mainValueLabel: { fontSize: 12, fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: 6 },
    mainValueText: { fontSize: 28, fontWeight: 'bold', color: '#2d6a4f' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    smallStatCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flex: 1, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    lowStockAlertCard: { backgroundColor: '#fde2e4', borderWidth: 1, borderColor: '#f8b4b9' },
    smallCardIcon: { fontSize: 22, marginBottom: 6 },
    smallCardValue: { fontSize: 22, fontWeight: 'bold', color: '#111' },
    lowStockAlertText: { color: '#b7094c' },
    smallCardLabel: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4, fontWeight: '500' },
    mapSecondaryButton: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: '#c0c4b8', width: '100%', alignItems: 'center' },
    mapSecondaryButtonText: { color: '#162b32', fontSize: 15, fontWeight: '600' },
    button: { backgroundColor: '#2d6a4f', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    arrowIcon: { color: '#fff', fontSize: 18 }
});