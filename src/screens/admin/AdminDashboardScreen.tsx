// src/screens/admin/AdminDashboardScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Modal,
    Animated,
    Easing,
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
    X,
    Menu as MenuIcon,
} from 'lucide-react-native';

export default function AdminDashboardScreen({ navigation }: any) {
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const menuAnim = useRef(new Animated.Value(0)).current;

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

    const openMenu = () => {
        setMenuVisible(true);
        Animated.timing(menuAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: 160,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(() => setMenuVisible(false));
    };

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

    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateString = `${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

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

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.headerIconBtn}
                        onPress={() => navigation.navigate('BroadcastNotice')}
                        accessibilityLabel="Broadcast Notice"
                    >
                        <Bell size={20} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerIconBtn}
                        onPress={handleLogout}
                        accessibilityLabel="Log out"
                    >
                        <LogOut size={20} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Subtitle bar */}
            <View style={styles.subtitleBar}>
                <View style={styles.deptPill}>
                    <Text style={styles.deptPillText} numberOfLines={1}>
                        {admin?.role ? admin.role.toUpperCase() : 'SYSTEM ADMIN'}
                    </Text>
                </View>
                <Text style={styles.dateText}>{dateString}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Menu Trigger Bar */}
                <TouchableOpacity
                    style={styles.menuTriggerBar}
                    onPress={openMenu}
                    activeOpacity={0.85}
                    accessibilityLabel="Open Menu"
                    accessibilityRole="button"
                >
                    <MenuIcon size={15} color="#1A3A6B" strokeWidth={2.5} />
                    <Text style={styles.menuTriggerBarText}>Menu</Text>
                </TouchableOpacity>

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
                        activeOpacity={0.7}
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
                        activeOpacity={0.7}
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
                        activeOpacity={0.7}
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
                        activeOpacity={0.7}
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
                        activeOpacity={0.7}
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
                        activeOpacity={0.7}
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
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#EBF8FF' }]}>
                            <FileCheck size={20} color="#2B6CB0" />
                        </View>
                        <Text style={styles.actionTitle}>Upcoming Submissions</Text>
                        <Text style={styles.actionDesc}>Track assignments and submissions</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Dropdown Menu Modal */}
            <Modal
                transparent
                visible={menuVisible}
                animationType="none"
                onRequestClose={closeMenu}
            >
                <View style={styles.menuOverlay}>
                    <TouchableOpacity
                        style={styles.menuBackdrop}
                        activeOpacity={1}
                        onPress={closeMenu}
                    />

                    <Animated.View
                        style={[
                            styles.menuDropdown,
                            {
                                opacity: menuAnim,
                                transform: [
                                    {
                                        translateY: menuAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [10, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.menuHeader}>
                            <View style={styles.menuAvatar}>
                                <Text style={styles.menuAvatarText}>{initials}</Text>
                            </View>
                            <View style={styles.menuHeaderInfo}>
                                <Text style={styles.menuAdminName} numberOfLines={1}>
                                    {admin?.name || 'Administrator'}
                                </Text>
                                <Text style={styles.menuAdminRole}>
                                    {admin?.role ? `${admin.role.toUpperCase()} PANEL` : 'SYSTEM ADMIN'}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.menuCloseBtn} onPress={closeMenu}>
                                <X size={14} color="#A0AEC0" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuDivider} />

                        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('RolesDashboard');
                                }}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: '#EDE9FE' }]}>
                                    <ShieldCheck size={16} color="#6B46C1" />
                                </View>
                                <View style={styles.menuItemContent}>
                                    <Text style={styles.menuItemLabel}>Manage Roles</Text>
                                    <Text style={styles.menuItemSub}>Create, assign & edit roles</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.menuItemDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('UserAccounts');
                                }}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: '#EBF8FF' }]}>
                                    <Users size={16} color="#3182CE" />
                                </View>
                                <View style={styles.menuItemContent}>
                                    <Text style={styles.menuItemLabel}>User Accounts</Text>
                                    <Text style={styles.menuItemSub}>Faculty & student accounts</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.menuItemDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('BroadcastNotice');
                                }}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: '#FFFFF0' }]}>
                                    <Bell size={16} color="#D69E2E" />
                                </View>
                                <View style={styles.menuItemContent}>
                                    <Text style={styles.menuItemLabel}>Broadcast Notice</Text>
                                    <Text style={styles.menuItemSub}>College-wide notices</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.menuItemDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('AuditLogs');
                                }}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: '#FAF5FF' }]}>
                                    <ShieldAlert size={16} color="#6B46C1" />
                                </View>
                                <View style={styles.menuItemContent}>
                                    <Text style={styles.menuItemLabel}>Audit Logs</Text>
                                    <Text style={styles.menuItemSub}>System activity & logs</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.menuItemDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('Reports');
                                }}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: '#FFF5F5' }]}>
                                    <FileText size={16} color="#E53E3E" />
                                </View>
                                <View style={styles.menuItemContent}>
                                    <Text style={styles.menuItemLabel}>Reports</Text>
                                    <Text style={styles.menuItemSub}>Attendance & academic logs</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.menuItemDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('AdminFeedback');
                                }}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: '#F0FFF4' }]}>
                                    <MessageSquare size={16} color="#2F855A" />
                                </View>
                                <View style={styles.menuItemContent}>
                                    <Text style={styles.menuItemLabel}>Faculty Feedback</Text>
                                    <Text style={styles.menuItemSub}>View faculty reports</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.menuItemDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('AdminSubmissions');
                                }}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: '#EBF8FF' }]}>
                                    <FileCheck size={16} color="#2B6CB0" />
                                </View>
                                <View style={styles.menuItemContent}>
                                    <Text style={styles.menuItemLabel}>Submissions</Text>
                                    <Text style={styles.menuItemSub}>Assignments & evaluations</Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity
                            style={styles.menuLogout}
                            onPress={() => {
                                closeMenu();
                                handleLogout();
                            }}
                        >
                            <LogOut size={16} color="#E53E3E" />
                            <Text style={styles.menuLogoutText}>Logout</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
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
        paddingBottom: 12,
        backgroundColor: '#0F2754',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        marginRight: 8,
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
    headerRight: {
        flexDirection: 'row',
        gap: 4,
    },
    headerIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtitleBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 14,
        backgroundColor: '#0F2754',
    },
    deptPill: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        maxWidth: '70%',
    },
    deptPillText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    dateText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    menuTriggerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignSelf: 'flex-start',
        gap: 8,
        elevation: 2,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    menuTriggerBarText: {
        fontSize: 13,
        color: '#1A3A6B',
        fontWeight: '700',
        letterSpacing: 0.2,
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
    // Menu Dropdown Styles
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    menuBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    menuDropdown: {
        position: 'absolute',
        top: 204,
        left: 16,
        width: 275,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
    },
    menuAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#1A3A6B',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    menuAvatarText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    menuHeaderInfo: {
        flex: 1,
    },
    menuAdminName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A3A6B',
    },
    menuAdminRole: {
        fontSize: 10,
        color: '#A0AEC0',
        marginTop: 1,
        fontWeight: '600',
    },
    menuCloseBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F7FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#EDF2F7',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 14,
        gap: 10,
    },
    menuItemIcon: {
        width: 32,
        height: 32,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
    },
    menuItemSub: {
        fontSize: 10,
        color: '#A0AEC0',
        marginTop: 1,
    },
    menuItemDivider: {
        height: 1,
        backgroundColor: '#F7FAFC',
        marginLeft: 56,
    },
    menuLogout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
    },
    menuLogoutText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#E53E3E',
    },
});

