import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Reusable stock status indicator used in product list cards.
 * Shows a colored dot and stock count text.
 *
 * Props:
 *   stock  {number} - current stock quantity
 *   unit   {string} - unit label (Box, Pieces, Pack)
 *
 * Usage:
 *   <StockBadge stock={item.stock} unit={item.unit} />
 */
export default function StockBadge({ stock, unit }) {
    const isLow = stock <= 3;
    const isOut = stock === 0;

    const dotColor = isOut ? '#b7094c' : isLow ? '#f4a261' : '#2d6a4f';
    const label = isOut
        ? `Out of Stock`
        : isLow
        ? `Low: ${stock} ${unit}`
        : `In Stock: ${stock} ${unit}`;

    return (
        <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <Text style={[styles.text, { color: dotColor }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    text: { fontSize: 14, fontWeight: '500' },
});