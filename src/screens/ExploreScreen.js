import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { subscribeToProducts } from '../services/productService';
import { auth } from '../config/firebase';

export default function ExploreScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Track the selected inventory unit classification tab item
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Dynamic state tracker to manage the warning message layout on screen
    const [accessDeniedMessage, setAccessDeniedMessage] = useState('');

    useEffect(() => {
        const unsubscribe = subscribeToProducts(
            (data) => { setProducts(data); setLoading(false); },
            (err) => { setError("Database sync failed."); setLoading(false); }
        );
        return () => unsubscribe();
    }, []);

    // Local filter array processing search queries and specific item unit matches
    const filteredProducts = products.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const unitType = item.unit ? item.unit.toLowerCase() : '';

        if (selectedCategory === 'All') {
            return matchesSearch;
        } else if (selectedCategory === 'Pieces') {
            // Handles common piece count variations standard to supermarkets
            return matchesSearch && (unitType === 'pieces' || unitType === 'pcs' || unitType === 'piece');
        } else if (selectedCategory === 'Box') {
            // Filters items managed explicitly by boxes packaging unit type
            return matchesSearch && (unitType === 'box' || unitType === 'boxes');
        } else if (selectedCategory === 'Pack') {
            // Filters items bundled or categorized by individual packs packaging
            return matchesSearch && (unitType === 'pack' || unitType === 'packs');
        }
        return matchesSearch;
    });

    const handleAddProductPress = () => {
        // Reset message tracking state before computing conditions
        setAccessDeniedMessage('');

        if (!auth.currentUser) {
            // Render the specific validation warning string requested on screen
            setAccessDeniedMessage("Access Denied: Log In Required (Only Supermarket Staff)");

            // Auto dismissal configuration rule to hide banner smoothly after 4 seconds
            setTimeout(() => {
                setAccessDeniedMessage('');
            }, 4000);
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

            {/* Injected custom layout error handler directly beneath the typography element */}
            {accessDeniedMessage ? (
                <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>⚠️ {accessDeniedMessage}</Text>
                </View>
            ) : null}

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

            {/* Horizontal selection bar updated with the modified product unit categories */}
            <View style={styles.categoryContainer}>
                {['All', 'Pieces', 'Box', 'Pack'].map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryPill,
                            selectedCategory === category && styles.activeCategoryPill
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text
                            style={[
                                styles.categoryPillText,
                                selectedCategory === category && styles.activeCategoryPillText
                            ]}
                        >
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
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
    searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    searchBar: { flex: 1, backgroundColor: '#d0d4c8', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, color: '#000' },
    filterIcon: { fontSize: 24, marginLeft: 12 },

    // Symmetrical styling rules layout for the categorical filter pills
    categoryContainer: { flexDirection: 'row', marginBottom: 20, gap: 8 },
    categoryPill: { backgroundColor: '#d0d4c8', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#c0c4b8' },
    activeCategoryPill: { backgroundColor: '#1b4332', borderColor: '#1b4332' },
    categoryPillText: { fontSize: 13, fontWeight: '600', color: '#555' },
    activeCategoryPillText: { color: '#fff' },

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
    emptyText: { fontSize: 16, color: '#666', fontStyle: 'italic' },

    // Alert notification visual banner attributes 
    warningBanner: { backgroundColor: '#b7094c', padding: 12, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
    warningText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }
});