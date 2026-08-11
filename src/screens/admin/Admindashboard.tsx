import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
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

    const role = user?.role || 'STUDENT';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header Profile Section */}
            <View style={styles.headerCard}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.nameText}>{user?.name || 'User'}</Text>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{role}</Text>
                    </View>
                </View>
            </View>

            {/* Quick Stats / Info Row */}
            <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>ID / USN</Text>
                    <Text style={styles.infoValue}>{user?.usn || 'N/A'}</Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>DOB Verified</Text>
                    <Text style={styles.infoValue}>{user?.dob || 'N/A'}</Text>
                </View>
            </View>

            {/* Role-Based Quick Actions */}
            <Text style={styles.sectionTitle}>
                {role === 'ADMIN' ? 'Admin Controls' : role === 'FACULTY' ? 'Faculty Portal' : 'Student Portal'}
            </Text>

            <View style={styles.grid}>
                {role === 'ADMIN' && (
                    <>
                        <TouchableOpacity style={styles.actionCard} onPress={() => alert('Manage Users feature coming soon!')}>
                            <Text style={styles.actionTitle}>Manage Users</Text>
                            <Text style={styles.actionDesc}>Add/remove faculty & students</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => alert('Audit Logs coming soon!')}>
                            <Text style={styles.actionTitle}>Audit Logs</Text>
                            <Text style={styles.actionDesc}>Check system activity history</Text>
                        </TouchableOpacity>
                    </>
                )}

                {role === 'FACULTY' && (
                    <>
                        <TouchableOpacity style={styles.actionCard} onPress={() => alert('Attendance feature coming soon!')}>
                            <Text style={styles.actionTitle}>Mark Attendance</Text>
                            <Text style={styles.actionDesc}>Submit student attendance</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => alert('Classes feature coming soon!')}>
                            <Text style={styles.actionTitle}>My Classes</Text>
                            <Text style={styles.actionDesc}>View assigned schedule & students</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Common Cards for Everyone */}
                <TouchableOpacity style={styles.actionCard} onPress={() => alert('Timetable feature coming soon!')}>
                    <Text style={styles.actionTitle}>Timetable</Text>
                    <Text style={styles.actionDesc}>View college schedule</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => alert('Announcements coming soon!')}>
                    <Text style={styles.actionTitle}>Announcements</Text>
                    <Text style={styles.actionDesc}>Read official notices</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#0f172a',
        padding: 20,
        justifyContent: 'space-between',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerInfo: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 13,
        color: '#94a3b8',
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginVertical: 2,
    },
    badgeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#3b82f633',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#3b82f6',
        marginTop: 4,
    },
    badgeText: {
        color: '#60a5fa',
        fontSize: 11,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    infoBox: {
        flex: 1,
        backgroundColor: '#1e293b',
        padding: 14,
        borderRadius: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    infoLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#f8fafc',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 12,
        marginTop: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#334155',
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 12,
        color: '#94a3b8',
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 20,
    },
    logoutText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});