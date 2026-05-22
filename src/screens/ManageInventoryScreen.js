import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { updateProduct, deleteProduct } from '../services/productService';

export default function ManageInventoryScreen({ route, navigation }) {
    const { product } = route.params;
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price.toString());
    const [stock, setStock] = useState(product.stock.toString());
    const [unit, setUnit] = useState(product.unit || 'Box');

    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim() || !price.trim() || !stock.trim()) return;

        // Keep core functional backend logic intact
        await updateProduct(product.id, {
            name,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            unit,
        });

        // Directly route back to the Inventory tab inside MainDashboard nested tree
        navigation.navigate('MainDashboard', { screen: 'Inventory' });
    };

    const executeDelete = async () => {
        try {
            setErrorMessage('');

            if (!product || !product.id) {
                setErrorMessage('Product ID is missing or undefined.');
                return;
            }

            // Direct execution call to your existing backend database service
            await deleteProduct(product.id);

            // Trigger the custom success popup message
            setIsSuccessModalVisible(true);
        } catch (error) {
            setErrorMessage(error.message || 'Firebase collection access denied.');
        }
    };

    const handleModalClose = () => {
        setIsSuccessModalVisible(false);
        // Explicitly force navigation routing to transition into the nested Inventory tab view
        navigation.navigate('MainDashboard', { screen: 'Inventory' });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Edit Product Details</Text>

            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Product Name" />
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Price" />
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Stock Count" />
            <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="Unit (e.g. Box, Piece, Pack)" />

            {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

            {!isConfirmingDelete ? (
                <>
                    <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
                        <Text style={styles.btnText}>Save Changes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteBtn} onPress={() => setIsConfirmingDelete(true)}>
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

            <Modal
                transparent={true}
                visible={isSuccessModalVisible}
                animationType="fade"
            >
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
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
    updateBtn: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    deleteBtn: { backgroundColor: '#b7094c', padding: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

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