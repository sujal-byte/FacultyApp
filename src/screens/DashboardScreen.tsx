import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function DashboardScreen({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUserData() {
            try {
                const storedUser = await SecureStore.getItemAsync('userData');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to load user data', error);
            } finally {
                setLoading(false);
            }
        }
        loadUserData();
    }, []);

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        navigation.navigate('Login');
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.nameText}>{user?.name || 'Faculty Member'}</Text>
                <Text style={styles.idText}>ID: {user?.usn || 'N/A'}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Dashboard Overview</Text>
                <View style={styles.card}>
                    <Text style={styles.cardText}>Role: {user?.role || 'User'}</Text>
                    <Text style={styles.cardText}>DOB Verified: {user?.dob || 'N/A'}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 20,
        justifyContent: 'space-between',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginTop: 40,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeText: {
        fontSize: 14,
        color: '#64748b',
    },
    nameText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 4,
    },
    idText: {
        fontSize: 14,
        color: '#475569',
        marginTop: 2,
    },
    content: {
        flex: 1,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardText: {
        fontSize: 16,
        color: '#334155',
        marginBottom: 8,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});