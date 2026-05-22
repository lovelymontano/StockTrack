import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { addProduct } from '../services/productService';

export default function AddProductScreen({ navigation }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [unit, setUnit] = useState('Box');

    const handleSave = async () => {
        if (!name.trim() || !price.trim() || !stock.trim()) {
            Alert.alert("Incomplete Fields", "Please fill in all required fields.");
            return;
        }
        if (isNaN(price) || parseFloat(price) <= 0) {
            Alert.alert("Invalid Price", "Please enter a valid price amount greater than zero.");
            return;
        }

        try {
            // Keep original object data payload ingestion structure intact
            await addProduct({ name, price, stock, unit });
            Alert.alert("Success", "New product has been added.");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Error", "Could not save product. Please check your internet connection.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Added manual custom back link to stack navigator list view */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back to List</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Add New Product</Text>

            <Text style={styles.fieldLabel}>Product Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Piattos XL" />

            <Text style={styles.fieldLabel}>Price (PHP) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00" />

            <Text style={styles.fieldLabel}>Initial Stock *</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" />

            <Text style={styles.fieldLabel}>Unit Measurement</Text>
            <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="e.g. Box, Piece, Pack" />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Add Product</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 24, paddingTop: 50 },
    backBtn: { marginBottom: 20 },
    backText: { fontSize: 16, color: '#2d6a4f', fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25 },
    fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
    saveBtn: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});