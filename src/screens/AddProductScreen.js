import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { addProduct } from '../services/productService';
// Import essential database instances for duplicate validation checking
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AddProductScreen({ navigation }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [unit, setUnit] = useState('Box'); // Default select option

    // Anti-spam tracker state variable barrier
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || !price.trim() || !stock.trim()) {
            Alert.alert("Incomplete Fields", "Please fill in all required fields.");
            return;
        }
        if (isNaN(price) || parseFloat(price) <= 0) {
            Alert.alert("Invalid Price", "Please enter a valid price amount greater than zero.");
            return;
        }

        if (isProcessing) return;

        try {
            setIsProcessing(true);
            const cleanedInputName = name.trim();

            const productsRef = collection(db, 'products');
            const querySnapshot = await getDocs(productsRef);
            let nameExists = false;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.name && data.name.trim().toLowerCase() === cleanedInputName.toLowerCase()) {
                    nameExists = true;
                }
            });

            if (nameExists) {
                Alert.alert("Product Exists", "Product name already exists.");
                setIsProcessing(false);
                return;
            }

            await addProduct({ 
                name: cleanedInputName, 
                price: parseFloat(price), 
                stock: parseInt(stock, 10), 
                unit: unit 
            });

            Alert.alert("Success", "New product has been added.");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Error", "Could not save product. Please check your internet connection.");
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
            {/* SAFE ALTERNATIVE: Custom Tab Selector Buttons */}
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
    
    // Custom Segmented Control styling
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