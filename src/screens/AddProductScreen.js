import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { addProduct } from '../services/productService';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function AddProductScreen({ navigation }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [unit, setUnit] = useState('Box');

    const [isProcessing, setIsProcessing] = useState(false);

    const handleSave = async () => {
        // Step 1: Basic field validation
        if (!name.trim() || !price.trim() || !stock.trim()) {
            Alert.alert("Incomplete Fields", "Please fill in all required fields.");
            return;
        }
        if (isNaN(price) || parseFloat(price) <= 0) {
            Alert.alert("Invalid Price", "Please enter a valid price amount greater than zero.");
            return;
        }

        // Step 2: Anti-spam guard — lock the button
        if (isProcessing) return;
        setIsProcessing(true);

        const cleanedInputName = name.trim();

        // Step 3: Fast & Optimized Duplicate Name Check
        try {
            const productsRef = collection(db, 'products');

            // Used target query for case-insensitive/exact match comparison
            const q = query(productsRef, where("name", "==", cleanedInputName));
            const querySnapshot = await getDocs(q);

            let nameExists = !querySnapshot.empty;

            // Secondary validation fallback 
            if (!nameExists) {
                const allDocs = await getDocs(productsRef);
                allDocs.forEach((doc) => {
                    const data = doc.data();
                    if (data.name && data.name.trim().toLowerCase() === cleanedInputName.toLowerCase()) {
                        nameExists = true;
                    }
                });
            }

            if (nameExists) {
                Alert.alert("Product Exists", "A product with this name already exists. Please use a different name.");
                setIsProcessing(false);
                return;
            }
        } catch (checkErr) {
            console.error("Duplicate check failed:", checkErr);

        }

        // Step 4: Save Operation
        try {
            await addProduct({
                name: cleanedInputName,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                unit: unit
            });

            Alert.alert("Success", "New product has been added.");
            navigation.goBack();
        } catch (saveErr) {
            console.error("Save failed:", saveErr);
            Alert.alert("Save Failed", "Could not save the product. Please try again.");
            setIsProcessing(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={isProcessing}>
                <Text style={styles.backText}>← Back to List</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Add New Product</Text>

            <Text style={styles.fieldLabel}>Product Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Piattos XL" editable={!isProcessing} />

            <Text style={styles.fieldLabel}>Price (PHP) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00" editable={!isProcessing} />

            <Text style={styles.fieldLabel}>Initial Stock *</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" editable={!isProcessing} />

            <Text style={styles.fieldLabel}>Unit Measurement *</Text>
            <View style={styles.tabContainer}>
                {['Box', 'Pieces', 'Pack'].map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[
                            styles.tabButton,
                            unit === item && styles.activeTabButton,
                            isProcessing && styles.disabledInput
                        ]}
                        onPress={() => setUnit(item)}
                        disabled={isProcessing}
                    >
                        <Text style={[styles.tabText, unit === item && styles.activeTabText]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.saveBtn, isProcessing && styles.disabledBtn]}
                onPress={handleSave}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.saveText}>Add Product</Text>
                )}
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
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 4, marginBottom: 20 },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    activeTabButton: { backgroundColor: '#2d6a4f' },
    tabText: { fontSize: 15, fontWeight: '600', color: '#555' },
    activeTabText: { color: '#fff' },
    disabledInput: { opacity: 0.5 },
    saveBtn: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabledBtn: { opacity: 0.6 }
});