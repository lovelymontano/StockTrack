import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { auth } from '../config/firebase';

export default function HomeScreen({ navigation }) {
    const isLoggedIn = auth.currentUser !== null;

    const handleStart = () => {
        navigation.navigate('MainDashboard');
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.brandContainer}>
                    <Text style={styles.logoIcon}>📈</Text>
                    <Text style={styles.brandText}>STOCKTRACK</Text>
                </View>
                <Text style={[styles.loginStatus, { color: isLoggedIn ? 'green' : 'red' }]}>
                    {isLoggedIn ? 'Logged in' : 'Not Logged in'}
                </Text>
            </View>

            <View style={styles.heroSection}>
                <Text style={styles.welcomeTitle}>Welcome to {'\n'}StockTrack!</Text>
                <Text style={styles.welcomeSubtitle}>Your simple inventory companion.</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleStart}>
                <Text style={styles.buttonText}>Start Browsing</Text>
                <Text style={styles.arrowIcon}>〉</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', paddingHorizontal: 24, paddingVertical: 50, justifyContent: 'space-between' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    brandContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { fontSize: 24, marginRight: 6 },
    brandText: { fontSize: 20, fontWeight: 'bold', color: '#162b32', letterSpacing: 1 },
    loginStatus: { fontSize: 16, fontWeight: '600' },
    heroSection: { flex: 1, justifyContent: 'center' },
    welcomeTitle: { fontSize: 36, fontWeight: 'bold', color: '#000', lineHeight: 44, marginBottom: 12 },
    welcomeSubtitle: { fontSize: 16, color: '#444' },
    button: { backgroundColor: '#2d6a4f', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    arrowIcon: { color: '#fff', fontSize: 18 }
});