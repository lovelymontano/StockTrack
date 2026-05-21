import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { updateProduct, deleteProduct } from '../services/productService';

export default function ManageInventoryScreen({ route, navigation }) {
    const { product } = route.params;
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price.toString());
    const [stock, setStock] = useState(product.stock.toString());

    const handleUpdate = async () => {
        if (!name.trim() || !price.trim() || !stock.trim()) return;

        await updateProduct(product.id, {
            name,
            price: parseFloat(price),
            stock: parseInt(stock, 10)
        });
        Alert.alert("Updated", "Document record mutation finalized.");
        navigation.popToTop();
    };

    const handleDelete = () => {
        Alert.alert("Confirm Discard", "Are you sure you want to delete this record permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Purge", style: "destructive", onPress: async () => {
                    await deleteProduct(product.id);
                    navigation.popToTop();
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Update/Remove Entry</Text>

            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" />

            <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
                <Text style={styles.btnText}>Apply Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.btnText}>Purge Document</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 24, paddingTop: 50 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
    updateBtn: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    deleteBtn: { backgroundColor: '#b7094c', padding: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});