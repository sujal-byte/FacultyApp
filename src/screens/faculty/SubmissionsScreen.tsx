// src/screens/SubmissionsScreen.tsx
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
import { RootStackParamList, Submission } from '../../types';
import { api } from '../../services/api';
import {
    ArrowLeft,
    Clock,
    FileText,
    FlaskConical,
    HelpCircle,
    Layers,
    AlertTriangle,
    CheckCircle,
    BookOpen,
    RefreshCw,
} from 'lucide-react-native';

type SubmissionsNav = StackNavigationProp<RootStackParamList, 'Submissions'>;
type SubmissionsRoute = RouteProp<RootStackParamList, 'Submissions'>;

interface Props {
    navigation: SubmissionsNav;
    route: SubmissionsRoute;
}

type FilterKey = 'all' | 'urgent' | 'assignment' | 'project' | 'quiz' | 'lab';

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'assignment', label: 'Assignments' },
    { key: 'project', label: 'Projects' },
    { key: 'quiz', label: 'Quizzes' },
    { key: 'lab', label: 'Labs' },
];

const TYPE_CONFIG = {
    assignment: { Icon: FileText, color: '#2B6CB0', bg: '#EBF8FF', badgeBg: '#BEE3F8', label: 'Assignment' },
    project: { Icon: Layers, color: '#6B46C1', bg: '#FAF5FF', badgeBg: '#E9D8FD', label: 'Project' },
    quiz: { Icon: HelpCircle, color: '#D69E2E', bg: '#FFFFF0', badgeBg: '#FEFCBF', label: 'Quiz' },
    lab: { Icon: FlaskConical, color: '#276749', bg: '#F0FFF4', badgeBg: '#C6F6D5', label: 'Lab' },
};

const COURSE_COLORS: Record<string, string> = {
    CS401: '#2B6CB0',
    CS302: '#276749',
    CS501: '#6B46C1',
    IS401: '#2B6CB0',
    EC401: '#276749',
};

