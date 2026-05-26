import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { loginUser, registerUser, resetPassword } from '../services/authService';

export default function AuthScreen({ navigation }) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [staffId, setStaffId] = useState(''); // State tracker for restriction code entry

    // State to manage the custom notification banner top view
    const [warningMessage, setWarningMessage] = useState('');

    // The 5 hardcoded unique ID tokens permitted to register as staff
    const ALLOWED_STAFF_IDS = [
        'STAFF-SORSU-01',
        'STAFF-SORSU-02',
        'STAFF-SORSU-03',
        'STAFF-SORSU-04',
        'STAFF-SORSU-05'
    ];

    const handleProcess = async () => {
        setWarningMessage(''); // Clear previous validation messages before computing checks

        if (!email.includes('@') || password.length < 6) {
            setWarningMessage("Credential Format Mismatch: Enter a valid email and minimum 6-character password.");
            return;
        }

        // Security check barrier: Runs only during user account registration
        if (!isLoginView) {
            if (!staffId.trim()) {
                setWarningMessage("Registration Denied: Unique Staff ID token is required.");
                return;
            }
            if (!ALLOWED_STAFF_IDS.includes(staffId.trim())) {
                setWarningMessage("Access Denied: Invalid Unique ID (Only Supermarket Staff)");
                return;
            }
        }

        try {
            if (isLoginView) {
                await loginUser(email, password);
            } else {
                await registerUser(email, password);
            }
            // Navigate directly to the dashboard upon successful verification process completion
            navigation.navigate('MainDashboard');
        } catch (err) {
            setWarningMessage(err.message);
        }
    };

    const handleForgotPassword = async () => {
        setWarningMessage(''); // Clear previous validation messages

        if (!email.trim() || !email.includes('@')) {
            setWarningMessage("Input Required: Enter a valid email address to request a reset link.");
            return;
        }

        try {
            await resetPassword(email);
            alert("Success: A password reset link has been sent to your email.");
        } catch (err) {
            setWarningMessage(err.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* UPDATED: Clean text navigation link layout using 'Back' text natively */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            {/* Custom Warning Ribbon Notification Banner */}
            {warningMessage ? (
                <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>⚠️ {warningMessage}</Text>
                </View>
            ) : null}

            {/* Toggle Tab Selector (Symmetrical to your Provided Design Layout) */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleTab, isLoginView && styles.activeTab]}
                    onPress={() => { setIsLoginView(true); setWarningMessage(''); }}
                >
                    <Text style={[styles.tabText, isLoginView && styles.activeTabText]}>Log In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleTab, !isLoginView && styles.activeTab]}
                    onPress={() => { setIsLoginView(false); setWarningMessage(''); }}
                >
                    <Text style={[styles.tabText, !isLoginView && styles.activeTabText]}>Register</Text>
                </TouchableOpacity>
            </View>

            {/* Standard Text input layout containers */}
            <TextInput style={styles.input} placeholder="Registered Email Address" placeholderTextColor="#888" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Security Password" placeholderTextColor="#888" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />

            {/* Supplementary interactive link managing automated authentication recovery resets */}
            {isLoginView && (
                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            )}

            {/* Conditional Input Field: Displays ONLY when the Register Tab is active */}
            {!isLoginView && (
                <TextInput
                    style={[styles.input, styles.staffInputHighlight]}
                    placeholder="Enter Unique Staff ID Code"
                    placeholderTextColor="#999"
                    value={staffId}
                    onChangeText={setStaffId}
                    autoCapitalize="characters" // Automatically forces user input into uppercase characters
                />
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={handleProcess}>
                <Text style={styles.actionBtnText}>{isLoginView ? 'Log In' : 'Sign Up'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 24, justifyContent: 'center' },

    // Symmetrical alignment properties to support look-and-feel formatting rules
    backButton: { position: 'absolute', top: 50, left: 24, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#d0d4c8' },
    backButtonText: { color: '#1b4332', fontSize: 14, fontWeight: '700' },

    // Warning banner styling built within the app layout aesthetics
    warningBanner: { backgroundColor: '#b7094c', padding: 12, borderRadius: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
    warningText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },

    toggleContainer: { flexDirection: 'row', backgroundColor: '#d0d4c8', borderRadius: 25, padding: 4, marginBottom: 40 },
    toggleTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 21 },

    // Replaced vibrant blue with the Deep Earth-Tone Green color asset profile
    activeTab: { backgroundColor: '#1b4332' },
    tabText: { fontSize: 16, fontWeight: '600', color: '#555' },
    activeTabText: { color: '#fff' },

    input: { backgroundColor: '#fff', padding: 16, borderRadius: 25, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ccc' },

    // Layout alignment configurations for the supplementary access links
    forgotPasswordContainer: { alignSelf: 'flex-end', marginRight: 8, marginBottom: 20 },
    forgotPasswordText: { color: '#1b4332', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },

    // Visual border highlight applied to the restricted input text area box
    staffInputHighlight: { borderColor: '#1b4332', borderWidth: 1.5, backgroundColor: '#f4f6f0' },

    // Action trigger button configuration using the primary matching design token
    actionBtn: { backgroundColor: '#1b4332', paddingVertical: 14, borderRadius: 15, alignItems: 'center', width: '40%', alignSelf: 'center', marginTop: 10 },
    actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});