import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../config/firebase';

export default function DetailScreen({ route, navigation }) {
    const { product } = route.params;
    const isAuthorized = auth.currentUser !== null;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back to List</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
                <Text style={styles.label}>Product Name</Text>
                <Text style={styles.value}>{product.name}</Text>

                {/* Simplified labels from Market Price */}
                <Text style={styles.label}>Price</Text>
                <Text style={styles.value}>₱ {parseFloat(product.price).toFixed(2)}</Text>

                {/* Simplified labels from Current Inventory Volume */}
                <Text style={styles.label}>Available Stock</Text>
                <Text style={styles.value}>{product.stock} {product.unit}</Text>
            </View>

            {isAuthorized && (
                <TouchableOpacity
                    style={styles.editBtn}
                    // Keep core navigation parameters intact
                    onPress={() => navigation.navigate('ManageInventory', { product })}
                >
                    {/* Simplified action string from Modify Inventory Data */}
                    <Text style={styles.editBtnText}>Edit Product</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 24, paddingTop: 50 },
    backBtn: { marginBottom: 30 },
    backText: { fontSize: 16, color: '#2d6a4f', fontWeight: 'bold' },
    infoBox: { backgroundColor: '#fff', padding: 24, borderRadius: 20, marginBottom: 20 },
    label: { fontSize: 14, color: '#777', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    value: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 20 },
    editBtn: { backgroundColor: '#1e7e34', padding: 16, borderRadius: 12, alignItems: 'center' },
    editBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});