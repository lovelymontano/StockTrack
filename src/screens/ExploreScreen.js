import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { subscribeToProducts } from '../services/productService';
import { auth } from '../config/firebase';
import { getUserRole } from '../services/authService';

export default function ExploreScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('guest');

    // Track the selected inventory unit classification tab item
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Dynamic state tracker to manage the warning message layout on screen
    const [accessDeniedMessage, setAccessDeniedMessage] = useState('');

    // NEW STATE FOR SECTION 7.2: Cycles criteria parameters ('none', 'low-to-high', 'high-to-low')
    const [stockSortOrder, setStockSortOrder] = useState('none');

    useEffect(() => {
        // Step A: Real-time product subscription stream
        const unsubscribe = subscribeToProducts(
            (data) => { setProducts(data); setLoading(false); },
            (err) => { setError("Database sync failed."); setLoading(false); }
        );

        // Step B: Role-Based Access checking stream loop
        const checkUserAuthority = async () => {
            if (auth.currentUser) {
                const role = await getUserRole(auth.currentUser.uid);
                setUserRole(role);
            } else {
                setUserRole('guest');
            }
        };

        checkUserAuthority();
        return () => unsubscribe();
    }, [auth.currentUser]);

    // SECTION 7.2 Core Logic: Process dual-filtering and numerical stock level sorting layers
    const filteredAndSortedProducts = products
        .filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const unitType = item.unit ? item.unit.toLowerCase() : '';

            if (selectedCategory === 'All') {
                return matchesSearch;
            } else if (selectedCategory === 'Pieces') {
                return matchesSearch && (unitType === 'pieces' || unitType === 'pcs' || unitType === 'piece');
            } else if (selectedCategory === 'Box') {
                return matchesSearch && (unitType === 'box' || unitType === 'boxes');
            } else if (selectedCategory === 'Pack') {
                return matchesSearch && (unitType === 'pack' || unitType === 'packs');
            }
            return matchesSearch;
        })
        .sort((a, b) => {
            // Sort arrays mathematically depending on user toggle input metrics
            if (stockSortOrder === 'low-to-high') {
                return parseInt(a.stock || 0) - parseInt(b.stock || 0);
            } else if (stockSortOrder === 'high-to-low') {
                return parseInt(b.stock || 0) - parseInt(a.stock || 0);
            }
            return 0; // Maintain natural background real-time synchronization sequence 
        });

    // NEW HANDLER FOR SECTION 7.2: Loops through state configurations
    const toggleStockSortHandler = () => {
        if (stockSortOrder === 'none') {
            setStockSortOrder('low-to-high');
        } else if (stockSortOrder === 'low-to-high') {
            setStockSortOrder('high-to-low');
        } else {
            setStockSortOrder('none');
        }
    };

    const handleAddProductPress = () => {
        setAccessDeniedMessage('');

        if (userRole !== 'staff') {
            setAccessDeniedMessage("Access Denied: Log In Required (Only Supermarket Staff)");

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

                {/* SECTION 7.2 UI MODULE: Interactive dynamic sorting switch control element */}
                <TouchableOpacity
                    style={[styles.sortBtn, stockSortOrder !== 'none' && styles.activeSortBtn]}
                    onPress={toggleStockSortHandler}
                >
                    <Text style={styles.sortIcon}>
                        {stockSortOrder === 'none' ? '🎛️' : stockSortOrder === 'low-to-high' ? '📉' : '📈'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Visual sorting verification badge layout */}
            {stockSortOrder !== 'none' && (
                <View style={styles.activeSortBadge}>
                    <Text style={styles.activeSortBadgeText}>
                        Sorting: {stockSortOrder === 'low-to-high' ? 'Critical Low Stock First' : 'High Volume Stock First'}
                    </Text>
                </View>
            )}

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
                data={filteredAndSortedProducts} // Injected multi-criteria computational array
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No items found</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => {
                            if (userRole === 'staff') {
                                navigation.navigate('ManageInventory', { product: item });
                            } else {
                                navigation.navigate('Detail', { product: item });
                            }
                        }}
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

            {userRole === 'staff' && (
                <TouchableOpacity style={styles.fab} onPress={handleAddProductPress}>
                    <Text style={styles.fabText}>＋ Add Product</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e4dc', padding: 20, paddingTop: 40 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
    searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    searchBar: { flex: 1, backgroundColor: '#d0d4c8', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, color: '#000' },

    // Section 7.2 control structure styling layouts
    sortBtn: { backgroundColor: '#d0d4c8', borderRadius: 12, padding: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
    activeSortBtn: { backgroundColor: '#1b4332' },
    sortIcon: { fontSize: 20 },
    activeSortBadge: { backgroundColor: '#1b4332', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
    activeSortBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

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
    warningBanner: { backgroundColor: '#b7094c', padding: 12, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
    warningText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }
});