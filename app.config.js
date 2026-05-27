module.exports = {
    expo: {
        name: "StockTrack",
        slug: "StockTrack",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#e2e4dc"
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#e2e4dc"
            },
            package: "com.stocktrack.app",
            // Dynamically switches between the EAS Cloud Secret file and your local fallback path
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json"
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        extra: {
            eas: {
                projectId: "232cef4e-4f45-4a25-8655-e2efca14fa8e"
            }
        },
        owner: "secretngani",

        // This hooks the open-source map engine configurations directly into your app's native layout bundle
        plugins: [
            "@maplibre/maplibre-react-native"
        ]
    }
};