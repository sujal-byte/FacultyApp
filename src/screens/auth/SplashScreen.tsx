import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function SplashScreen({ navigation }: any) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;

    useEffect(() => {
        // Run entry animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Check authentication state
        const checkAuth = async () => {
            try {
                const [token, userDataStr] = await Promise.all([
                    SecureStore.getItemAsync('userToken'),
                    SecureStore.getItemAsync('userData'),
                ]);

                // Minimum splash display time of 1000ms for smooth experience
                await new Promise((resolve) => setTimeout(resolve, 1000));

                if (token && userDataStr) {
                    const user = JSON.parse(userDataStr);
                    if (user?.role === 'ADMIN') {
                        navigation.replace('AdminDashboard');
                        return;
                    } else {
                        navigation.replace('Dashboard');
                        return;
                    }
                }
            } catch (err) {
                console.error('Error during auto-auth check:', err);
            }

            navigation.replace('Login');
        };

        checkAuth();
    }, [navigation, fadeAnim, scaleAnim]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Logo with clean white circular background */}
                <View style={styles.logoWrap}>
                    <Image
                        source={require('../../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Portal Title */}
                <Text style={styles.portalTitle}>RNSIT Faculty Portal</Text>
                <Text style={styles.collegeName}>RNS Institute of Technology</Text>
                <Text style={styles.location}>Bengaluru, Karnataka</Text>

                {/* Loading indicator */}
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="small" color="#90CDF4" />
                </View>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Empowering Faculty Excellence</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F2754',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoWrap: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    logo: {
        width: 105,
        height: 105,
    },
    portalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 6,
    },
    collegeName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#CBD5E0',
        textAlign: 'center',
        marginBottom: 2,
    },
    location: {
        fontSize: 12,
        fontWeight: '500',
        color: '#A0AEC0',
        textAlign: 'center',
    },
    loadingWrap: {
        marginTop: 32,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.45)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});
