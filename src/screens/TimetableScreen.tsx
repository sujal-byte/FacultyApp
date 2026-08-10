// src/screens/TimetableScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, TimetableSlot } from '../types';
import { TIMETABLE } from '../data/mockData';
import { ArrowLeft, Clock, MapPin, Users, BookOpen } from 'lucide-react-native';

type TimetableNav = StackNavigationProp<RootStackParamList, 'Timetable'>;
type TimetableRoute = RouteProp<RootStackParamList, 'Timetable'>;

interface Props {
    navigation: TimetableNav;
    route: TimetableRoute;
}

const DAYS: TimetableSlot['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL: Record<TimetableSlot['day'], string> = {
    Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
    Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday',
};

const TIME_SLOTS = [
    { label: '09:20 – 10:15', start: '09:20', end: '10:15', period: 'Period 1' },
    { label: '10:15 – 11:10', start: '10:15', end: '11:10', period: 'Period 2' },
    { label: '11:10 – 11:30', start: '11:10', end: '11:30', period: 'Short Break', isBreak: true },
    { label: '11:30 – 12:25', start: '11:30', end: '12:25', period: 'Period 3' },
    { label: '12:25 – 13:20', start: '12:25', end: '13:20', period: 'Period 4' },
    { label: '13:20 – 14:05', start: '13:20', end: '14:05', period: 'Lunch Break', isBreak: true },
    { label: '14:05 – 15:00', start: '14:05', end: '15:00', period: 'Period 5' },
    { label: '15:00 – 15:55', start: '15:00', end: '15:55', period: 'Period 6' },
    { label: '15:55 – 16:50', start: '15:55', end: '16:50', period: 'Period 7' },
];

const COURSE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; badgeText: string }> = {
    CS401: { bg: '#EBF8FF', border: '#2B6CB0', text: '#1A3A6B', badge: '#2B6CB0', badgeText: '#fff' },
    CS302: { bg: '#F0FFF4', border: '#276749', text: '#1C4532', badge: '#276749', badgeText: '#fff' },
    CS501: { bg: '#FAF5FF', border: '#6B46C1', text: '#44337A', badge: '#6B46C1', badgeText: '#fff' },
    FREE: { bg: '#F7FAFC', border: '#E2E8F0', text: '#A0AEC0', badge: '#E2E8F0', badgeText: '#718096' },
};

