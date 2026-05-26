import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Web fallback for MapScreen.
 * react-native-maps has no web support — Metro automatically resolves
 * this .web.js file instead of MapScreen.js when bundling for web.
 */
export default function MapScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>🗺️</Text>
            <Text style={styles.title}>Map Not Available on Web</Text>
            <Text style={styles.subtitle}>
                The interactive store map is only available on the{'\n'}Android and iOS mobile apps.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e2e4dc',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    icon: { fontSize: 56, marginBottom: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#162b32', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
});
