import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { addProduct } from '../services/productService';

export default function AddProductScreen({ navigation }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [unit, setUnit] = useState('Box');

    const handleSave = async () => {
        // Structural Validation Checks
        if (!name.trim() || !price.trim() || !stock.trim()) {
            Alert.alert("Form Incomplete", "Please completely fill in all mandatory fields.");
            return;
        }
        if (isNaN(price) || parseFloat(price) <= 0) {
            Alert.alert("Invalid Input", "Price values must correspond to positive real financial scales.");
            return;
        }

        try {
            await addProduct({ name, price, stock, unit });
            Alert.alert("Record Added", "Firestore object clusters processed successfully.");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Sync Fault", "Cloud ingestion rejected. Check client network status.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>New Inventory Record</Text>

            <Text style={styles.fieldLabel}>Item Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Piattos XL" />

            <Text style={styles.fieldLabel}>Price (PHP) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00" />

            <Text style={styles.fieldLabel}>Stock Stockpile Count *</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" />

            <Text style={styles.fieldLabel}>Packaging Unit Metric</Text>
            <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="Box, Piece, Pack..." />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Commit Document</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 24, paddingTop: 50 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25 },
    fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
    saveBtn: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});