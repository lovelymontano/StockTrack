import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { subscribeToProducts } from '../services/productService';
import { auth } from '../config/firebase';

export default function ExploreScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToProducts(
            (data) => { setProducts(data); setLoading(false); },
            (err) => { setError("Database sync failed."); setLoading(false); }
        );
        return () => unsubscribe();
    }, []);

    const filteredProducts = products.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddProductPress = () => {
        if (!auth.currentUser) {
            Alert.alert("Access Denied", "Login required to add products.");
            return;
        }
        navigation.navigate('AddProduct');
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2d6a4f" />
                <Text style={{ marginTop: 10 }}>Loading inventory database...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search</Text>

            <View style={styles.searchRow}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search products...."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <Text style={styles.filterIcon}>🎛️</Text>
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No items found</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('Detail', { product: item })}
                    >
                        <View style={styles.imgPlaceholder}><Text style={{ fontSize: 24 }}>📦</Text></View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.prodName}>{item.name}</Text>
                            <Text style={styles.prodPrice}>₱ {parseFloat(item.price).toFixed(2)}</Text>
                            <View style={styles.stockRow}>
                                <View style={[styles.indicator, { backgroundColor: item.stock <= 3 ? 'red' : 'green' }]} />
                                <Text style={styles.prodStock}>
                                    {item.stock <= 3 ? `Low: ${item.stock}` : `In Stock: ${item.stock}`} {item.unit}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity style={styles.fab} onPress={handleAddProductPress}>
                <Text style={styles.fabText}>＋ Add Product</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 20, paddingTop: 40 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
    searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    searchBar: { flex: 1, backgroundColor: '#d0d4c8', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, color: '#000' },
    filterIcon: { fontSize: 24, marginLeft: 12 },
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    imgPlaceholder: { width: 70, height: 70, backgroundColor: '#f0f0f0', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cardInfo: { marginLeft: 16, flex: 1 },
    prodName: { fontSize: 18, fontWeight: 'bold' },
    prodPrice: { fontSize: 16, fontWeight: '600', marginVertical: 2 },
    stockRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    indicator: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    prodStock: { fontSize: 14, color: '#555' },
    fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1b4332', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 25, flexDirection: 'row', alignItems: 'center' },
    fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e4dc' },
    emptyText: { fontSize: 16, color: '#666', fontStyle: 'italic' }
});