const SubmissionsScreen: React.FC<Props> = ({ navigation }) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

    const fetchSubmissions = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const res = await api.get('/faculty/submissions');
            setSubmissions(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Failed to load submissions:', err);
            setError('Unable to load submissions from server.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const filtered = submissions.filter((s: Submission) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'urgent') return s.urgent;
        return s.type === activeFilter;
    });

    const urgentCount = submissions.filter((s: Submission) => s.urgent).length;
    const pendingCount = submissions.filter(
        (s: Submission) => (s.submittedCount ?? 0) < (s.totalStudents ?? 60)
    ).length;
    const totalStudents = submissions.reduce((a: number, s: Submission) => a + (s.totalStudents ?? 60), 0);
    const totalSubmitted = submissions.reduce((a: number, s: Submission) => a + (s.submittedCount ?? 0), 0);
    const overallProgress = totalStudents > 0 ? Math.round((totalSubmitted / totalStudents) * 100) : 0;

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
                    <Text style={styles.headerTitle}>Submissions</Text>
                    <Text style={styles.headerSub}>All pending evaluations</Text>
                </View>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => fetchSubmissions(true)}
                    accessibilityLabel="Refresh"
                >
                    {urgentCount > 0 ? (
                        <View style={styles.urgentBadge}>
                            <Text style={styles.urgentBadgeText}>{urgentCount}</Text>
                        </View>
                    ) : (
                        <RefreshCw size={18} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Summary strip */}
            <View style={styles.summaryStrip}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{submissions.length}</Text>
                    <Text style={styles.summaryLbl}>Total</Text>
                </View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: '#FC8181' }]}>{urgentCount}</Text>
                    <Text style={styles.summaryLbl}>Urgent</Text>
                </View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: '#F6AD55' }]}>{pendingCount}</Text>
                    <Text style={styles.summaryLbl}>Pending</Text>
                </View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: '#68D391' }]}>{overallProgress}%</Text>
                    <Text style={styles.summaryLbl}>Submitted</Text>
                </View>
            </View>

            {/* Overall progress bar */}
            <View style={styles.overallProgress}>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
                </View>
                <Text style={styles.progressLabel}>
                    {totalSubmitted} of {totalStudents} students submitted overall
                </Text>
            </View>

            {/* Filter chips */}
            <View style={styles.filtersWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersRow}
                >
                    {FILTERS.map((f) => {
                        const isActive = activeFilter === f.key;
                        const count =
                            f.key === 'all'
                                ? submissions.length
                                : f.key === 'urgent'
                                ? urgentCount
                                : submissions.filter((s: Submission) => s.type === f.key).length;
                        return (
                            <TouchableOpacity
                                key={f.key}
                                style={[styles.filterChip, isActive && styles.filterChipActive]}
                                onPress={() => setActiveFilter(f.key)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                                    {f.label}
                                </Text>
                                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                                    <Text style={[styles.filterCountText, isActive && { color: '#fff' }]}>
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1A3A6B" />
                    <Text style={styles.statusText}>Loading submissions...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <AlertTriangle size={36} color="#E53E3E" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => fetchSubmissions()}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchSubmissions(true)}
                            colors={['#1A3A6B']}
                            tintColor="#1A3A6B"
                        />
                    }
                >
                    {filtered.length === 0 ? (
                        <View style={styles.emptyState}>
                            <CheckCircle size={44} color="#CBD5E0" strokeWidth={1.5} />
                            <Text style={styles.emptyTitle}>All clear!</Text>
                            <Text style={styles.emptyBody}>No submissions in this category.</Text>
                        </View>
                    ) : (
                        filtered.map((sub: Submission) => {
                            const typeKey = (sub.type || 'assignment') as keyof typeof TYPE_CONFIG;
                            const conf = TYPE_CONFIG[typeKey] || TYPE_CONFIG.assignment;
                            const TypeIcon = conf.Icon;
                            const total = sub.totalStudents ?? 60;
                            const submitted = sub.submittedCount ?? 0;
                            const progress = total > 0 ? Math.round((submitted / total) * 100) : 0;
                            const courseCode = sub.courseCode || 'CS401';
                            const courseColor = COURSE_COLORS[courseCode] ?? '#1A3A6B';
                            const notSubmitted = total - submitted;

                            return (
                                <View key={sub.id} style={styles.card}>
                                    {/* Left accent */}
                                    <View
                                        style={[
                                            styles.cardAccent,
                                            {
                                                backgroundColor: sub.urgent ? '#E53E3E' : conf.color,
                                            },
                                        ]}
                                    />

                                    <View style={styles.cardBody}>
                                        {/* Top row */}
                                        <View style={styles.cardTopRow}>
                                            <View style={[styles.typeIconWrap, { backgroundColor: conf.bg }]}>
                                                <TypeIcon size={18} color={conf.color} strokeWidth={2} />
                                            </View>
                                            <View style={styles.cardTopMeta}>
                                                <View style={styles.badgesRow}>
                                                    {/* Course badge */}
                                                    <View style={[styles.courseBadge, { backgroundColor: courseColor }]}>
                                                        <BookOpen size={9} color="#fff" strokeWidth={2.5} />
                                                        <Text style={styles.courseBadgeText}>{courseCode}</Text>
                                                    </View>
                                                    {/* Type badge */}
                                                    <View style={[styles.typeBadge, { backgroundColor: conf.badgeBg }]}>
                                                        <Text style={[styles.typeBadgeText, { color: conf.color }]}>
                                                            {conf.label}
                                                        </Text>
                                                    </View>
                                                    {/* Urgent badge */}
                                                    {sub.urgent && (
                                                        <View style={styles.urgentTag}>
                                                            <AlertTriangle size={9} color="#E53E3E" strokeWidth={2.5} />
                                                            <Text style={styles.urgentTagText}>Urgent</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>

                                        {/* Title */}
                                        <Text style={styles.cardTitle}>{sub.title}</Text>
                                        {sub.courseName ? (
                                            <Text style={styles.cardCourse}>{sub.courseName}</Text>
                                        ) : null}
                                        {sub.description ? (
                                            <Text style={styles.cardDesc} numberOfLines={2}>
                                                {sub.description}
                                            </Text>
                                        ) : null}

                                        {/* Due date */}
                                        <View style={styles.dueDateRow}>
                                            <Clock
                                                size={12}
                                                color={sub.urgent ? '#E53E3E' : '#718096'}
                                                strokeWidth={2}
                                            />
                                            <Text
                                                style={[
                                                    styles.dueDateText,
                                                    sub.urgent && styles.dueDateUrgent,
                                                ]}
                                            >
                                                Due {sub.dueDateDisplay || (sub.dueDate ? new Date(sub.dueDate).toLocaleDateString() : 'Pending')}
                                            </Text>
                                        </View>

                                        {/* Progress section */}
                                        <View style={styles.progressSection}>
                                            <View style={styles.progressLabelRow}>
                                                <Text style={styles.progressLeft}>
                                                    {submitted} submitted
                                                </Text>
                                                <Text style={styles.progressRight}>
                                                    {notSubmitted} pending · {total} total
                                                </Text>
                                            </View>
                                            <View style={styles.progressTrackCard}>
                                                <View
                                                    style={[
                                                        styles.progressFillCard,
                                                        {
                                                            width: `${progress}%`,
                                                            backgroundColor: progress >= 50 ? '#38A169' : conf.color,
                                                        },
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.progressPct}>{progress}% complete</Text>
                                        </View>

                                        {/* Students breakdown */}
                                        <View style={styles.studentsRow}>
                                            <View style={styles.studentsStat}>
                                                <View style={[styles.studentsStatDot, { backgroundColor: '#38A169' }]} />
                                                <Text style={styles.studentsStatText}>
                                                    {submitted} submitted
                                                </Text>
                                            </View>
                                            <View style={styles.studentsStat}>
                                                <View style={[styles.studentsStatDot, { backgroundColor: '#E53E3E' }]} />
                                                <Text style={styles.studentsStatText}>
                                                    {notSubmitted} not submitted
                                                </Text>
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
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
    urgentBadge: {
        backgroundColor: '#E53E3E',
        borderRadius: 10,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    urgentBadgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },

    // Summary strip
    summaryStrip: {
        flexDirection: 'row',
        backgroundColor: '#0F2754',
        paddingHorizontal: 16,
        paddingBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    summaryItem: { alignItems: 'center', flex: 1 },
    summaryNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
    summaryLbl: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: 2 },
    summaryDiv: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },

    // Overall progress
    overallProgress: {
        backgroundColor: '#0F2754',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    progressTrack: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: '#68D391',
    },
    progressLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '500',
        textAlign: 'center',
    },

    // Filters
    filtersWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
    filtersRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F7FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    filterChipActive: { backgroundColor: '#1A3A6B', borderColor: '#1A3A6B' },
    filterChipText: { fontSize: 12, fontWeight: '700', color: '#718096' },
    filterChipTextActive: { color: '#fff' },
    filterCount: {
        backgroundColor: '#E2E8F0',
        borderRadius: 8,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
    filterCountText: { fontSize: 10, fontWeight: '800', color: '#718096' },

    // Scroll
    scroll: { flex: 1, backgroundColor: '#F0F4F8' },
    scrollContent: { padding: 14, gap: 10 },

    // Card
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
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
    cardAccent: { width: 4, flexShrink: 0 },
    cardBody: { flex: 1, padding: 14 },

    cardTopRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
    typeIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    cardTopMeta: { flex: 1 },
    badgesRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
    courseBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 5,
    },
    courseBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
    typeBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
    typeBadgeText: { fontSize: 10, fontWeight: '700' },
    urgentTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FFF5F5',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#FEB2B2',
    },
    urgentTagText: { fontSize: 10, fontWeight: '700', color: '#E53E3E' },

    cardTitle: { fontSize: 14, fontWeight: '800', color: '#2D3748', lineHeight: 20, marginBottom: 2 },
    cardCourse: { fontSize: 11, color: '#718096', marginBottom: 4 },
    cardDesc: { fontSize: 12, color: '#4A5568', marginBottom: 8, lineHeight: 16 },

    dueDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
    dueDateText: { fontSize: 12, color: '#718096', fontWeight: '500' },
    dueDateUrgent: { color: '#E53E3E', fontWeight: '700' },

    // Progress
    progressSection: { marginBottom: 10 },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    progressLeft: { fontSize: 11, color: '#4A5568', fontWeight: '600' },
    progressRight: { fontSize: 11, color: '#A0AEC0' },
    progressTrackCard: {
        height: 5,
        backgroundColor: '#EDF2F7',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFillCard: { height: '100%', borderRadius: 3 },
    progressPct: { fontSize: 10, color: '#A0AEC0', fontWeight: '600', textAlign: 'right' },

    // Students row
    studentsRow: {
        flexDirection: 'row',
        gap: 14,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F7FAFC',
    },
    studentsStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    studentsStatDot: { width: 7, height: 7, borderRadius: 3.5 },
    studentsStatText: { fontSize: 11, color: '#718096', fontWeight: '500' },

    // States
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    statusText: {
        marginTop: 12,
        fontSize: 14,
        color: '#718096',
        fontWeight: '500',
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        color: '#E53E3E',
        textAlign: 'center',
        fontWeight: '600',
    },
    retryBtn: {
        marginTop: 16,
        backgroundColor: '#1A3A6B',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 10,
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#A0AEC0' },
    emptyBody: { fontSize: 13, color: '#CBD5E0', textAlign: 'center' },
});

export default SubmissionsScreen;