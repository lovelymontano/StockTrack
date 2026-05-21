import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loginUser, registerUser } from '../services/authService';

export default function AuthScreen({ navigation }) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleProcess = async () => {
        if (!email.includes('@') || password.length < 6) {
            Alert.alert("Credential Format Mismatch", "Enter a valid email layout and minimum 6-character password array.");
            return;
        }

        try {
            if (isLoginView) {
                await loginUser(email, password);
                Alert.alert("Authenticated", "Session state initialized.");
            } else {
                await registerUser(email, password);
                Alert.alert("Registered", "Identity cluster entry produced.");
            }
            navigation.navigate('MainDashboard');
        } catch (err) {
            Alert.alert("Authentication Fault", err.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Toggle Tab Selector (Symmetrical to the Provided Design Layout) */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleTab, isLoginView && styles.activeTab]}
                    onPress={() => setIsLoginView(true)}
                >
                    <Text style={[styles.tabText, isLoginView && styles.activeTabText]}>Log In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleTab, !isLoginView && styles.activeTab]}
                    onPress={() => setIsLoginView(false)}
                >
                    <Text style={[styles.tabText, !isLoginView && styles.activeTabText]}>Register</Text>
                </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Account Email Reference" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Security Access Code Phrase" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />

            <TouchableOpacity style={styles.actionBtn} onPress={handleProcess}>
                <Text style={styles.actionBtnText}>{isLoginView ? 'Log In' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <Text style={{ textAlign: 'center', marginVertical: 20, color: '#555' }}>or</Text>

            <View style={styles.socialRow}>
                <Text style={styles.socialIcon}>🔵</Text>
                <Text style={styles.socialIcon}>🔷</Text>
                <Text style={styles.socialIcon}>🔴</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 24, justifyContent: 'center' },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#d0d4c8', borderRadius: 25, padding: 4, marginBottom: 40 },
    toggleTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 21 },
    activeTab: { backgroundColor: '#3a86ff' },
    tabText: { fontSize: 16, fontWeight: '600', color: '#555' },
    activeTabText: { color: '#fff' },
    input: { backgroundColor: '#fff', padding: 16, borderRadius: 25, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ccc' },
    actionBtn: { backgroundColor: '#3a86ff', paddingVertical: 14, borderRadius: 15, alignItems: 'center', width: '40%', alignSelf: 'center', marginTop: 10 },
    actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
    socialIcon: { fontSize: 32 }
});