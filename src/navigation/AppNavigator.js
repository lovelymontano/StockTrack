import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Import Ionicons from expo vector icons package
import { Ionicons } from '@expo/vector-icons';

// Import all screens from their respective paths
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import DetailScreen from '../screens/DetailScreen';
import AddProductScreen from '../screens/AddProductScreen';
import ManageInventoryScreen from '../screens/ManageInventoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import MapScreen from '../screens/MapScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab layout managing primary app views
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                // Dynamically assign icons based on the active screen name
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Inventory') {
                        iconName = focused ? 'cube' : 'cube-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Map') {
                        // Custom map navigation icons added perfectly here
                        iconName = focused ? 'map' : 'map-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#1e7e34',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: { backgroundColor: '#fff', paddingBottom: 5, height: 60 },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Inventory" component={ExploreScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
        </Tab.Navigator>
    );
}

// Global root navigation layer handling stacks and modals
export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Set MainDashboard as the initial screen so bottom tabs render immediately on launch */}
            <Stack.Screen name="MainDashboard" component={MainTabs} />

            {/* Application forms and supplementary screens */}
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="ManageInventory" component={ManageInventoryScreen} />
        </Stack.Navigator>
    );
}