import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// I-import ang lahat ng iyong screens mula sa tamang paths
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import DetailScreen from '../screens/DetailScreen';
import AddProductScreen from '../screens/AddProductScreen';
import ManageInventoryScreen from '../screens/ManageInventoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab layout para sa main screens
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#1e7e34',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: { backgroundColor: '#fff', paddingBottom: 5, height: 60 },
                headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Inventory" component={ExploreScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// Ang mismong Navigator component na i-eexport natin
export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* 1. Unang lilitaw (Welcome Splash Screen) */}
            <Stack.Screen name="Welcome" component={HomeScreen} />

            {/* 2. Main Tab wrapper (Home, Inventory Feed, Profile) */}
            <Stack.Screen name="MainDashboard" component={MainTabs} />

            {/* 3. Sub-pages / Forms */}
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="ManageInventory" component={ManageInventoryScreen} />
        </Stack.Navigator>
    );
}