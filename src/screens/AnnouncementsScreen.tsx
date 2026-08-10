// src/screens/AnnouncementsScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Announcement } from '../types';
import { ANNOUNCEMENTS } from '../data/mockData';
import {
    ArrowLeft,
    Bell,
    AlertTriangle,
    CalendarDays,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Clock,
    User,
} from 'lucide-react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AnnouncementsNav = StackNavigationProp<RootStackParamList, 'Announcements'>;
type AnnouncementsRoute = RouteProp<RootStackParamList, 'Announcements'>;

interface Props {
    navigation: AnnouncementsNav;
    route: AnnouncementsRoute;
}

type TabKey = 'all' | 'important' | 'event';

const TABS: { key: TabKey; label: string; icon: any }[] = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'important', label: 'Important', icon: AlertTriangle },
    { key: 'event', label: 'Events', icon: CalendarDays },
];

// Per-category visual config
const CATEGORY_CONFIG = {
    urgent: {
        accentColor: '#E53E3E',
        accentBg: '#FFF5F5',
        badgeBg: '#FED7D7',
        badgeText: '#C53030',
        label: 'Important',
        Icon: AlertTriangle,
    },
    event: {
        accentColor: '#276749',
        accentBg: '#F0FFF4',
        badgeBg: '#C6F6D5',
        badgeText: '#22543D',
        label: 'Event',
        Icon: CalendarDays,
    },
    academic: {
        accentColor: '#B7791F',
        accentBg: '#FFFFF0',
        badgeBg: '#FEFCBF',
        badgeText: '#744210',
        label: 'Academic',
        Icon: BookOpen,
    },
    admin: {
        accentColor: '#B7791F',
        accentBg: '#FFFFF0',
        badgeBg: '#FEFCBF',
        badgeText: '#744210',
        label: 'Admin',
        Icon: BookOpen,
    },
};

