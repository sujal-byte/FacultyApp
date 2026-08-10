// src/screens/DashboardScreen.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    Modal,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { UPCOMING_SUBMISSIONS, ANNOUNCEMENTS } from '../data/mockData';
import DashboardCard from '../components/DashboardCard';
import SubmissionItem from '../components/SubmissionItem';
import CalendarModal from '../components/CalendarModal';
import {
    Bell,
    BookOpen,
    Calendar,
    CalendarCheck,
    ChevronRight,
    HelpCircle,
    LayoutGrid,
    LogOut,
    MessageSquare,
    User,
    MoreVertical,
    CalendarDays,
    FileText,
    GraduationCap,
    X,
    Menu as MenuIcon,
} from 'lucide-react-native';

type DashboardNav = StackNavigationProp<RootStackParamList, 'Dashboard'>;
type DashboardRoute = RouteProp<RootStackParamList, 'Dashboard'>;

interface Props {
    navigation: DashboardNav;
    route: DashboardRoute;
}

const DashboardScreen: React.FC<Props> = ({ navigation, route }) => {
    const { faculty } = route.params;
    const [showCalModal, setShowCalModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const unreadCount = ANNOUNCEMENTS.filter((a) => !a.isRead).length;

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise((r) => setTimeout(r, 1200));
        setRefreshing(false);
    };

    const handleLogout = () => {
        navigation.replace('Login');
    };

    const today = new Date();
    const greeting = today.getHours() < 12
        ? 'Good Morning'
        : today.getHours() < 17
            ? 'Good Afternoon'
            : 'Good Evening';

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateString = `${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

    const [menuVisible, setMenuVisible] = useState(false);
    const menuAnim = useRef(new Animated.Value(0)).current;

    const openMenu = () => {
        setMenuVisible(true);
        Animated.timing(menuAnim, {
            toValue: 1, duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0, duration: 160,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(() => setMenuVisible(false));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            {/* Top Header */}
            <View style={styles.topHeader}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {faculty.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.greetingText}>{greeting},</Text>
                        <Text style={styles.facultyName} numberOfLines={1}>
                            {faculty.name}
                        </Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    {/* Calendar Button */}
                    <TouchableOpacity
                        style={styles.headerIconBtn}
                        onPress={() => setShowCalModal(true)}
                        accessibilityLabel="Open calendar"
                    >
                        <Calendar size={20} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>

                    {/* Notifications */}
                    <TouchableOpacity
                        style={styles.headerIconBtn}
                        onPress={() => navigation.navigate('Announcements', { faculty })}
                        accessibilityLabel="Notifications"
                    >
                        <Bell size={20} color="#FFFFFF" strokeWidth={2} />
                        {unreadCount > 0 && (
                            <View style={styles.notifDot}>
                                <Text style={styles.notifDotText}>{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Logout */}
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
                        {faculty.department}
                    </Text>
                </View>
                <Text style={styles.dateText}>{dateString}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A3A6B" />
                }
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

                {/* Quick Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statChip}>
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Courses</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statChip}>
                        <Text style={styles.statNumber}>165</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statChip}>
                        <Text style={[styles.statNumber, { color: '#E53E3E' }]}>4</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statChip}>
                        <Text style={styles.statNumber}>18h</Text>
                        <Text style={styles.statLabel}>This Week</Text>
                    </View>
                </View>

                {/* ── Section 1: Three Main Cards ── */}
                <View style={styles.sectionHeader}>
                    <LayoutGrid size={16} color="#1A3A6B" strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                </View>

                <View style={styles.cardsGrid}>
                    <DashboardCard
                        title="Announcements"
                        Icon={Bell}
                        iconColor="#D69E2E"
                        iconBg="#FFFFF0"
                        badgeCount={unreadCount}
                        subtitle="2 unread"
                        onPress={() => navigation.navigate('Announcements', { faculty })}
                    />
                    <DashboardCard
                        title="Mapping of Courses"
                        Icon={BookOpen}
                        iconColor="#2B6CB0"
                        iconBg="#EBF8FF"
                        subtitle="3 active"
                        onPress={() =>
                            console.log('Navigate to Course Mapping — wire up with Stack.Screen')
                        }
                    />
                    <DashboardCard
                        title="Timetable"
                        Icon={CalendarCheck}
                        iconColor="#276749"
                        iconBg="#F0FFF4"
                        subtitle="6 slots/week"
                        onPress={() => navigation.navigate('Timetable', { faculty })}
                    />
                </View>

                {/* ── Section 2: Upcoming Submissions (Highlighted) ── */}
                <View style={styles.submissionsCard}>
                    {/* Card Header */}
                    <View style={styles.submissionsHeader}>
                        <View style={styles.submissionsHeaderLeft}>
                            <View style={styles.submissionsIconWrap}>
                                <MessageSquare size={18} color="#FFFFFF" strokeWidth={2} />
                            </View>
                            <View>
                                <Text style={styles.submissionsTitle}>Upcoming Submissions</Text>
                                <Text style={styles.submissionsSubtitle}>
                                    {UPCOMING_SUBMISSIONS.length} pending across all courses
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.seeAllBtn}
                            accessibilityRole="button"
                            accessibilityLabel="See all submissions"
                        >
                            <Text style={styles.seeAllText}>All</Text>
                            <ChevronRight size={14} color="#1A3A6B" />
                        </TouchableOpacity>
                    </View>

                    {/* Urgent Banner */}
                    <View style={styles.urgentBanner}>
                        <Text style={styles.urgentBannerIcon}>⚠️</Text>
                        <Text style={styles.urgentBannerText}>
                            {UPCOMING_SUBMISSIONS.filter((s) => s.urgent).length} submissions due within 3 days
                        </Text>
                    </View>

                    {/* Submission List */}
                    <View style={styles.submissionsList}>
                        {UPCOMING_SUBMISSIONS.map((sub) => (
                            <SubmissionItem key={sub.id} submission={sub} />
                        ))}
                    </View>
                </View>

                {/* ── Section 3: Recent Announcements Preview ── */}
                <View style={styles.announcementsPreview}>
                    <View style={styles.sectionHeader}>
                        <Bell size={16} color="#1A3A6B" strokeWidth={2} />
                        <Text style={styles.sectionTitle}>Recent Announcements</Text>
                    </View>

                    {ANNOUNCEMENTS.slice(0, 2).map((ann) => (
                        <View key={ann.id} style={styles.annItem}>
                            <View
                                style={[
                                    styles.annCategoryDot,
                                    {
                                        backgroundColor:
                                            ann.category === 'urgent'
                                                ? '#E53E3E'
                                                : ann.category === 'event'
                                                    ? '#6B46C1'
                                                    : '#2B6CB0',
                                    },
                                ]}
                            />
                            <View style={styles.annContent}>
                                <Text style={styles.annTitle} numberOfLines={2}>
                                    {ann.title}
                                </Text>
                                <Text style={styles.annMeta}>
                                    {ann.postedBy} · {ann.postedDate}
                                </Text>
                            </View>
                            {!ann.isRead && <View style={styles.unreadDot} />}
                        </View>
                    ))}
                </View>

                {/* Bottom padding for FAB */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Floating Action Button — Feedback */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Feedback', { facultyId: faculty.id })}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Open Feedback and Help"
            >
                <HelpCircle size={26} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>

            <CalendarModal
                visible={showCalModal}
                onClose={() => setShowCalModal(false)}
            />

            <Modal
                transparent
                visible={menuVisible}
                animationType="none"
            >
                <View style={styles.menuOverlay}>
                    {/* Backdrop: tap anywhere to close */}
                    <TouchableOpacity
                        style={styles.menuBackdrop}
                        activeOpacity={1}
                        onPress={closeMenu}
                    />

                    {/* Menu content */}
                    <Animated.View
                        style={[styles.menuDropdown, {
                            opacity: menuAnim,
                            transform: [{ translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
                        }]}
                    >
                        {/* Header */}
                        <View style={styles.menuHeader}>
                            <View style={styles.menuAvatar}>
                                <Text style={styles.menuAvatarText}>
                                    {faculty.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                </Text>
                            </View>
                            <View style={styles.menuHeaderInfo}>
                                <Text style={styles.menuFacultyName} numberOfLines={1}>{faculty.name}</Text>
                                <Text style={styles.menuFacultyDept}>{faculty.department}</Text>
                            </View>
                            <TouchableOpacity style={styles.menuCloseBtn} onPress={closeMenu}>
                                <X size={14} color="#A0AEC0" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuDivider} />

                        {/* Menu Item 1: Timetable */}
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            closeMenu();
                            navigation.navigate('Timetable', { faculty });
                        }}>
                            <View style={styles.menuItemIcon}>
                                <CalendarDays size={16} color="#3182CE" />
                            </View>
                            <View style={styles.menuItemContent}>
                                <Text style={styles.menuItemLabel}>My Timetable</Text>
                                <Text style={styles.menuItemSub}>View schedule & classes</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.menuItemDivider} />

                        {/* Menu Item 2: Announcements */}
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            closeMenu();
                            navigation.navigate('Announcements', { faculty });
                        }}>
                            <View style={styles.menuItemIcon}>
                                <Bell size={16} color="#3182CE" />
                            </View>
                            <View style={styles.menuItemContent}>
                                <Text style={styles.menuItemLabel}>Announcements</Text>
                                <Text style={styles.menuItemSub}>Academic & Admin updates</Text>
                            </View>
                            {unreadCount > 0 && (
                                <View style={styles.menuItemBadge}>
                                    <Text style={styles.menuItemBadgeText}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.menuItemDivider} />

                        {/* Menu Item 3: Feedback */}
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            closeMenu();
                            navigation.navigate('Feedback', { facultyId: faculty.id });
                        }}>
                            <View style={styles.menuItemIcon}>
                                <MessageSquare size={16} color="#3182CE" />
                            </View>
                            <View style={styles.menuItemContent}>
                                <Text style={styles.menuItemLabel}>Report Issue</Text>
                                <Text style={styles.menuItemSub}>Feedback & Support</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        {/* Logout */}
                        <TouchableOpacity style={styles.menuLogout} onPress={() => {
                            closeMenu();
                            handleLogout();
                        }}>
                            <LogOut size={16} color="#E53E3E" />
                            <Text style={styles.menuLogoutText}>Logout</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
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
        backgroundColor: '#C6A800',
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
    facultyName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
        maxWidth: 180,
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
        position: 'relative',
    },
    notifDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#E53E3E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#0F2754',
    },
    notifDotText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#FFFFFF',
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
    // Quick Stats
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
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
    // Section Headers
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A3A6B',
        letterSpacing: 0.1,
    },
    // Cards Grid
    cardsGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    // Submissions Highlighted Card
    submissionsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    submissionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#1A3A6B',
    },
    submissionsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    submissionsIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submissionsTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    submissionsSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.65)',
        marginTop: 1,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 2,
    },
    seeAllText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1A3A6B',
    },
    urgentBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFF5F5',
        borderBottomWidth: 1,
        borderBottomColor: '#FED7D7',
    },
    urgentBannerIcon: {
        fontSize: 14,
    },
    urgentBannerText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#C53030',
    },
    submissionsList: {
        padding: 12,
    },
    // Announcements preview
    announcementsPreview: {
        marginBottom: 8,
    },
    annItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        gap: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    annCategoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 5,
        flexShrink: 0,
    },
    annContent: {
        flex: 1,
    },
    annTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
        lineHeight: 18,
        marginBottom: 4,
    },
    annMeta: {
        fontSize: 11,
        color: '#A0AEC0',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1A3A6B',
        marginTop: 5,
        flexShrink: 0,
    },
    // FAB
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#C6A800',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#C6A800',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },

    // ── Three-dot menu ──
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
    menuOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
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
        top: 204,   // sits just below the menu trigger bar (offset for ScrollView paddingTop and blue header)
        left: 16,
        width: 270,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        transformOrigin: 'top left',
    },
    menuHeader: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14, gap: 10,
    },
    menuAvatar: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#1A3A6B',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    menuAvatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },
    menuHeaderInfo: { flex: 1 },
    menuFacultyName: { fontSize: 13, fontWeight: '700', color: '#1A3A6B' },
    menuFacultyDept: { fontSize: 10, color: '#A0AEC0', marginTop: 1 },
    menuCloseBtn: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#F7FAFC',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    menuDivider: { height: 1, backgroundColor: '#EDF2F7' },
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 11, paddingHorizontal: 14, gap: 10,
    },
    menuItemIcon: {
        width: 32, height: 32, borderRadius: 9,
        backgroundColor: '#EBF8FF',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    menuItemContent: { flex: 1 },
    menuItemLabel: { fontSize: 13, fontWeight: '700', color: '#2D3748' },
    menuItemSub: { fontSize: 10, color: '#A0AEC0', marginTop: 1 },
    menuItemBadge: {
        backgroundColor: '#E53E3E', borderRadius: 9,
        minWidth: 18, height: 18,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 5,
    },
    menuItemBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
    menuItemDivider: { height: 1, backgroundColor: '#F7FAFC', marginLeft: 56 },
    menuLogout: {
        flexDirection: 'row', alignItems: 'center',
        gap: 10, padding: 14,
    },
    menuLogoutText: { fontSize: 13, fontWeight: '700', color: '#E53E3E' },
});

export default DashboardScreen;