import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList } from 'react-native';
import { getCachedProducts, getLastSyncTime } from '../services/cacheService';

export default function CachedInventoryScreen() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [lastSync, setLastSync] = useState(null);

    useEffect(() => {
        const loadCache = async () => {
            setLoading(true);
            const cached = await getCachedProducts();
            const sync = await getLastSyncTime();
            setProducts(cached || []);
            setLastSync(sync);
            setLoading(false);
        };

        loadCache();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2d6a4f" />
                <Text style={styles.loadingText}>Loading cached inventory...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Cached Inventory</Text>
                <Text style={styles.headerSubtitle}>
                    {lastSync ? `Last synced: ${new Date(lastSync).toLocaleString()}` : 'No cached data available.'}
                </Text>
            </View>

            <FlatList
                data={products}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                        <Text style={styles.itemTitle}>{item.name || item.title || 'Unnamed product'}</Text>
                        <Text style={styles.itemSubtitle}>Qty: {item.quantity ?? item.qty ?? 'N/A'}</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No cached products found.</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerContainer: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#2d6a4f',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    headerSubtitle: { fontSize: 13, color: '#e2e4dc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e4dc' },
    loadingText: { marginTop: 10, color: '#162b32' },
    itemCard: { backgroundColor: '#f7f7f7', padding: 12, borderRadius: 8, marginBottom: 10 },
    itemTitle: { fontSize: 16, fontWeight: '600' },
    itemSubtitle: { fontSize: 13, color: '#555', marginTop: 6 },
    emptyContainer: { padding: 24, alignItems: 'center' },
    emptyText: { color: '#666' }
});
