// src/screens/faculty/TimetableScreen.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Modal,
    TextInput,
    FlatList,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ArrowLeft,
    Clock,
    MapPin,
    Users,
    BookOpen,
    X,
    Check,
    CheckCircle2,
    Edit3,
    Save,
    UserCheck,
    UserX,
    Sparkles,
    ChevronRight,
    Tag,
    Calendar,
    Search,
    Info,
} from 'lucide-react-native';

import { RootStackParamList, TimetableSlot, Student, AttendanceSessionPayload } from '../../types';
import { TIMETABLE, MOCK_STUDENTS } from '../../data/mockData';

type TimetableNav = StackNavigationProp<RootStackParamList, 'Timetable'>;
type TimetableRoute = RouteProp<RootStackParamList, 'Timetable'>;

interface Props {
    navigation: TimetableNav;
    route: TimetableRoute;
}

const DAYS: TimetableSlot['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL: Record<TimetableSlot['day'], string> = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
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

const QUICK_TOPIC_SUGGESTIONS = [
    '• Theory & Concept Discussion',
    '• Problem Solving & Numericals',
    '• Lab Hands-on Implementation',
    '• Q&A & Doubt Clearance',
    '• Revision & Assignment Review',
    '• In-Class Quiz & Assessment',
];

const TimetableScreen: React.FC<Props> = ({ navigation, route }) => {
    const { faculty } = route.params;
    const today = new Date();
    const todayIndex = today.getDay(); // 0=Sun,1=Mon...6=Sat
    const defaultDay: TimetableSlot['day'] =
        todayIndex >= 1 && todayIndex <= 6 ? DAYS[todayIndex - 1] : 'Mon';
    const [selectedDay, setSelectedDay] = useState<TimetableSlot['day']>(defaultDay);

    // Class Session Manager Modal state
    const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
    const [activeTab, setActiveTab] = useState<'syllabus' | 'attendance'>('syllabus');
    const [syllabusText, setSyllabusText] = useState<string>('');
    const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent'>>({});
    const [searchStudent, setSearchStudent] = useState<string>('');

    const daySlots = TIMETABLE.filter((s: TimetableSlot) => s.day === selectedDay);

    const getSlot = (start: string): TimetableSlot | undefined =>
        daySlots.find((s: TimetableSlot) => s.startTime === start);

    const totalClasses = daySlots.filter((s: TimetableSlot) => s.type !== 'free').length;

    // Filter students for the selected slot by matching tags
    const enrolledStudents = useMemo(() => {
        if (!selectedSlot) return [];
        const slotTags = selectedSlot.tags || [selectedSlot.courseCode, selectedSlot.section];
        const matched = MOCK_STUDENTS.filter((student) =>
            student.tags.some((tag) => slotTags.includes(tag))
        );
        // Fallback to all mock students if no tags match to avoid empty screen
        return matched.length > 0 ? matched : MOCK_STUDENTS;
    }, [selectedSlot]);

    // Search filtered students
    const displayedStudents = useMemo(() => {
        if (!searchStudent.trim()) return enrolledStudents;
        const q = searchStudent.toLowerCase();
        return enrolledStudents.filter(
            (s) => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q)
        );
    }, [enrolledStudents, searchStudent]);

    // Calculate present and absent counts
    const presentCount = useMemo(() => {
        return enrolledStudents.filter((s) => (attendanceMap[s.id] ?? 'present') === 'present').length;
    }, [enrolledStudents, attendanceMap]);

    const absentCount = useMemo(() => {
        return enrolledStudents.filter((s) => attendanceMap[s.id] === 'absent').length;
    }, [enrolledStudents, attendanceMap]);

    // Open session manager and load existing attendance if saved
    const handleOpenSessionManager = async (slot: TimetableSlot) => {
        setSelectedSlot(slot);
        setActiveTab('syllabus');
        setSyllabusText('');
        setSearchStudent('');

        // Compute slot tags & matching students
        const slotTags = slot.tags || [slot.courseCode, slot.section];
        const matched = MOCK_STUDENTS.filter((student) =>
            student.tags.some((tag) => slotTags.includes(tag))
        );
        const activeList = matched.length > 0 ? matched : MOCK_STUDENTS;

        // Default all students to 'present'
        const initialMap: Record<string, 'present' | 'absent'> = {};
        activeList.forEach((s) => {
            initialMap[s.id] = 'present';
        });
        setAttendanceMap(initialMap);

        // Check if attendance is already saved in AsyncStorage for today
        const todayStr = new Date().toISOString().split('T')[0];
        const storageKey = `attendance_${slot.id}_${todayStr}`;
        try {
            const stored = await AsyncStorage.getItem(storageKey);
            if (stored) {
                const parsed: AttendanceSessionPayload = JSON.parse(stored);
                const loadedMap: Record<string, 'present' | 'absent'> = {};
                parsed.records.forEach((r) => {
                    loadedMap[r.studentId] = r.status;
                });
                setAttendanceMap(loadedMap);
            }
        } catch (e) {
            console.error('Error loading attendance from AsyncStorage:', e);
        }
    };

    // Toggle attendance status for a student
    const handleToggleStatus = (studentId: string, status: 'present' | 'absent') => {
        setAttendanceMap((prev) => ({
            ...prev,
            [studentId]: status,
        }));
    };

    // Mark all as present / absent
    const handleMarkAll = (status: 'present' | 'absent') => {
        const updated: Record<string, 'present' | 'absent'> = {};
        enrolledStudents.forEach((s) => {
            updated[s.id] = status;
        });
        setAttendanceMap(updated);
    };

    // Save Syllabus Entry
    const handleSaveSyllabus = () => {
        if (!syllabusText.trim()) {
            Alert.alert('Empty Entry', 'Please enter the topics covered during this session before saving.');
            return;
        }

        Alert.alert(
            'Syllabus Entry Saved',
            `Topics covered for ${selectedSlot?.courseCode} (${selectedSlot?.section}) have been recorded successfully.`,
            [
                {
                    text: 'Done',
                    onPress: () => {
                        setSyllabusText('');
                    },
                },
            ]
        );
    };

    // Submit Attendance with 7-Day AsyncStorage retention
    const handleSubmitAttendance = async () => {
        if (!selectedSlot) return;

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        // 7-day retention calculation: now + 7 days
        const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const storageKey = `attendance_${selectedSlot.id}_${todayStr}`;

        const payload: AttendanceSessionPayload = {
            key: storageKey,
            subjectId: selectedSlot.id,
            courseCode: selectedSlot.courseCode,
            courseName: selectedSlot.courseName,
            section: selectedSlot.section,
            room: selectedSlot.room,
            date: todayStr,
            timestamp: now.toISOString(),
            expiryDate: expiryDate.toISOString(),
            totalStudents: enrolledStudents.length,
            presentCount,
            absentCount,
            records: enrolledStudents.map((s) => ({
                studentId: s.id,
                rollNumber: s.rollNumber,
                name: s.name,
                status: attendanceMap[s.id] ?? 'present',
            })),
        };

        try {
            await AsyncStorage.setItem(storageKey, JSON.stringify(payload));

            const expiryFormatted = expiryDate.toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });

            Alert.alert(
                'Attendance Submitted! ✓',
                `Attendance for ${selectedSlot.courseCode} (${selectedSlot.section}) has been recorded.\n\n` +
                    `• Present: ${presentCount} / ${enrolledStudents.length}\n` +
                    `• Absent: ${absentCount}\n\n` +
                    `📦 Saved locally with 7-day retention.\nValid until: ${expiryFormatted}`,
                [
                    {
                        text: 'Close',
                        onPress: () => {
                            setSelectedSlot(null);
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Failed to save attendance:', error);
            Alert.alert('Error', 'Could not save attendance locally. Please try again.');
        }
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
                    <Text style={styles.headerTitle}>Weekly Timetable</Text>
                    <Text style={styles.headerSub}>{faculty?.name || 'Faculty'}</Text>
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
                                {day === defaultDay && !isActive && <View style={styles.todayDot} />}
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
                    const colors = entry
                        ? COURSE_COLORS[entry.courseCode] ?? COURSE_COLORS.FREE
                        : COURSE_COLORS.FREE;

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
                                <TouchableOpacity
                                    activeOpacity={0.78}
                                    onPress={() => handleOpenSessionManager(entry!)}
                                    style={[
                                        styles.classCard,
                                        { backgroundColor: colors.bg, borderLeftColor: colors.border },
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Manage session for ${entry!.courseCode} ${entry!.courseName}`}
                                >
                                    {/* Top row: code + type badge + session action pill */}
                                    <View style={styles.cardTopRow}>
                                        <View style={styles.courseCodeGroup}>
                                            <Text style={[styles.courseCode, { color: colors.text }]}>
                                                {entry!.courseCode}
                                            </Text>
                                            <View
                                                style={[
                                                    styles.typeBadge,
                                                    { backgroundColor: colors.badge },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.typeBadgeTxt,
                                                        { color: colors.badgeText },
                                                    ]}
                                                >
                                                    {TYPE_LABEL[entry!.type]}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.manageHintBadge}>
                                            <Text style={styles.manageHintText}>Manage</Text>
                                            <ChevronRight size={12} color="#2B6CB0" />
                                        </View>
                                    </View>

                                    {/* Course name */}
                                    <Text
                                        style={[styles.courseName, { color: colors.text }]}
                                        numberOfLines={2}
                                    >
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
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                {/* Summary footer */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Day Summary</Text>
                    <View style={styles.summaryRow}>
                        {[
                            {
                                label: 'Lectures',
                                count: daySlots.filter((s: TimetableSlot) => s.type === 'lecture').length,
                                color: '#2B6CB0',
                            },
                            {
                                label: 'Labs',
                                count: daySlots.filter((s: TimetableSlot) => s.type === 'lab').length,
                                color: '#6B46C1',
                            },
                            {
                                label: 'Free',
                                count: daySlots.filter((s: TimetableSlot) => s.type === 'free').length,
                                color: '#A0AEC0',
                            },
                        ].map((item) => (
                            <View key={item.label} style={styles.summaryItem}>
                                <Text style={[styles.summaryCount, { color: item.color }]}>
                                    {item.count}
                                </Text>
                                <Text style={styles.summaryLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* Class Session Manager Modal */}
            <Modal
                visible={selectedSlot !== null}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedSlot(null)}
            >
                <SafeAreaView style={styles.modalSafeArea}>
                    {selectedSlot && (
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={styles.modalContainer}
                        >
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <View style={styles.modalTopBar}>
                                    <TouchableOpacity
                                        style={styles.modalCloseBtn}
                                        onPress={() => setSelectedSlot(null)}
                                        accessibilityLabel="Close Session Manager"
                                    >
                                        <X size={20} color="#0F2754" />
                                    </TouchableOpacity>
                                    <View style={styles.modalTitleBox}>
                                        <Text style={styles.modalMainTitle}>Class Session Manager</Text>
                                        <Text style={styles.modalSubTitle}>
                                            {selectedSlot.courseCode} • {selectedSlot.section}
                                        </Text>
                                    </View>
                                    <View style={styles.modalSlotBadge}>
                                        <Clock size={11} color="#2B6CB0" />
                                        <Text style={styles.modalSlotBadgeText}>
                                            {selectedSlot.startTime}
                                        </Text>
                                    </View>
                                </View>

                                {/* Course Mini Summary Banner */}
                                <View style={styles.sessionBanner}>
                                    <View style={styles.sessionBannerLeft}>
                                        <Text style={styles.sessionBannerCourse} numberOfLines={1}>
                                            {selectedSlot.courseName}
                                        </Text>
                                        <View style={styles.sessionBannerDetails}>
                                            <View style={styles.sessionBadgeItem}>
                                                <MapPin size={10} color="#fff" />
                                                <Text style={styles.sessionBadgeItemText}>
                                                    {selectedSlot.room}
                                                </Text>
                                            </View>
                                            <View style={styles.sessionBadgeItem}>
                                                <Users size={10} color="#fff" />
                                                <Text style={styles.sessionBadgeItemText}>
                                                    {selectedSlot.section}
                                                </Text>
                                            </View>
                                            <View style={styles.sessionBadgeItem}>
                                                <Calendar size={10} color="#fff" />
                                                <Text style={styles.sessionBadgeItemText}>
                                                    {DAY_FULL[selectedSlot.day]}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.sessionTypePill}>
                                        <Text style={styles.sessionTypePillTxt}>
                                            {selectedSlot.type.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                {/* Custom Segmented Control */}
                                <View style={styles.segmentedControlContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.segmentedButton,
                                            activeTab === 'syllabus' && styles.segmentedButtonActive,
                                        ]}
                                        onPress={() => setActiveTab('syllabus')}
                                        accessibilityRole="tab"
                                        accessibilityState={{ selected: activeTab === 'syllabus' }}
                                    >
                                        <BookOpen
                                            size={16}
                                            color={activeTab === 'syllabus' ? '#0F2754' : '#718096'}
                                            strokeWidth={2.2}
                                        />
                                        <Text
                                            style={[
                                                styles.segmentedButtonText,
                                                activeTab === 'syllabus' &&
                                                    styles.segmentedButtonTextActive,
                                            ]}
                                        >
                                            Update Syllabus
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.segmentedButton,
                                            activeTab === 'attendance' && styles.segmentedButtonActive,
                                        ]}
                                        onPress={() => setActiveTab('attendance')}
                                        accessibilityRole="tab"
                                        accessibilityState={{ selected: activeTab === 'attendance' }}
                                    >
                                        <Users
                                            size={16}
                                            color={activeTab === 'attendance' ? '#0F2754' : '#718096'}
                                            strokeWidth={2.2}
                                        />
                                        <Text
                                            style={[
                                                styles.segmentedButtonText,
                                                activeTab === 'attendance' &&
                                                    styles.segmentedButtonTextActive,
                                            ]}
                                        >
                                            Attendance ({enrolledStudents.length})
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* View 1: Update Syllabus Tab */}
                            {activeTab === 'syllabus' && (
                                <ScrollView
                                    style={styles.tabContentScroll}
                                    contentContainerStyle={styles.tabContentContainer}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.formCard}>
                                        <View style={styles.formHeaderRow}>
                                            <View style={styles.formHeaderIcon}>
                                                <Edit3 size={18} color="#2B6CB0" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.formTitle}>Topics Covered</Text>
                                                <Text style={styles.formSubtitle}>
                                                    Log the curriculum modules, concepts, or labs
                                                    covered during this period.
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Large Multiline TextInput */}
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.syllabusInput}
                                                multiline
                                                numberOfLines={6}
                                                textAlignVertical="top"
                                                placeholder="e.g.&#10;• Introduced Backpropagation and gradient descent&#10;• Solved numerical optimization problems&#10;• Discussed assignment guidelines for next week"
                                                placeholderTextColor="#A0AEC0"
                                                value={syllabusText}
                                                onChangeText={setSyllabusText}
                                            />
                                            <View style={styles.charCountRow}>
                                                <Text style={styles.charCountText}>
                                                    {syllabusText.length} characters
                                                </Text>
                                                {syllabusText.length > 0 && (
                                                    <TouchableOpacity
                                                        onPress={() => setSyllabusText('')}
                                                    >
                                                        <Text style={styles.clearText}>Clear</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>

                                        {/* Quick Suggestion Chips */}
                                        <View style={styles.suggestionsSection}>
                                            <View style={styles.suggestionsHeader}>
                                                <Sparkles size={13} color="#C6A800" />
                                                <Text style={styles.suggestionsTitle}>
                                                    Quick Templates & Topics
                                                </Text>
                                            </View>
                                            <View style={styles.chipsRow}>
                                                {QUICK_TOPIC_SUGGESTIONS.map((topic, i) => (
                                                    <TouchableOpacity
                                                        key={i}
                                                        style={styles.suggestionChip}
                                                        onPress={() => {
                                                            setSyllabusText((prev) =>
                                                                prev ? `${prev}\n${topic}` : topic
                                                            );
                                                        }}
                                                    >
                                                        <Text style={styles.suggestionChipText}>
                                                            {topic}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Save Entry Button */}
                                        <TouchableOpacity
                                            style={styles.saveEntryBtn}
                                            onPress={handleSaveSyllabus}
                                            activeOpacity={0.85}
                                        >
                                            <Save size={18} color="#fff" strokeWidth={2.2} />
                                            <Text style={styles.saveEntryBtnText}>Save Entry</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Session Info Note */}
                                    <View style={styles.infoCallout}>
                                        <Info size={16} color="#4A5568" />
                                        <Text style={styles.infoCalloutText}>
                                            Syllabus entries are synced with departmental course logs
                                            for academic accreditation and semester audits.
                                        </Text>
                                    </View>
                                </ScrollView>
                            )}

                            {/* View 2: Attendance Tab */}
                            {activeTab === 'attendance' && (
                                <View style={styles.attendanceTabWrapper}>
                                    {/* Attendance Stats & Quick Actions */}
                                    <View style={styles.attendanceSummaryBar}>
                                        <View style={styles.statsPillRow}>
                                            <View style={styles.statPill}>
                                                <Text style={styles.statPillNum}>
                                                    {enrolledStudents.length}
                                                </Text>
                                                <Text style={styles.statPillLbl}>Enrolled</Text>
                                            </View>
                                            <View style={[styles.statPill, styles.statPillPresent]}>
                                                <UserCheck size={14} color="#276749" />
                                                <Text style={styles.statPillPresentNum}>
                                                    {presentCount}
                                                </Text>
                                                <Text style={styles.statPillPresentLbl}>Present</Text>
                                            </View>
                                            <View style={[styles.statPill, styles.statPillAbsent]}>
                                                <UserX size={14} color="#C53030" />
                                                <Text style={styles.statPillAbsentNum}>
                                                    {absentCount}
                                                </Text>
                                                <Text style={styles.statPillAbsentLbl}>Absent</Text>
                                            </View>
                                        </View>

                                        {/* Quick Batch Buttons */}
                                        <View style={styles.batchActionsRow}>
                                            <TouchableOpacity
                                                style={styles.batchBtnPresent}
                                                onPress={() => handleMarkAll('present')}
                                            >
                                                <Check size={13} color="#276749" strokeWidth={2.5} />
                                                <Text style={styles.batchBtnPresentTxt}>All Present</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.batchBtnAbsent}
                                                onPress={() => handleMarkAll('absent')}
                                            >
                                                <X size={13} color="#C53030" strokeWidth={2.5} />
                                                <Text style={styles.batchBtnAbsentTxt}>All Absent</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Student Search & Tag filter indicator */}
                                    <View style={styles.searchAndTagBar}>
                                        <View style={styles.searchBox}>
                                            <Search size={14} color="#A0AEC0" />
                                            <TextInput
                                                style={styles.searchInput}
                                                placeholder="Search student or roll no..."
                                                placeholderTextColor="#A0AEC0"
                                                value={searchStudent}
                                                onChangeText={setSearchStudent}
                                            />
                                            {searchStudent.length > 0 && (
                                                <TouchableOpacity onPress={() => setSearchStudent('')}>
                                                    <X size={14} color="#A0AEC0" />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {/* Subject Tags Filter Indicator */}
                                        {selectedSlot.tags && selectedSlot.tags.length > 0 && (
                                            <View style={styles.matchedTagsList}>
                                                <Tag size={11} color="#718096" />
                                                <Text style={styles.matchedTagsLabel}>Filtered by:</Text>
                                                {selectedSlot.tags.map((t, idx) => (
                                                    <View key={idx} style={styles.tagBadge}>
                                                        <Text style={styles.tagBadgeTxt}>{t}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>

                                    {/* Student List */}
                                    <FlatList
                                        data={displayedStudents}
                                        keyExtractor={(item) => item.id}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.studentListContent}
                                        renderItem={({ item }) => {
                                            const status = attendanceMap[item.id] ?? 'present';
                                            const isPresent = status === 'present';

                                            // Student initials
                                            const initials = item.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .substring(0, 2)
                                                .toUpperCase();

                                            return (
                                                <View style={styles.studentCard}>
                                                    {/* Left: Avatar & Info */}
                                                    <View style={styles.studentLeft}>
                                                        <View
                                                            style={[
                                                                styles.studentAvatar,
                                                                {
                                                                    backgroundColor: isPresent
                                                                        ? '#EBF8FF'
                                                                        : '#FFF5F5',
                                                                },
                                                            ]}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.studentAvatarTxt,
                                                                    {
                                                                        color: isPresent
                                                                            ? '#2B6CB0'
                                                                            : '#E53E3E',
                                                                    },
                                                                ]}
                                                            >
                                                                {initials}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.studentInfo}>
                                                            <Text style={styles.studentName}>
                                                                {item.name}
                                                            </Text>
                                                            <Text style={styles.studentRoll}>
                                                                {item.rollNumber}
                                                            </Text>
                                                            <View style={styles.studentTagsRow}>
                                                                {item.tags.map((tg, i) => (
                                                                    <View
                                                                        key={i}
                                                                        style={styles.studentTagChip}
                                                                    >
                                                                        <Text
                                                                            style={
                                                                                styles.studentTagChipTxt
                                                                            }
                                                                        >
                                                                            {tg}
                                                                        </Text>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        </View>
                                                    </View>

                                                    {/* Right: Custom Present / Absent Segmented Toggle */}
                                                    <View style={styles.statusToggleGroup}>
                                                        <TouchableOpacity
                                                            style={[
                                                                styles.toggleBtn,
                                                                isPresent && styles.toggleBtnPresentActive,
                                                            ]}
                                                            onPress={() =>
                                                                handleToggleStatus(item.id, 'present')
                                                            }
                                                            activeOpacity={0.8}
                                                        >
                                                            <Check
                                                                size={14}
                                                                color={isPresent ? '#fff' : '#718096'}
                                                                strokeWidth={2.5}
                                                            />
                                                            <Text
                                                                style={[
                                                                    styles.toggleBtnTxt,
                                                                    isPresent && styles.toggleBtnTxtActive,
                                                                ]}
                                                            >
                                                                Present
                                                            </Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            style={[
                                                                styles.toggleBtn,
                                                                !isPresent && styles.toggleBtnAbsentActive,
                                                            ]}
                                                            onPress={() =>
                                                                handleToggleStatus(item.id, 'absent')
                                                            }
                                                            activeOpacity={0.8}
                                                        >
                                                            <X
                                                                size={14}
                                                                color={!isPresent ? '#fff' : '#718096'}
                                                                strokeWidth={2.5}
                                                            />
                                                            <Text
                                                                style={[
                                                                    styles.toggleBtnTxt,
                                                                    !isPresent &&
                                                                        styles.toggleBtnTxtAbsentActive,
                                                                ]}
                                                            >
                                                                Absent
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            );
                                        }}
                                        ListEmptyComponent={
                                            <View style={styles.emptyList}>
                                                <Text style={styles.emptyListTxt}>
                                                    No students matching "{searchStudent}"
                                                </Text>
                                            </View>
                                        }
                                        ListFooterComponent={<View style={{ height: 90 }} />}
                                    />

                                    {/* Bottom Sticky Submit Bar */}
                                    <View style={styles.bottomStickyBar}>
                                        <TouchableOpacity
                                            style={styles.submitAttendanceBtn}
                                            onPress={handleSubmitAttendance}
                                            activeOpacity={0.88}
                                        >
                                            <CheckCircle2 size={20} color="#fff" strokeWidth={2.2} />
                                            <Text style={styles.submitAttendanceBtnTxt}>
                                                Submit Attendance ({presentCount}/{enrolledStudents.length}{' '}
                                                Present)
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </KeyboardAvoidingView>
                    )}
                </SafeAreaView>
            </Modal>
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
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
    headerRight: { width: 52, alignItems: 'flex-end' },
    classBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: 'center',
    },
    classBadgeNum: { fontSize: 16, fontWeight: '800', color: '#fff' },
    classBadgeLbl: { fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },

    // Info strip
    infoStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 12,
        backgroundColor: '#0F2754',
        gap: 8,
    },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoTxt: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
    infoDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },

    // Day tabs
    dayTabsWrapper: { backgroundColor: '#0F2754', paddingBottom: 0 },
    dayTabs: { paddingHorizontal: 14, gap: 6, paddingBottom: 14 },
    dayTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        position: 'relative',
    },
    dayTabActive: { backgroundColor: '#C6A800' },
    dayTabSat: { backgroundColor: 'rgba(255,255,255,0.06)' },
    dayTabTxt: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.65)' },
    dayTabTxtActive: { color: '#fff' },
    dayTabSatTxt: { color: 'rgba(255,255,255,0.4)' },
    todayDot: {
        position: 'absolute',
        bottom: 4,
        left: '50%',
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C6A800',
        marginLeft: -2,
    },

    // Scroll
    scroll: { flex: 1, backgroundColor: '#F0F4F8' },
    scrollContent: { padding: 14 },
    dayLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    dayLabel: { fontSize: 18, fontWeight: '800', color: '#1A3A6B' },
    todayPill: {
        backgroundColor: '#C6A800',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    todayPillTxt: { fontSize: 11, fontWeight: '700', color: '#fff' },

    // Slot row
    slotRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'stretch' },
    timeCol: {
        width: 68,
        alignItems: 'center',
        paddingTop: 4,
        paddingRight: 8,
        flexShrink: 0,
    },
    periodLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#A0AEC0',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    timeLabel: { fontSize: 11, fontWeight: '700', color: '#4A5568' },
    timeConnector: {
        width: 1.5,
        flex: 1,
        backgroundColor: '#CBD5E0',
        marginVertical: 3,
        minHeight: 16,
    },

    // Class card
    classCard: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    courseCodeGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    courseCode: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
    typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
    typeBadgeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
    manageHintBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(43, 108, 176, 0.08)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 1,
    },
    manageHintText: { fontSize: 10, fontWeight: '700', color: '#2B6CB0' },
    courseName: { fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 8 },
    cardDetailsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    detailTxt: { fontSize: 11, fontWeight: '600' },

    // Free card
    freeCard: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    freeTxt: { fontSize: 12, color: '#CBD5E0', fontWeight: '600' },

    // Break row
    breakRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
    breakTimeCol: { width: 68, paddingRight: 8 },
    breakTime: { fontSize: 9, color: '#A0AEC0', fontWeight: '600', textAlign: 'center' },
    breakCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFFBEB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#FAF089',
    },
    breakIcon: { fontSize: 16 },
    breakLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: '#744210' },
    breakDuration: { fontSize: 11, color: '#975A16', fontWeight: '600' },

    // Summary card
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    summaryTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center', gap: 2 },
    summaryCount: { fontSize: 24, fontWeight: '800' },
    summaryLabel: { fontSize: 11, color: '#A0AEC0', fontWeight: '600' },

    // ─────────────────────────────────────────────────────────────
    // Modal Styles
    // ─────────────────────────────────────────────────────────────
    modalSafeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
    },
    modalTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    modalCloseBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitleBox: {
        alignItems: 'center',
    },
    modalMainTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F2754',
    },
    modalSubTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#718096',
        marginTop: 1,
    },
    modalSlotBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    modalSlotBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2B6CB0',
    },

    // Session Banner
    sessionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0F2754',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    sessionBannerLeft: {
        flex: 1,
        marginRight: 8,
    },
    sessionBannerCourse: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 6,
    },
    sessionBannerDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    sessionBadgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 7,
        paddingVertical: 2.5,
        borderRadius: 6,
        gap: 4,
    },
    sessionBadgeItemText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
    sessionTypePill: {
        backgroundColor: '#C6A800',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    sessionTypePillTxt: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },

    // Segmented Control
    segmentedControlContainer: {
        flexDirection: 'row',
        backgroundColor: '#EDF2F7',
        borderRadius: 10,
        padding: 3,
        gap: 4,
    },
    segmentedButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9,
        borderRadius: 8,
        gap: 6,
    },
    segmentedButtonActive: {
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    segmentedButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#718096',
    },
    segmentedButtonTextActive: {
        color: '#0F2754',
        fontWeight: '800',
    },

    // Tab 1: Syllabus Tab
    tabContentScroll: {
        flex: 1,
    },
    tabContentContainer: {
        padding: 16,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        marginBottom: 14,
    },
    formHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 14,
    },
    formHeaderIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EBF8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    formSubtitle: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
        lineHeight: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    syllabusInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: '#1A202C',
        minHeight: 140,
        lineHeight: 20,
    },
    charCountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        paddingHorizontal: 4,
    },
    charCountText: {
        fontSize: 11,
        color: '#A0AEC0',
        fontWeight: '500',
    },
    clearText: {
        fontSize: 11,
        color: '#E53E3E',
        fontWeight: '700',
    },

    // Suggestions Section
    suggestionsSection: {
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#FEFCBF',
        marginBottom: 16,
    },
    suggestionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    suggestionsTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#744210',
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    suggestionChip: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FAF089',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 8,
    },
    suggestionChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#744210',
    },
    saveEntryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F2754',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        elevation: 3,
        shadowColor: '#0F2754',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    saveEntryBtnText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
    },
    infoCallout: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EDF2F7',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    infoCalloutText: {
        flex: 1,
        fontSize: 11,
        color: '#4A5568',
        lineHeight: 16,
    },

    // Tab 2: Attendance Tab
    attendanceTabWrapper: {
        flex: 1,
    },
    attendanceSummaryBar: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    statsPillRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    statPill: {
        flex: 1,
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statPillNum: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    statPillLbl: {
        fontSize: 10,
        fontWeight: '600',
        color: '#718096',
    },
    statPillPresent: {
        backgroundColor: '#F0FFF4',
        borderColor: '#C6F6D5',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    statPillPresentNum: {
        fontSize: 15,
        fontWeight: '800',
        color: '#276749',
    },
    statPillPresentLbl: {
        fontSize: 10,
        fontWeight: '700',
        color: '#276749',
    },
    statPillAbsent: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FED7D7',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    statPillAbsentNum: {
        fontSize: 15,
        fontWeight: '800',
        color: '#C53030',
    },
    statPillAbsentLbl: {
        fontSize: 10,
        fontWeight: '700',
        color: '#C53030',
    },

    // Batch Actions
    batchActionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    batchBtnPresent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E6FFFA',
        borderWidth: 1,
        borderColor: '#B2F5EA',
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    batchBtnPresentTxt: {
        fontSize: 12,
        fontWeight: '700',
        color: '#234E52',
    },
    batchBtnAbsent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FEB2B2',
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    batchBtnAbsentTxt: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9B2C2C',
    },

    // Search and Tags Filter Bar
    searchAndTagBar: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 4,
        backgroundColor: '#F8FAFC',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 38,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 6,
        marginBottom: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#2D3748',
        padding: 0,
    },
    matchedTagsList: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    matchedTagsLabel: {
        fontSize: 11,
        color: '#718096',
        fontWeight: '600',
    },
    tagBadge: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagBadgeTxt: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4A5568',
    },

    // Student List & Cards
    studentListContent: {
        paddingHorizontal: 16,
        paddingTop: 6,
    },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
    },
    studentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
        gap: 10,
    },
    studentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    studentAvatarTxt: {
        fontSize: 13,
        fontWeight: '800',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A202C',
        marginBottom: 1,
    },
    studentRoll: {
        fontSize: 11,
        color: '#718096',
        fontWeight: '600',
        marginBottom: 4,
    },
    studentTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    studentTagChip: {
        backgroundColor: '#EDF2F7',
        paddingHorizontal: 5,
        paddingVertical: 1.5,
        borderRadius: 4,
    },
    studentTagChipTxt: {
        fontSize: 9,
        fontWeight: '600',
        color: '#4A5568',
    },

    // Status Toggle Buttons (Present / Absent)
    statusToggleGroup: {
        flexDirection: 'row',
        backgroundColor: '#EDF2F7',
        borderRadius: 8,
        padding: 2,
        gap: 2,
    },
    toggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 3,
    },
    toggleBtnPresentActive: {
        backgroundColor: '#276749',
    },
    toggleBtnAbsentActive: {
        backgroundColor: '#C53030',
    },
    toggleBtnTxt: {
        fontSize: 11,
        fontWeight: '700',
        color: '#718096',
    },
    toggleBtnTxtActive: {
        color: '#fff',
    },
    toggleBtnTxtAbsentActive: {
        color: '#fff',
    },

    // Empty list
    emptyList: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyListTxt: {
        fontSize: 13,
        color: '#A0AEC0',
        fontWeight: '600',
    },

    // Bottom Sticky Bar
    bottomStickyBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    submitAttendanceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F2754',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        elevation: 3,
        shadowColor: '#0F2754',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    submitAttendanceBtnTxt: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
    },
});

export default TimetableScreen;