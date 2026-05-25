import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { auth } from '../config/firebase';
import { logoutUser } from '../services/authService';
import { updateProfile } from 'firebase/auth';
import { useIsFocused } from '@react-navigation/native'; // Added to track screen focus events

export default function ProfileScreen({ navigation }) {
    // Hook parameter to verify if the profile tab is the active view layer
    const isFocused = useIsFocused();
    const user = auth.currentUser;

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState('Default Name');
    const [position, setPosition] = useState('Default Position');
    const [startYear, setStartYear] = useState('Default Year');

    const [tempName, setTempName] = useState('');
    const [tempPosition, setTempPosition] = useState('');
    const [tempStartYear, setTempStartYear] = useState('');

    // Trigger profile parsing and structural cleanup every time screen gains active window focus
    useEffect(() => {
        if (isFocused) {
            if (user) {
                // If a user session is active, attempt to fetch global profile sync parameters
                if (user.displayName) {
                    try {
                        const parts = user.displayName.split('|');
                        if (parts.length === 3) {
                            setName(parts[0] || 'Default Name');
                            setPosition(parts[1] || 'Default Position');
                            setStartYear(parts[2] || 'Default Year');
                        }
                    } catch (e) {
                        console.error("Failed parsing global identity parameters", e);
                    }
                }
            } else {
                // Reset state parameters back to standard template configurations if no active token is detected
                setName('Default Name');
                setPosition('Default Position');
                setStartYear('Default Year');
                setIsEditing(false);
            }
        }
    }, [isFocused, user]);

    const handleLogAction = async () => {
        if (user) {
            setIsLoading(true);
            try {
                // SECTION 7.1 Lifecycle Management: Hard logout sequence execution
                await logoutUser();

                // Clear local state variables instantly to drop current credentials
                setName('Default Name');
                setPosition('Default Position');
                setStartYear('Default Year');

                console.log("StockTrack Session Manager: Token dropped. Downgrading to anonymous Buyer profile.");

                // Route safely out to the main home interface module view
                // Uses replace/reset navigation structure to guarantee state clearance
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainDashboard', params: { screen: 'Home' } }],
                });
            } catch (err) {
                console.error("Logout execution failure:", err);
            } finally {
                setIsLoading(false);
            }
        } else {
            navigation.navigate('Auth');
        }
    };

    const startEditingHandler = () => {
        setTempName(name === 'Default Name' ? '' : name);
        setTempPosition(position === 'Default Position' ? '' : position);
        setTempStartYear(startYear === 'Default Year' ? '' : startYear);
        setIsEditing(true);
    };

    const saveProfileHandler = async () => {
        const finalName = tempName.trim() ? tempName.trim() : 'Default Name';
        const finalPosition = tempPosition.trim() ? tempPosition.trim() : 'Default Position';
        const finalYear = tempStartYear.trim() ? tempStartYear.trim() : 'Default Year';

        setIsLoading(true);
        try {
            if (user) {
                const combinedProfileData = `${finalName}|${finalPosition}|${finalYear}`;
                await updateProfile(user, { displayName: combinedProfileData });

                setName(finalName);
                setPosition(finalPosition);
                setStartYear(finalYear);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Account profile synchronization block error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Profile</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Account Email</Text>
                <Text style={styles.value}>{user ? user.email : 'Buyer'}</Text>

                <View style={styles.divider} />

                {isLoading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="small" color="#2d6a4f" />
                        <Text style={styles.loadingText}>Updating session state parameters...</Text>
                    </View>
                ) : !isEditing ? (
                    <>
                        <Text style={styles.label}>Full Name</Text>
                        <Text style={styles.infoText}>{name}</Text>

                        <Text style={styles.label}>Position / Role</Text>
                        <Text style={styles.infoText}>{position}</Text>

                        <Text style={styles.label}>Year Started</Text>
                        <Text style={styles.infoText}>{startYear}</Text>

                        {user && (
                            <TouchableOpacity style={styles.editBtn} onPress={startEditingHandler}>
                                <Text style={styles.editBtnText}>Edit Profile Details</Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <View style={styles.formContainer}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput style={styles.input} value={tempName} onChangeText={setTempName} placeholder="Default Name" />

                        <Text style={styles.inputLabel}>Position / Role</Text>
                        <TextInput style={styles.input} value={tempPosition} onChangeText={setTempPosition} placeholder="Default Position" />

                        <Text style={styles.inputLabel}>Year Started</Text>
                        <TextInput style={styles.input} value={tempStartYear} onChangeText={setTempStartYear} placeholder="Default Year" keyboardType="numeric" />

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.saveBtn} onPress={saveProfileHandler}>
                                <Text style={styles.btnText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.btn, { backgroundColor: user ? '#b7094c' : '#2d6a4f' }]}
                onPress={handleLogAction}
                disabled={isLoading}
            >
                <Text style={styles.btnText}>
                    {user ? 'Log Out' : 'Initialize Credentials (Login)'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 24, paddingTop: 60 },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#162b32' },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    label: { fontSize: 11, color: '#777', textTransform: 'uppercase', marginBottom: 2, fontWeight: '600', letterSpacing: 0.3 },
    value: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
    infoText: { fontSize: 16, color: '#333', marginBottom: 14, fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    btn: { padding: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    editBtn: { backgroundColor: '#e2e4dc', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    editBtnText: { color: '#2d6a4f', fontSize: 14, fontWeight: '700' },
    formContainer: { marginTop: 5 },
    inputLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 4 },
    input: { backgroundColor: '#f8f9fa', borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    saveBtn: { backgroundColor: '#2d6a4f', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 8 },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, flex: 1, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
    cancelText: { color: '#666', fontSize: 15, fontWeight: '600' },
    loadingBox: { padding: 20, alignItems: 'center' },
    loadingText: { marginTop: 8, fontSize: 14, color: '#666', fontWeight: '500' }
});