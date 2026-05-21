import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../config/firebase';
import { logoutUser } from '../services/authService';

export default function ProfileScreen({ navigation }) {
    const user = auth.currentUser;

    const handleLogAction = async () => {
        if (user) {
            await logoutUser();
            navigation.navigate('Welcome');
        } else {
            navigation.navigate('Auth');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>System Control Profile</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Identity Handle Token</Text>
                <Text style={styles.value}>{user ? user.email : 'Unidentified System Guest'}</Text>
            </View>

            <TouchableOpacity
                style={[styles.btn, { backgroundColor: user ? '#b7094c' : '#3a86ff' }]}
                onPress={handleLogAction}
            >
                <Text style={styles.btnText}>{user ? 'Disconnect Session (Logout)' : 'Initialize Credentials (Login)'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 24, paddingTop: 60 },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 30 },
    label: { fontSize: 12, color: '#777', uppercase: true, marginBottom: 4 },
    value: { fontSize: 18, fontWeight: 'bold' },
    btn: { padding: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});