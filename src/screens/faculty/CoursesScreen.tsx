// src/screens/CoursesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Course } from '../../types';
import { api } from '../../services/api';
import {
    ArrowLeft,
    BookOpen,
    Users,
    MapPin,
    Award,
    Hash,
    GraduationCap,
    RefreshCw,
} from 'lucide-react-native';

type CoursesNav = StackNavigationProp<RootStackParamList, 'Courses'>;
type CoursesRoute = RouteProp<RootStackParamList, 'Courses'>;

interface Props {
    navigation: CoursesNav;
    route: CoursesRoute;
}

const COURSE_COLORS = [
    { bg: '#EBF8FF', border: '#2B6CB0', icon: '#2B6CB0', badge: '#BEE3F8', badgeText: '#1A4A7A' },
    { bg: '#F0FFF4', border: '#276749', icon: '#276749', badge: '#C6F6D5', badgeText: '#1C4532' },
    { bg: '#FAF5FF', border: '#6B46C1', icon: '#6B46C1', badge: '#E9D8FD', badgeText: '#44337A' },
];

const CoursesScreen: React.FC<Props> = ({ navigation, route }) => {
    const { faculty } = route.params || {};
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCourses = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const res = await api.get('/faculty/courses');
            setCourses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const totalStudents = courses.reduce((s: number, c: Course) => s + (c.enrolledCount || 0), 0);
    const totalCredits = courses.reduce((s: number, c: Course) => s + (c.credits || 0), 0);

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
                    <Text style={styles.headerTitle}>My Courses</Text>
                    <Text style={styles.headerSub}>{faculty?.department || 'Department'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => fetchCourses(true)}
                    accessibilityLabel="Refresh"
                >
                    <RefreshCw size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Summary strip */}
            <View style={styles.summaryStrip}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{courses.length}</Text>
                    <Text style={styles.summaryLbl}>Total Courses</Text>
                </View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{totalStudents}</Text>
                    <Text style={styles.summaryLbl}>Students</Text>
                </View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{totalCredits}</Text>
                    <Text style={styles.summaryLbl}>Credits</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1A3A6B" />
                </View>
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchCourses(true)}
                            colors={['#1A3A6B']}
                            tintColor="#1A3A6B"
                        />
                    }
                >
                    <Text style={styles.listTitle}>
                        Courses assigned to {faculty?.name || 'Faculty'}
                    </Text>

                    {courses.length === 0 ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <BookOpen size={40} color="#CBD5E0" />
                            <Text style={{ fontSize: 14, color: '#718096', marginTop: 10 }}>
                                No assigned courses found.
                            </Text>
                        </View>
                    ) : (
                        courses.map((course: Course, idx: number) => {
                            const colors = COURSE_COLORS[idx % COURSE_COLORS.length];
                            return (
                                <View
                                    key={course.id}
                                    style={[
                                        styles.courseCard,
                                        {
                                            backgroundColor: colors.bg,
                                            borderLeftColor: colors.border,
                                        },
                                    ]}
                                >
                                    {/* Top row */}
                                    <View style={styles.cardTopRow}>
                                        <View style={[styles.courseIconWrap, { backgroundColor: colors.badge }]}>
                                            <BookOpen size={20} color={colors.icon} strokeWidth={2} />
                                        </View>
                                        <View style={styles.cardTopInfo}>
                                            <View style={styles.codeRow}>
                                                <View style={[styles.codeBadge, { backgroundColor: colors.badge }]}>
                                                    <Hash size={10} color={colors.icon} strokeWidth={2.5} />
                                                    <Text style={[styles.codeBadgeText, { color: colors.badgeText }]}>
                                                        {course.code}
                                                    </Text>
                                                </View>
                                                <View style={[styles.semBadge, { backgroundColor: colors.badge }]}>
                                                    <Text style={[styles.semBadgeText, { color: colors.badgeText }]}>
                                                        {course.semester}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={[styles.courseName, { color: colors.border }]}>
                                                {course.name}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Divider */}
                                    <View style={[styles.cardDivider, { backgroundColor: colors.badge }]} />

                                    {/* Details grid */}
                                    <View style={styles.detailsGrid}>
                                        <View style={styles.detailItem}>
                                            <View style={[styles.detailIconWrap, { backgroundColor: colors.badge }]}>
                                                <Users size={13} color={colors.icon} strokeWidth={2} />
                                            </View>
                                            <View>
                                                <Text style={styles.detailValue}>{course.enrolledCount}</Text>
                                                <Text style={styles.detailLabel}>Students</Text>
                                            </View>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <View style={[styles.detailIconWrap, { backgroundColor: colors.badge }]}>
                                                <MapPin size={13} color={colors.icon} strokeWidth={2} />
                                            </View>
                                            <View>
                                                <Text style={styles.detailValue}>{course.room}</Text>
                                                <Text style={styles.detailLabel}>Room</Text>
                                            </View>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <View style={[styles.detailIconWrap, { backgroundColor: colors.badge }]}>
                                                <GraduationCap size={13} color={colors.icon} strokeWidth={2} />
                                            </View>
                                            <View>
                                                <Text style={styles.detailValue}>{course.section}</Text>
                                                <Text style={styles.detailLabel}>Section</Text>
                                            </View>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <View style={[styles.detailIconWrap, { backgroundColor: colors.badge }]}>
                                                <Award size={13} color={colors.icon} strokeWidth={2} />
                                            </View>
                                            <View>
                                                <Text style={styles.detailValue}>{course.credits}</Text>
                                                <Text style={styles.detailLabel}>Credits</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}

                    <View style={{ height: 32 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0F2754' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 12,
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
    headerSub: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 1,
        textAlign: 'center',
    },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: 'center',
    },
    countNum: { fontSize: 16, fontWeight: '800', color: '#fff' },
    countLbl: { fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },

    // Summary strip
    summaryStrip: {
        flexDirection: 'row',
        backgroundColor: '#0F2754',
        paddingHorizontal: 16,
        paddingBottom: 16,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    summaryItem: { alignItems: 'center', flex: 1 },
    summaryNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
    summaryLbl: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: 2 },
    summaryDiv: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)' },

    // Scroll
    scroll: { flex: 1, backgroundColor: '#F0F4F8' },
    scrollContent: { padding: 14 },
    listTitle: {
        fontSize: 13,
        color: '#718096',
        fontWeight: '500',
        marginBottom: 14,
        fontStyle: 'italic',
    },

    // Course card
    courseCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderLeftWidth: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
    },
    cardTopRow: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
    courseIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    cardTopInfo: { flex: 1 },
    codeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
    codeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    codeBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
    semBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    semBadgeText: { fontSize: 11, fontWeight: '700' },
    courseName: { fontSize: 15, fontWeight: '800', lineHeight: 20 },
    cardDivider: { height: 1, marginBottom: 14 },

    // Details grid
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '45%',
    },
    detailIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    detailValue: { fontSize: 13, fontWeight: '700', color: '#2D3748' },
    detailLabel: { fontSize: 10, color: '#A0AEC0', fontWeight: '600', marginTop: 1 },
});

export default CoursesScreen;