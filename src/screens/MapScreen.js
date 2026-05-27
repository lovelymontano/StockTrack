import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';

// Initialize MapLibre using free, public open-source raster map style tiles
MapLibreGL.setAccessToken(null);

export default function MapScreen() {
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    // Default center camera array perfectly calibrated for Bulan, Sorsogon [Longitude, Latitude]
    const [centerCoordinate, setCenterCoordinate] = useState([123.8694, 12.6687]);

    // Hardcoded exact coordinates for the prominent supermarkets in Bulan, Sorsogon
    const localSupermarkets = [
        {
            id: 'lcc-bulan',
            name: 'LCC Supermarket Bulan',
            address: 'Zone 5, Bulan, Sorsogon',
            latitude: 12.6698,
            longitude: 123.8752,
        },
        {
            id: 'jeanes-bulan',
            name: 'Jeanes Supermarket',
            address: 'Pier Site, Zone 4, Bulan, Sorsogon',
            latitude: 12.6668,
            longitude: 123.8715,
        },
        {
            id: 'savemore-bulan',
            name: 'Savemore Market Bulan',
            address: 'National Highway, Zone 8, Bulan, Sorsogon',
            latitude: 12.6745,
            longitude: 123.8812,
        },
        {
            id: 'public-market-bulan',
            name: 'Bulan Public Market',
            address: 'Zone 4, Bulan, Sorsogon',
            latitude: 12.6675,
            longitude: 123.8731,
        }
    ];

    useEffect(() => {
        const initializeMap = async () => {
            try {
                // Request live GPS tracking permission (Device Feature Requirement)
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    let loc = await Location.getCurrentPositionAsync({});
                    setUserLocation(loc.coords);
                    
                    // MapLibre uses standard GeoJSON arrays format: [Longitude, Latitude]
                    setCenterCoordinate([loc.coords.longitude, loc.coords.latitude]);
                }
            } catch (error) {
                console.log("Location permission skipped, using default static grid:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeMap();
    }, []);

    // Deep linking launcher for external navigation maps
    const openNavigation = (lat, lng, label) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        Linking.openURL(url).catch(() => {
            Alert.alert("Navigation Error", "Unable to open your external map utility.");
        });
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2d6a4f" />
                <Text style={styles.loadingText}>Loading Map Interface...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header section explicitly mapping local retail providers */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Available Supermarkets</Text>
                <Text style={styles.headerSubtitle}>
                    Select a retail partner below to view local stock availability and directions.
                </Text>
            </View>

            <MapLibreGL.MapView
                style={styles.map}
                logoEnabled={false}
                attributionEnabled={false}
                styleURL="https://demotiles.maplibre.org/style.json" // Free, public vector/raster map tile engine layout
            >
                {/* Handles camera coordinates routing positioning and tracking */}
                <MapLibreGL.Camera
                    zoomLevel={14}
                    centerCoordinate={centerCoordinate}
                    animationMode="flyTo"
                    animationDuration={2000}
                />

                {/* Renders live blue pin locator if user device location permissions are active */}
                {userLocation && (
                    <MapLibreGL.PointAnnotation
                        id="userLocationPin"
                        coordinate={[userLocation.longitude, userLocation.latitude]}
                    >
                        <View style={styles.userLocationDot} />
                    </MapLibreGL.PointAnnotation>
                )}

                {/* Loop through embedded marketplace locations array mapping custom PointAnnotations */}
                {localSupermarkets.map((store) => (
                    <MapLibreGL.PointAnnotation
                        key={store.id}
                        id={store.id}
                        coordinate={[store.longitude, store.latitude]}
                        onSelected={() => openNavigation(store.latitude, store.longitude, store.name)}
                    >
                        {/* Custom styled marker replacing standard pins */}
                        <View style={styles.markerCircle}>
                            <View style={styles.markerInnerCore} />
                        </View>
                    </MapLibreGL.PointAnnotation>
                ))}
            </MapLibreGL.MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    headerContainer: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#2d6a4f',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        zIndex: 10, // Ensures header layout overlays on top of the map layer
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#e2e4dc',
        lineHeight: 18,
    },
    map: { 
        flex: 1 
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#e2e4dc' 
    },
    loadingText: {
        marginTop: 10,
        color: '#162b32',
        fontWeight: '500'
    },
    markerCircle: {
        width: 24,
        height: 24,
        backgroundColor: '#2d6a4f',
        borderRadius: 12,
        borderColor: '#fff',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    markerInnerCore: {
        width: 8,
        height: 8,
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    userLocationDot: {
        width: 18,
        height: 18,
        backgroundColor: '#007AFF',
        borderRadius: 9,
        borderColor: '#fff',
        borderWidth: 3,
        elevation: 5,
    }
});