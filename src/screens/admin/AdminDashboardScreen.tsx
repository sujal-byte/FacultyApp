// src/screens/admin/AdminDashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import {
    Users,
    ShieldCheck,
    ShieldAlert,
    FileText,
    Bell,
    LogOut,
    LayoutGrid,
    MessageSquare,
    FileCheck,
} from 'lucide-react-native';

export default function AdminDashboardScreen({ navigation }: any) {
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAdminData() {
            try {
                const storedUser = await SecureStore.getItemAsync('userData');
                if (storedUser) {
                    setAdmin(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to load admin data', error);
            } finally {
                setLoading(false);
            }
        }
        loadAdminData();
    }, []);

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    if (loading || !admin) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    const initials = admin?.name
        ? admin.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
        : 'AD';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            {/* Top Header */}
            <View style={styles.topHeader}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View>
                        <Text style={styles.greetingText}>Admin Control Panel,</Text>
                        <Text style={styles.adminName} numberOfLines={1}>
                            {admin.name}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.headerIconBtn}
                    onPress={handleLogout}
                    accessibilityLabel="Log out"
                >
                    <LogOut size={20} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statChip}>
                        <Text style={[styles.statNumber, { color: '#2B6CB0' }]}>24</Text>
                        <Text style={styles.statLabel}>Total Faculty</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statChip}>
                        <Text style={[styles.statNumber, { color: '#276749' }]}>350</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statChip}>
                        <Text style={[styles.statNumber, { color: '#E53E3E' }]}>3</Text>
                        <Text style={styles.statLabel}>System Alerts</Text>
                    </View>
                </View>

                {/* Management Section */}
                <View style={styles.sectionHeader}>
                    <LayoutGrid size={16} color="#1A3A6B" strokeWidth={2} />
                    <Text style={styles.sectionTitle}>System Management</Text>
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('RolesDashboard')}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#EDE9FE' }]}>
                            <ShieldCheck size={20} color="#6B46C1" />
                        </View>
                        <Text style={styles.actionTitle}>Manage Roles</Text>
                        <Text style={styles.actionDesc}>Create, assign & edit user roles</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('UserAccounts')}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#EBF8FF' }]}>
                            <Users size={20} color="#3182CE" />
                        </View>
                        <Text style={styles.actionTitle}>User Accounts</Text>
                        <Text style={styles.actionDesc}>Add, edit or remove faculty/students</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('AuditLogs')}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#FAF5FF' }]}>
                            <ShieldAlert size={20} color="#6B46C1" />
                        </View>
                        <Text style={styles.actionTitle}>Audit Logs</Text>
                        <Text style={styles.actionDesc}>Monitor system activity and security</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('BroadcastNotice')}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#FFFFF0' }]}>
                            <Bell size={20} color="#D69E2E" />
                        </View>
                        <Text style={styles.actionTitle}>Broadcast Notice</Text>
                        <Text style={styles.actionDesc}>Send announcements college-wide</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Reports')}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#FFF5F5' }]}>
                            <FileText size={20} color="#E53E3E" />
                        </View>
                        <Text style={styles.actionTitle}>Reports</Text>
                        <Text style={styles.actionDesc}>Generate attendance & academic reports</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('AdminFeedback')}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#F0FFF4' }]}>
                            <MessageSquare size={20} color="#2F855A" />
                        </View>
                        <Text style={styles.actionTitle}>Faculty Feedback</Text>
                        <Text style={styles.actionDesc}>View and respond to faculty reports</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('AdminSubmissions')}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#EBF8FF' }]}>
                            <FileCheck size={20} color="#2B6CB0" />
                        </View>
                        <Text style={styles.actionTitle}>Upcoming Submissions</Text>
                        <Text style={styles.actionDesc}>Track assignments and submissions</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0F2754',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F2754',
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: '#0F2754',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#E53E3E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    greetingText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    adminName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
        maxWidth: 200,
    },
    headerIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statChip: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    statLabel: {
        fontSize: 10,
        color: '#718096',
        fontWeight: '600',
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#EDF2F7',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A3A6B',
        letterSpacing: 0.1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 4,
        elevation: 2,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1A3A6B',
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 11,
        color: '#718096',
        lineHeight: 15,
    },
});
