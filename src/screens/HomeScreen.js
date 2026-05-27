import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { cacheProductsLocally } from '../services/cacheService';
import { registerForPushNotificationsAsync, sendOutOfStockAlert } from '../services/notificationService';
import useUserRole from '../hooks/useUserRole';

export default function HomeScreen({ navigation }) {
    // Replaced manual role-check logic with the shared custom hook
    const { userRole, roleLoading } = useUserRole();

    const [totalProducts, setTotalProducts] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);

    // ANTI-SPAM TRACKER: Remembers previous stock status mapping
    const previousStocksRef = useRef({});

    useEffect(() => {
        registerForPushNotificationsAsync();

        const productsRef = collection(db, 'products');

        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            const productList = [];
            let computedTotalValue = 0;
            let computedLowStock = 0;
            let computedOutOfStock = 0;

            const currentStocks = { ...previousStocksRef.current };

            snapshot.forEach((doc) => {
                const data = doc.data();
                const stockNum = parseInt(data.stock || 0);
                const priceNum = parseFloat(data.price || 0);
                const productId = doc.id;
                const prevStock = currentStocks[productId];

                computedTotalValue += (stockNum * priceNum);

                if (stockNum === 0) {
                    computedOutOfStock++;
                } else if (stockNum <= 3) {
                    computedLowStock++;
                }

                // Notification Logic
                if (prevStock !== undefined && prevStock !== stockNum) {
                    if (stockNum === 0) {
                        sendOutOfStockAlert(`OUT OF STOCK: "${data.name}" is now out of stock.`);
                    } else if (stockNum > 0 && stockNum <= 10) {
                        sendOutOfStockAlert(`LOW STOCK: "${data.name}" is running low (${stockNum} remaining).`);
                    } else if (stockNum > 10 && (prevStock === 0 || prevStock <= 10)) {
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
            setOutOfStockCount(computedOutOfStock);
            cacheProductsLocally(productList);
        }, (error) => {
            console.error("Realtime sync failed:", error);
        });

        return () => unsubscribe();
    }, []);

    // ANALYTICS: Compute inventory health score (0–100)
    // Logic: starts at 100, deducts points per out-of-stock (-10) and low-stock (-5) item
    // Floors at 0 so it never goes negative
    const computeHealthScore = () => {
        if (totalProducts === 0) return 100;
        const deductions = (outOfStockCount * 10) + (lowStockCount * 5);
        const raw = 100 - deductions;
        return Math.max(0, Math.min(100, raw));
    };

    const healthScore = computeHealthScore();

    const getHealthLabel = (score) => {
        if (score >= 80) return { label: 'Healthy', color: '#2d6a4f' };
        if (score >= 50) return { label: 'Moderate', color: '#f4a261' };
        return { label: 'Critical', color: '#b7094c' };
    };

    const health = getHealthLabel(healthScore);

    const handleStart = () => {
        navigation.navigate('Inventory');
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

                    {/* Total Inventory Capital */}
                    <View style={styles.mainValueCard}>
                        <Text style={styles.mainValueLabel}>Total Estimated Inventory Capital</Text>
                        <Text style={styles.mainValueText}>₱ {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>

                    {/* SKU Count + Critical Items */}
                    <View style={styles.statsRow}>
                        <View style={styles.smallStatCard}>
                            <Text style={styles.smallCardIcon}>📦</Text>
                            <Text style={styles.smallCardValue}>{totalProducts}</Text>
                            <Text style={styles.smallCardLabel}>Unique SKUs Active</Text>
                        </View>

                        <View style={[styles.smallStatCard, (lowStockCount + outOfStockCount) > 0 && styles.lowStockAlertCard]}>
                            <Text style={styles.smallCardIcon}>⚠️</Text>
                            <Text style={[styles.smallCardValue, (lowStockCount + outOfStockCount) > 0 && styles.lowStockAlertText]}>
                                {lowStockCount + outOfStockCount}
                            </Text>
                            <Text style={styles.smallCardLabel}>Critical Low / Out Items</Text>
                        </View>
                    </View>

                    {/* ANALYTICS DASHBOARD: Inventory Health Score */}
                    <View style={styles.healthCard}>
                        <Text style={styles.healthLabel}>Inventory Health Score</Text>
                        <View style={styles.healthRow}>
                            <Text style={[styles.healthScore, { color: health.color }]}>{healthScore}</Text>
                            <Text style={styles.healthMax}>/100</Text>
                            <View style={[styles.healthBadge, { backgroundColor: health.color }]}>
                                <Text style={styles.healthBadgeText}>{health.label}</Text>
                            </View>
                        </View>

                        {/* Health bar */}
                        <View style={styles.healthBarTrack}>
                            <View style={[styles.healthBarFill, {
                                width: `${healthScore}%`,
                                backgroundColor: health.color
                            }]} />
                        </View>

                        <Text style={styles.healthSubtext}>
                            {outOfStockCount > 0
                                ? `${outOfStockCount} item(s) out of stock · ${lowStockCount} item(s) running low`
                                : lowStockCount > 0
                                    ? `${lowStockCount} item(s) running low`
                                    : 'All products are sufficiently stocked'}
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.heroSection}>
                    <Text style={styles.welcomeTitle}>Welcome to {'\n'}StockTrack!</Text>
                    <Text style={styles.welcomeSubtitle}>Your simple inventory companion.</Text>
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
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
    smallStatCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flex: 1, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    lowStockAlertCard: { backgroundColor: '#fde2e4', borderWidth: 1, borderColor: '#f8b4b9' },
    smallCardIcon: { fontSize: 22, marginBottom: 6 },
    smallCardValue: { fontSize: 22, fontWeight: 'bold', color: '#111' },
    lowStockAlertText: { color: '#b7094c' },
    smallCardLabel: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4, fontWeight: '500' },

    // Inventory Health Score card
    healthCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: '#c0c4b8' },
    healthLabel: { fontSize: 12, fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: 10 },
    healthRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
    healthScore: { fontSize: 36, fontWeight: 'bold' },
    healthMax: { fontSize: 16, color: '#999', marginLeft: 2, marginRight: 10 },
    healthBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    healthBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    healthBarTrack: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
    healthBarFill: { height: 8, borderRadius: 4 },
    healthSubtext: { fontSize: 12, color: '#666', marginTop: 2 },

    button: { backgroundColor: '#2d6a4f', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    arrowIcon: { color: '#fff', fontSize: 18 },
});