// Single expandable announcement card
const AnnouncementCard: React.FC<{ item: Announcement }> = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    const config = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.academic;
    const IconComp = config.Icon;

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((v) => !v);
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: expanded ? config.accentBg : '#FFFFFF' }]}
            onPress={toggle}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            accessibilityState={{ expanded }}
        >
            {/* Left accent bar */}
            <View style={[styles.accentBar, { backgroundColor: config.accentColor }]} />

            <View style={styles.cardInner}>
                {/* Top row */}
                <View style={styles.cardTopRow}>
                    {/* Category icon circle */}
                    <View style={[styles.categoryIconCircle, { backgroundColor: config.badgeBg }]}>
                        <IconComp size={14} color={config.accentColor} strokeWidth={2.5} />
                    </View>

                    <View style={styles.cardMeta}>
                        <View style={[styles.categoryBadge, { backgroundColor: config.badgeBg }]}>
                            <Text style={[styles.categoryBadgeText, { color: config.badgeText }]}>
                                {config.label}
                            </Text>
                        </View>
                        {!item.isRead && <View style={styles.unreadDot} />}
                    </View>

                    {expanded
                        ? <ChevronUp size={16} color="#A0AEC0" strokeWidth={2} />
                        : <ChevronDown size={16} color="#A0AEC0" strokeWidth={2} />
                    }
                </View>

                {/* Title */}
                <Text
                    style={[styles.cardTitle, { color: expanded ? config.accentColor : '#2D3748' }]}
                    numberOfLines={expanded ? undefined : 2}
                >
                    {item.title}
                </Text>

                {/* Expanded body */}
                {expanded && (
                    <View style={styles.expandedBody}>
                        <Text style={styles.cardBody}>{item.body}</Text>
                        <View style={styles.cardFooter}>
                            <View style={styles.footerItem}>
                                <User size={11} color="#A0AEC0" strokeWidth={2} />
                                <Text style={styles.footerText}>{item.postedBy}</Text>
                            </View>
                            <View style={styles.footerItem}>
                                <Clock size={11} color="#A0AEC0" strokeWidth={2} />
                                <Text style={styles.footerText}>{item.postedDate}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Collapsed footer (always visible) */}
                {!expanded && (
                    <View style={styles.collapsedFooter}>
                        <Text style={styles.footerText} numberOfLines={1}>
                            {item.postedBy}
                        </Text>
                        <Text style={styles.footerText}>{item.postedDate}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const AnnouncementsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { faculty } = route.params;
    const [activeTab, setActiveTab] = useState<TabKey>('all');

    const filtered = ANNOUNCEMENTS.filter((a) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'important') return a.category === 'urgent';
        if (activeTab === 'event') return a.category === 'event';
        return true;
    });

    const unreadCount = ANNOUNCEMENTS.filter((a) => !a.isRead).length;
    const importantCount = ANNOUNCEMENTS.filter((a) => a.category === 'urgent').length;
    const eventCount = ANNOUNCEMENTS.filter((a) => a.category === 'event').length;

    const tabCount: Record<TabKey, number> = {
        all: ANNOUNCEMENTS.length,
        important: importantCount,
        event: eventCount,
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <ArrowLeft size={22} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Announcements</Text>
                    <Text style={styles.headerSub}>
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </Text>
                </View>
                {/* Unread badge */}
                <View style={styles.headerRight}>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Summary strip */}
            <View style={styles.summaryStrip}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{ANNOUNCEMENTS.length}</Text>
                    <Text style={styles.summaryLbl}>Total</Text>
                </View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: '#FC8181' }]}>{importantCount}</Text>
                    <Text style={styles.summaryLbl}>Important</Text>
                </View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: '#68D391' }]}>{eventCount}</Text>
                    <Text style={styles.summaryLbl}>Events</Text>
                </View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: '#F6E05E' }]}>
                        {ANNOUNCEMENTS.filter(a => a.category === 'academic').length}
                    </Text>
                    <Text style={styles.summaryLbl}>Academic</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsRow}>
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const TabIcon = tab.icon;
                    const activeColors: Record<TabKey, string> = {
                        all: '#1A3A6B',
                        important: '#E53E3E',
                        event: '#276749',
                    };
                    const color = isActive ? activeColors[tab.key] : '#A0AEC0';
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                isActive && styles.tabActive,
                                isActive && { borderBottomColor: activeColors[tab.key] },
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}
                        >
                            <TabIcon size={15} color={color} strokeWidth={2} />
                            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
                            <View style={[
                                styles.tabCountBadge,
                                isActive && { backgroundColor: activeColors[tab.key] }
                            ]}>
                                <Text style={[
                                    styles.tabCountText,
                                    isActive && { color: '#fff' }
                                ]}>
                                    {tabCount[tab.key]}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Bell size={40} color="#CBD5E0" strokeWidth={1.5} />
                        <Text style={styles.emptyTitle}>No announcements</Text>
                        <Text style={styles.emptyBody}>Nothing here in this category right now.</Text>
                    </View>
                ) : (
                    filtered.map((item) => (
                        <AnnouncementCard key={item.id} item={item} />
                    ))
                )}
                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0F2754' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12,
        backgroundColor: '#0F2754',
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
    headerRight: { width: 38, alignItems: 'flex-end' },
    unreadBadge: {
        backgroundColor: '#E53E3E', borderRadius: 10,
        minWidth: 22, height: 22,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 5,
    },
    unreadBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },

    // Summary strip
    summaryStrip: {
        flexDirection: 'row', backgroundColor: '#0F2754',
        paddingHorizontal: 16, paddingBottom: 14,
        alignItems: 'center', justifyContent: 'space-around',
    },
    summaryItem: { alignItems: 'center', flex: 1 },
    summaryNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
    summaryLbl: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: 1 },
    summaryDiv: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },

    // Tabs
    tabsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 5,
        paddingVertical: 13,
        borderBottomWidth: 2.5, borderBottomColor: 'transparent',
    },
    tabActive: {},
    tabLabel: { fontSize: 12, fontWeight: '700' },
    tabCountBadge: {
        backgroundColor: '#EDF2F7', borderRadius: 10,
        minWidth: 18, height: 18,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 5,
    },
    tabCountText: { fontSize: 10, fontWeight: '800', color: '#718096' },

    // Scroll
    scroll: { flex: 1, backgroundColor: '#F0F4F8' },
    scrollContent: { padding: 14, gap: 10 },

    // Card
    card: {
        flexDirection: 'row',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    accentBar: { width: 4, flexShrink: 0 },
    cardInner: { flex: 1, padding: 14 },
    cardTopRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: 8, marginBottom: 8,
    },
    categoryIconCircle: {
        width: 28, height: 28, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    cardMeta: {
        flex: 1, flexDirection: 'row',
        alignItems: 'center', gap: 6,
    },
    categoryBadge: {
        paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6,
    },
    categoryBadgeText: { fontSize: 10, fontWeight: '700' },
    unreadDot: {
        width: 7, height: 7, borderRadius: 3.5,
        backgroundColor: '#1A3A6B',
    },
    cardTitle: {
        fontSize: 13, fontWeight: '700',
        lineHeight: 19, marginBottom: 6,
    },

    // Expanded
    expandedBody: { marginTop: 4 },
    cardBody: {
        fontSize: 13, color: '#4A5568',
        lineHeight: 20, marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row', gap: 14,
        paddingTop: 10, borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
    },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { fontSize: 11, color: '#A0AEC0', fontWeight: '500' },

    // Collapsed footer
    collapsedFooter: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 2,
    },

    // Empty state
    emptyState: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 60, gap: 10,
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#A0AEC0' },
    emptyBody: { fontSize: 13, color: '#CBD5E0', textAlign: 'center' },
});

export default AnnouncementsScreen;