import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { updateProduct, deleteProduct } from '../services/productService';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ManageInventoryScreen({ route, navigation }) {
    const { product } = route.params;
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price.toString());
    const [stock, setStock] = useState(product.stock.toString());
    const [unit, setUnit] = useState(product.unit || 'Box');

    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim() || !price.trim() || !stock.trim()) return;
        if (isProcessing) return;

        try {
            setIsProcessing(true);
            setErrorMessage('');
            const cleanedInputName = name.trim();

            if (cleanedInputName.toLowerCase() !== product.name.toLowerCase()) {
                const productsRef = collection(db, 'products');
                const querySnapshot = await getDocs(productsRef);
                let nameExists = false;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.name && data.name.trim().toLowerCase() === cleanedInputName.toLowerCase() && doc.id !== product.id) {
                        nameExists = true;
                    }
                });

                if (nameExists) {
                    setErrorMessage("Product name already exists.");
                    setIsProcessing(false);
                    return;
                }
            }

            await updateProduct(product.id, {
                name: cleanedInputName,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                unit: unit,
            });

            navigation.navigate('MainDashboard', { screen: 'Inventory' });
        } catch (error) {
            setErrorMessage(error.message || 'Failed to update item details safely.');
            setIsProcessing(false);
        }
    };

    const executeDelete = async () => {
        try {
            setErrorMessage('');
            if (!product || !product.id) {
                setErrorMessage('Product ID is missing or undefined.');
                return;
            }
            await deleteProduct(product.id);
            setIsSuccessModalVisible(true);
        } catch (error) {
            setErrorMessage(error.message || 'Firebase collection access denied.');
        }
    };

    const handleModalClose = () => {
        setIsSuccessModalVisible(false);
        navigation.navigate('MainDashboard', { screen: 'Inventory' });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={isProcessing}>
                <Text style={styles.backText}>← Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Edit Product Details</Text>

            <Text style={styles.fieldLabel}>Product Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Product Name" editable={!isProcessing} />

            <Text style={styles.fieldLabel}>Price (PHP) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Price" editable={!isProcessing} />

            <Text style={styles.fieldLabel}>Initial Stock *</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Stock Count" editable={!isProcessing} />

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

            {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

            {!isConfirmingDelete ? (
                <>
                    <TouchableOpacity
                        style={[styles.updateBtn, isProcessing && styles.disabledBtn]}
                        onPress={handleUpdate}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.deleteBtn, isProcessing && styles.disabledBtn]} onPress={() => setIsConfirmingDelete(true)} disabled={isProcessing}>
                        <Text style={styles.btnText}>Delete Product</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <View style={styles.confirmBox}>
                    <Text style={styles.confirmText}>Are you sure you want to delete this permanently?</Text>

                    <TouchableOpacity style={styles.confirmDeleteBtn} onPress={executeDelete}>
                        <Text style={styles.btnText}>Yes, Confirm Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelDeleteBtn} onPress={() => setIsConfirmingDelete(false)}>
                        <Text style={styles.cancelText}>No, Keep Product</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal transparent={true} visible={isSuccessModalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalIcon}>🗑️</Text>
                        <Text style={styles.modalTitle}>Success</Text>
                        <Text style={styles.modalMessage}>The product has been successfully deleted from the system.</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 24, paddingTop: 50 },
    backBtn: { marginBottom: 20 },
    backText: { fontSize: 16, color: '#2d6a4f', fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },

    // Custom Segmented Control styling
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 4, marginBottom: 20 },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    activeTabButton: { backgroundColor: '#2d6a4f' },
    tabText: { fontSize: 15, fontWeight: '600', color: '#555' },
    activeTabText: { color: '#fff' },

    disabledInput: { opacity: 0.5 },
    updateBtn: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    deleteBtn: { backgroundColor: '#b7094c', padding: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabledBtn: { opacity: 0.6 },
    confirmBox: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#b7094c', alignItems: 'center' },
    confirmText: { fontSize: 14, fontWeight: '600', color: '#b7094c', marginBottom: 14, textAlign: 'center' },
    confirmDeleteBtn: { backgroundColor: '#b7094c', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 8 },
    cancelDeleteBtn: { padding: 10, width: '100%', alignItems: 'center' },
    cancelText: { color: '#666', fontSize: 15, fontWeight: '600' },
    errorBanner: { color: '#b7094c', backgroundColor: '#fde8ed', padding: 10, borderRadius: 8, marginBottom: 15, fontWeight: '600', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: '80%', padding: 24, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalIcon: { fontSize: 40, marginBottom: 12 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#162b32', marginBottom: 8 },
    modalMessage: { fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
    modalButton: { backgroundColor: '#2d6a4f', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
    modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});