const TYPE_LABEL: Record<string, string> = {
    lecture: 'LEC',
    lab: 'LAB',
    free: 'FREE',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TimetableScreen: React.FC<Props> = ({ navigation, route }) => {
    const { faculty } = route.params;
    const today = new Date();
    const todayIndex = today.getDay(); // 0=Sun,1=Mon...6=Sat
    const defaultDay: TimetableSlot['day'] =
        todayIndex >= 1 && todayIndex <= 6 ? DAYS[todayIndex - 1] : 'Mon';
    const [selectedDay, setSelectedDay] = useState<TimetableSlot['day']>(defaultDay);

    const daySlots = TIMETABLE.filter((s) => s.day === selectedDay);

    const getSlot = (start: string): TimetableSlot | undefined =>
        daySlots.find((s) => s.startTime === start);

    const totalClasses = daySlots.filter((s) => s.type !== 'free').length;

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
                    <Text style={styles.headerTitle}>Weekly Timetable</Text>
                    <Text style={styles.headerSub}>{faculty.name}</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.classBadge}>
                        <Text style={styles.classBadgeNum}>{totalClasses}</Text>
                        <Text style={styles.classBadgeLbl}>classes</Text>
                    </View>
                </View>
            </View>

            {/* Schedule info strip */}
            <View style={styles.infoStrip}>
                <View style={styles.infoItem}>
                    <Clock size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.infoTxt}>09:20 – 16:50</Text>
                </View>
                <View style={styles.infoDot} />
                <View style={styles.infoItem}>
                    <Text style={styles.infoTxt}>55 min / period</Text>
                </View>
                <View style={styles.infoDot} />
                <View style={styles.infoItem}>
                    <Text style={styles.infoTxt}>7 periods / day</Text>
                </View>
            </View>

            {/* Day selector tabs */}
            <View style={styles.dayTabsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dayTabs}
                >
                    {DAYS.map((day) => {
                        const isActive = day === selectedDay;
                        const isSat = day === 'Sat';
                        return (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayTab,
                                    isActive && styles.dayTabActive,
                                    isSat && !isActive && styles.dayTabSat,
                                ]}
                                onPress={() => setSelectedDay(day)}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: isActive }}
                            >
                                <Text
                                    style={[
                                        styles.dayTabTxt,
                                        isActive && styles.dayTabTxtActive,
                                        isSat && !isActive && styles.dayTabSatTxt,
                                    ]}
                                >
                                    {day}
                                </Text>
                                {day === defaultDay && !isActive && (
                                    <View style={styles.todayDot} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Timetable scroll */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Day label */}
                <View style={styles.dayLabelRow}>
                    <Text style={styles.dayLabel}>{DAY_FULL[selectedDay]}</Text>
                    {selectedDay === defaultDay && (
                        <View style={styles.todayPill}>
                            <Text style={styles.todayPillTxt}>Today</Text>
                        </View>
                    )}
                </View>

                {/* Time slots */}
                {TIME_SLOTS.map((slot, idx) => {
                    if (slot.isBreak) {
                        return (
                            <View key={idx} style={styles.breakRow}>
                                <View style={styles.breakTimeCol}>
                                    <Text style={styles.breakTime}>{slot.label}</Text>
                                </View>
                                <View style={styles.breakCard}>
                                    <Text style={styles.breakIcon}>
                                        {slot.period === 'Lunch Break' ? '🍽️' : '☕'}
                                    </Text>
                                    <Text style={styles.breakLabel}>{slot.period}</Text>
                                    <Text style={styles.breakDuration}>
                                        {slot.period === 'Lunch Break' ? '45 min' : '20 min'}
                                    </Text>
                                </View>
                            </View>
                        );
                    }

                    const entry = getSlot(slot.start);
                    const isFree = !entry || entry.type === 'free';
                    const colors = entry ? COURSE_COLORS[entry.courseCode] ?? COURSE_COLORS.FREE : COURSE_COLORS.FREE;

                    return (
                        <View key={idx} style={styles.slotRow}>
                            {/* Time column */}
                            <View style={styles.timeCol}>
                                <Text style={styles.periodLabel}>{slot.period}</Text>
                                <Text style={styles.timeLabel}>{slot.start}</Text>
                                <View style={styles.timeConnector} />
                                <Text style={styles.timeLabel}>{slot.end}</Text>
                            </View>

                            {/* Slot card */}
                            {isFree ? (
                                <View style={[styles.freeCard]}>
                                    <Text style={styles.freeTxt}>Free Period</Text>
                                </View>
                            ) : (
                                <View style={[styles.classCard, { backgroundColor: colors.bg, borderLeftColor: colors.border }]}>
                                    {/* Top row: code + type badge */}
                                    <View style={styles.cardTopRow}>
                                        <Text style={[styles.courseCode, { color: colors.text }]}>
                                            {entry!.courseCode}
                                        </Text>
                                        <View style={[styles.typeBadge, { backgroundColor: colors.badge }]}>
                                            <Text style={[styles.typeBadgeTxt, { color: colors.badgeText }]}>
                                                {TYPE_LABEL[entry!.type]}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Course name */}
                                    <Text style={[styles.courseName, { color: colors.text }]} numberOfLines={2}>
                                        {entry!.courseName}
                                    </Text>

                                    {/* Details row */}
                                    <View style={styles.cardDetailsRow}>
                                        <View style={styles.detailItem}>
                                            <MapPin size={11} color={colors.border} strokeWidth={2} />
                                            <Text style={[styles.detailTxt, { color: colors.border }]}>
                                                {entry!.room}
                                            </Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Users size={11} color={colors.border} strokeWidth={2} />
                                            <Text style={[styles.detailTxt, { color: colors.border }]}>
                                                {entry!.section}
                                            </Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Clock size={11} color={colors.border} strokeWidth={2} />
                                            <Text style={[styles.detailTxt, { color: colors.border }]}>
                                                55 min
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Summary footer */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Day Summary</Text>
                    <View style={styles.summaryRow}>
                        {[
                            { label: 'Lectures', count: daySlots.filter(s => s.type === 'lecture').length, color: '#2B6CB0' },
                            { label: 'Labs', count: daySlots.filter(s => s.type === 'lab').length, color: '#6B46C1' },
                            { label: 'Free', count: daySlots.filter(s => s.type === 'free').length, color: '#A0AEC0' },
                        ].map((item) => (
                            <View key={item.label} style={styles.summaryItem}>
                                <Text style={[styles.summaryCount, { color: item.color }]}>{item.count}</Text>
                                <Text style={styles.summaryLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0F2754' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 10,
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
    headerRight: { width: 52, alignItems: 'flex-end' },
    classBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
        alignItems: 'center',
    },
    classBadgeNum: { fontSize: 16, fontWeight: '800', color: '#fff' },
    classBadgeLbl: { fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },

    // Info strip
    infoStrip: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingBottom: 12, backgroundColor: '#0F2754', gap: 8,
    },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoTxt: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
    infoDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' },

    // Day tabs
    dayTabsWrapper: { backgroundColor: '#0F2754', paddingBottom: 0 },
    dayTabs: { paddingHorizontal: 14, gap: 6, paddingBottom: 14 },
    dayTab: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)', position: 'relative',
    },
    dayTabActive: { backgroundColor: '#C6A800' },
    dayTabSat: { backgroundColor: 'rgba(255,255,255,0.06)' },
    dayTabTxt: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.65)' },
    dayTabTxtActive: { color: '#fff' },
    dayTabSatTxt: { color: 'rgba(255,255,255,0.4)' },
    todayDot: {
        position: 'absolute', bottom: 4, left: '50%',
        width: 4, height: 4, borderRadius: 2, backgroundColor: '#C6A800',
        marginLeft: -2,
    },

    // Scroll
    scroll: { flex: 1, backgroundColor: '#F0F4F8' },
    scrollContent: { padding: 14 },
    dayLabelRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
    },
    dayLabel: { fontSize: 18, fontWeight: '800', color: '#1A3A6B' },
    todayPill: {
        backgroundColor: '#C6A800', paddingHorizontal: 10,
        paddingVertical: 3, borderRadius: 12,
    },
    todayPillTxt: { fontSize: 11, fontWeight: '700', color: '#fff' },

    // Slot row
    slotRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'stretch' },
    timeCol: {
        width: 68, alignItems: 'center', paddingTop: 4,
        paddingRight: 8, flexShrink: 0,
    },
    periodLabel: {
        fontSize: 9, fontWeight: '700', color: '#A0AEC0',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
    },
    timeLabel: { fontSize: 11, fontWeight: '700', color: '#4A5568' },
    timeConnector: {
        width: 1.5, flex: 1, backgroundColor: '#CBD5E0',
        marginVertical: 3, minHeight: 16,
    },

    // Class card
    classCard: {
        flex: 1, borderRadius: 12, padding: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6,
    },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    courseCode: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
    typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
    typeBadgeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
    courseName: { fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 8 },
    cardDetailsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    detailTxt: { fontSize: 11, fontWeight: '600' },

    // Free card
    freeCard: {
        flex: 1, borderRadius: 12, padding: 12,
        backgroundColor: '#F7FAFC', borderWidth: 1,
        borderColor: '#E2E8F0', borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center', minHeight: 52,
    },
    freeTxt: { fontSize: 12, color: '#CBD5E0', fontWeight: '600' },

    // Break row
    breakRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
    breakTimeCol: { width: 68, paddingRight: 8 },
    breakTime: { fontSize: 9, color: '#A0AEC0', fontWeight: '600', textAlign: 'center' },
    breakCard: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FFFBEB', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 1, borderColor: '#FAF089',
    },
    breakIcon: { fontSize: 16 },
    breakLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: '#744210' },
    breakDuration: { fontSize: 11, color: '#975A16', fontWeight: '600' },

    // Summary card
    summaryCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16,
        marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0',
        elevation: 2, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
    },
    summaryTitle: { fontSize: 12, fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center', gap: 2 },
    summaryCount: { fontSize: 24, fontWeight: '800' },
    summaryLabel: { fontSize: 11, color: '#A0AEC0', fontWeight: '600' },
});

export default TimetableScreen;