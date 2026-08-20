// src/screens/SubmissionsScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Submission } from '../../types';
import { api, rolesApi, submissionsApi, UserGroup } from '../../services/api';
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
    X,
    Calendar,
    Users,
    Plus,
    Search,
    Send,
    Tag,
    Check,
} from 'lucide-react-native';

const DEFAULT_ROLES = [
    'Batch_2029',
    'Batch_2028',
    'Batch_2027',
    'Batch_2026',
    'Batch_2025',
    'CSE-Core',
    'CSE-J',
    'CSE-A',
    'CSE-B',
    'CSE-C',
    'IT-A',
    'AIML-A',
    'CS401',
    'CS302',
    'CS501',
    'HOD - Computer Science',
    'Exam Cell Coordinator',
    'Placement Cell',
    'AI & Robotics Club',
];

type SubmissionsNav = StackNavigationProp<RootStackParamList, 'Submissions'>;
type SubmissionsRoute = RouteProp<RootStackParamList, 'Submissions'>;

interface Props {
    navigation: SubmissionsNav;
    route: SubmissionsRoute;
}

type FilterKey = 'all' | 'urgent' | 'assignment' | 'project' | 'quiz' | 'lab';
type CategoryType = 'assignment' | 'project' | 'quiz' | 'lab';

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'assignment', label: 'Assignments' },
    { key: 'project', label: 'Projects' },
    { key: 'quiz', label: 'Quizzes' },
    { key: 'lab', label: 'Labs' },
];

const TYPE_CONFIG: Record<CategoryType, { Icon: any; color: string; bg: string; badgeBg: string; label: string }> = {
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

const SubmissionsScreen: React.FC<Props> = ({ navigation, route }) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    // Broadcast submission modal state
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        dueDate: '',
        type: 'assignment' as CategoryType,
        urgent: false,
    });

    // Target roles state
    const [availableRoles, setAvailableRoles] = useState<string[]>(DEFAULT_ROLES);
    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

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
        rolesApi.getGroups()
            .then((res) => {
                if (res.data && Array.isArray(res.data)) {
                    const dynamicNames = res.data.map((g: UserGroup) => g.name).filter(Boolean);
                    const merged = Array.from(new Set([...DEFAULT_ROLES, ...dynamicNames]));
                    setAvailableRoles(merged);
                }
            })
            .catch(() => {});
    }, [fetchSubmissions]);

    // Filtered roles based on search query
    const filteredRoles = useMemo(() => {
        const q = roleSearchQuery.trim().toLowerCase();
        if (!q) return availableRoles;
        return availableRoles.filter((r) => r.toLowerCase().includes(q));
    }, [availableRoles, roleSearchQuery]);

    const isAllStudentsSelected = selectedRoles.length === 0;

    const handleSelectAllStudents = () => {
        setSelectedRoles([]);
    };

    const handleToggleRole = (role: string) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter((r) => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const handleBroadcastSubmission = async () => {
        if (!isAllStudentsSelected && selectedRoles.length === 0) {
            Alert.alert('Target Audience Required', 'Please select at least one role or "All Students" before broadcasting.');
            return;
        }

        if (!newTask.title.trim()) {
            Alert.alert('Validation Error', 'Please enter a title for the submission task.');
            return;
        }

        if (!newTask.dueDate.trim()) {
            Alert.alert('Validation Error', 'Please specify a due date (e.g. 2026-08-30).');
            return;
        }

        const targetRolesPayload = selectedRoles.length > 0 ? selectedRoles : ['All Students'];
        const targetAudienceLabel = selectedRoles.length > 0 ? selectedRoles.join(', ') : 'All Students';

        setIsSubmitting(true);
        try {
            await submissionsApi.create({
                title: newTask.title.trim(),
                description: newTask.description.trim() || undefined,
                dueDate: newTask.dueDate.trim(),
                facultyId: route?.params?.faculty?.id || 'FAC-2024-0042',
                type: newTask.type,
                urgent: newTask.urgent,
                status: 'PENDING',
                targetRoles: targetRolesPayload,
            });

            Alert.alert('Success', `Submission requirement broadcasted to ${targetAudienceLabel}!`);
            setIsCreateModalVisible(false);
            setNewTask({
                title: '',
                description: '',
                dueDate: '',
                type: 'assignment',
                urgent: false,
            });
            setSelectedRoles([]);
            setRoleSearchQuery('');
            fetchSubmissions(true);
        } catch (error: any) {
            console.error('Error broadcasting submission:', error);
            const msg = error.response?.data?.message || 'Failed to broadcast submission. Please verify date format.';
            Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <View style={styles.headerRightActions}>
                    <TouchableOpacity
                        style={styles.headerBtn}
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
                    <TouchableOpacity
                        style={[styles.headerBtn, styles.headerAddBtn]}
                        onPress={() => setIsCreateModalVisible(true)}
                        accessibilityLabel="Broadcast New Submission"
                    >
                        <Plus size={18} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
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
                                <TouchableOpacity
                                    key={sub.id}
                                    style={styles.card}
                                    onPress={() => setSelectedSubmission(sub)}
                                    activeOpacity={0.85}
                                >
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
                                </TouchableOpacity>
                            );
                        })
                    )}
                    <View style={{ height: 32 }} />
                </ScrollView>
            )}

            {/* Submission Detail Modal */}
            <Modal
                visible={selectedSubmission !== null}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedSubmission(null)}
            >
                <SafeAreaView style={styles.detailSafeArea}>
                    <View style={styles.detailContainer}>
                        {/* Header: Close Icon on Top Left */}
                        <View style={styles.detailHeader}>
                            <TouchableOpacity
                                style={styles.detailCloseBtn}
                                onPress={() => setSelectedSubmission(null)}
                                accessibilityLabel="Close modal"
                            >
                                <X size={22} color="#0F2754" />
                            </TouchableOpacity>
                            <Text style={styles.detailHeaderTitle}>Submission Details</Text>
                            <View style={{ width: 38 }} />
                        </View>

                        {selectedSubmission && (() => {
                            const typeKey = (selectedSubmission.type || 'assignment') as keyof typeof TYPE_CONFIG;
                            const conf = TYPE_CONFIG[typeKey] || TYPE_CONFIG.assignment;
                            const total = selectedSubmission.totalStudents ?? 60;
                            const submitted = selectedSubmission.submittedCount ?? 0;
                            const progress = total > 0 ? Math.round((submitted / total) * 100) : 0;
                            const courseCode = selectedSubmission.courseCode || 'CS401';
                            const courseColor = COURSE_COLORS[courseCode] ?? '#1A3A6B';
                            const notSubmitted = total - submitted;

                            return (
                                <ScrollView
                                    style={styles.detailScroll}
                                    contentContainerStyle={styles.detailContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {/* Badges Row */}
                                    <View style={styles.detailBadgesRow}>
                                        <View style={[styles.courseBadge, { backgroundColor: courseColor, paddingHorizontal: 9, paddingVertical: 4 }]}>
                                            <BookOpen size={11} color="#fff" strokeWidth={2.5} />
                                            <Text style={[styles.courseBadgeText, { fontSize: 11 }]}>{courseCode}</Text>
                                        </View>
                                        <View style={[styles.typeBadge, { backgroundColor: conf.badgeBg, paddingHorizontal: 9, paddingVertical: 4 }]}>
                                            <Text style={[styles.typeBadgeText, { color: conf.color, fontSize: 11 }]}>
                                                {conf.label}
                                            </Text>
                                        </View>
                                        {selectedSubmission.urgent && (
                                            <View style={[styles.urgentTag, { paddingHorizontal: 9, paddingVertical: 4 }]}>
                                                <AlertTriangle size={11} color="#E53E3E" strokeWidth={2.5} />
                                                <Text style={[styles.urgentTagText, { fontSize: 11 }]}>Urgent</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Title & Course */}
                                    <Text style={styles.detailTitle}>{selectedSubmission.title}</Text>
                                    {selectedSubmission.courseName ? (
                                        <Text style={styles.detailSubtitle}>{selectedSubmission.courseName}</Text>
                                    ) : null}

                                    {/* Due Date Card */}
                                    <View style={[styles.detailDueCard, selectedSubmission.urgent && styles.detailDueCardUrgent]}>
                                        <Clock size={18} color={selectedSubmission.urgent ? '#E53E3E' : '#2B6CB0'} strokeWidth={2} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.detailDueLabel}>Due Date</Text>
                                            <Text style={[styles.detailDueValue, selectedSubmission.urgent && { color: '#E53E3E' }]}>
                                                {selectedSubmission.dueDateDisplay ||
                                                    (selectedSubmission.dueDate
                                                        ? new Date(selectedSubmission.dueDate).toLocaleDateString(undefined, {
                                                              weekday: 'short',
                                                              year: 'numeric',
                                                              month: 'short',
                                                              day: 'numeric',
                                                          })
                                                        : 'Pending')}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Description Section */}
                                    <View style={styles.detailSectionBox}>
                                        <Text style={styles.detailSectionHeading}>Description</Text>
                                        <Text style={styles.detailDescText}>
                                            {selectedSubmission.description || 'No detailed instructions provided for this task.'}
                                        </Text>
                                    </View>

                                    {/* Evaluation Progress Section */}
                                    <View style={styles.detailSectionBox}>
                                        <Text style={styles.detailSectionHeading}>Submission Progress</Text>
                                        <View style={styles.progressLabelRow}>
                                            <Text style={styles.progressLeft}>{submitted} of {total} Students</Text>
                                            <Text style={styles.progressRight}>{progress}% Complete</Text>
                                        </View>
                                        <View style={styles.detailProgressTrack}>
                                            <View
                                                style={[
                                                    styles.detailProgressFill,
                                                    {
                                                        width: `${progress}%`,
                                                        backgroundColor: progress >= 50 ? '#38A169' : conf.color,
                                                    },
                                                ]}
                                            />
                                        </View>

                                        <View style={styles.detailStatsGrid}>
                                            <View style={styles.detailStatBox}>
                                                <Text style={[styles.detailStatNum, { color: '#38A169' }]}>{submitted}</Text>
                                                <Text style={styles.detailStatLbl}>Submitted</Text>
                                            </View>
                                            <View style={styles.detailStatBox}>
                                                <Text style={[styles.detailStatNum, { color: '#E53E3E' }]}>{notSubmitted}</Text>
                                                <Text style={styles.detailStatLbl}>Pending</Text>
                                            </View>
                                            <View style={styles.detailStatBox}>
                                                <Text style={[styles.detailStatNum, { color: '#2B6CB0' }]}>{total}</Text>
                                                <Text style={styles.detailStatLbl}>Total Class</Text>
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>
                            );
                        })()}

                        {/* Bottom 'Acknowledge Task' Button */}
                        <View style={styles.detailFooter}>
                            <TouchableOpacity
                                style={styles.acknowledgeBtn}
                                onPress={() => {
                                    Alert.alert('Success', 'Task acknowledged.');
                                    setSelectedSubmission(null);
                                }}
                                activeOpacity={0.85}
                            >
                                <CheckCircle size={20} color="#FFFFFF" />
                                <Text style={styles.acknowledgeBtnText}>Acknowledge Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>

            {/* Floating Action Button (FAB) for Broadcasting Submissions */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsCreateModalVisible(true)}
                activeOpacity={0.85}
                accessibilityLabel="Broadcast New Submission"
            >
                <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>

            {/* BROADCAST / CREATE SUBMISSION MODAL */}
            <Modal
                visible={isCreateModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsCreateModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Broadcast Submission</Text>
                                <Text style={styles.modalSub}>Create a submission requirement with role targeting</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                                <X size={24} color="#4A5568" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
                            {/* Target Audience Section with Searchable Role Selector */}
                            <View style={styles.modalAudienceSection}>
                                <View style={styles.modalAudienceHeader}>
                                    <View style={styles.modalAudienceTitleWrap}>
                                        <Users size={16} color="#1A3A6B" />
                                        <Text style={styles.modalAudienceTitle}>Target Audience</Text>
                                    </View>
                                    <View style={[styles.audienceBadge, isAllStudentsSelected ? styles.audienceBadgeAll : styles.audienceBadgeTargeted]}>
                                        <Text style={[styles.audienceBadgeText, isAllStudentsSelected ? styles.audienceBadgeTextAll : styles.audienceBadgeTextTargeted]}>
                                            {isAllStudentsSelected ? 'All Students' : `${selectedRoles.length} Selected`}
                                        </Text>
                                    </View>
                                </View>

                                {/* Search Bar */}
                                <View style={styles.modalSearchBar}>
                                    <Search size={16} color="#718096" style={{ marginRight: 6 }} />
                                    <TextInput
                                        style={styles.modalSearchInput}
                                        placeholder="Search roles (e.g. Batch_2029, CSE-Core)..."
                                        placeholderTextColor="#A0AEC0"
                                        value={roleSearchQuery}
                                        onChangeText={setRoleSearchQuery}
                                        autoCapitalize="none"
                                    />
                                    {roleSearchQuery.length > 0 && (
                                        <TouchableOpacity onPress={() => setRoleSearchQuery('')}>
                                            <X size={14} color="#718096" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Roles Chips */}
                                <View style={styles.modalChipsWrap}>
                                    {/* 'All Students' Chip */}
                                    <TouchableOpacity
                                        style={[
                                            styles.modalRoleChip,
                                            styles.allStudentsChip,
                                            isAllStudentsSelected && styles.allStudentsChipActive,
                                        ]}
                                        onPress={handleSelectAllStudents}
                                        activeOpacity={0.7}
                                    >
                                        <Users
                                            size={12}
                                            color={isAllStudentsSelected ? '#FFFFFF' : '#1A3A6B'}
                                            strokeWidth={2.5}
                                        />
                                        <Text
                                            style={[
                                                styles.modalRoleChipText,
                                                isAllStudentsSelected && styles.modalRoleChipTextActive,
                                            ]}
                                        >
                                            All Students
                                        </Text>
                                        {isAllStudentsSelected && (
                                            <Check size={12} color="#FFFFFF" strokeWidth={3} />
                                        )}
                                    </TouchableOpacity>

                                    {/* Filtered Role Chips */}
                                    {filteredRoles.map((role) => {
                                        const isSelected = selectedRoles.includes(role);
                                        return (
                                            <TouchableOpacity
                                                key={role}
                                                style={[
                                                    styles.modalRoleChip,
                                                    isSelected && styles.modalRoleChipActive,
                                                ]}
                                                onPress={() => handleToggleRole(role)}
                                                activeOpacity={0.7}
                                            >
                                                <Tag
                                                    size={11}
                                                    color={isSelected ? '#FFFFFF' : '#718096'}
                                                    strokeWidth={2}
                                                />
                                                <Text
                                                    style={[
                                                        styles.modalRoleChipText,
                                                        isSelected && styles.modalRoleChipTextActive,
                                                    ]}
                                                >
                                                    {role}
                                                </Text>
                                                {isSelected && (
                                                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Task Title */}
                            <Text style={styles.inputLabel}>Task Title *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Lab Exercise 4 – Neural Networks"
                                placeholderTextColor="#A0AEC0"
                                value={newTask.title}
                                onChangeText={(t) => setNewTask({ ...newTask, title: t })}
                            />

                            {/* Submission Category */}
                            <Text style={styles.inputLabel}>Task Category *</Text>
                            <View style={styles.categoryGridModal}>
                                {(['assignment', 'project', 'quiz', 'lab'] as CategoryType[]).map((catKey) => {
                                    const conf = TYPE_CONFIG[catKey];
                                    const Icon = conf.Icon;
                                    const isSelected = newTask.type === catKey;
                                    return (
                                        <TouchableOpacity
                                            key={catKey}
                                            style={[
                                                styles.catOptionModal,
                                                isSelected && { backgroundColor: conf.color, borderColor: conf.color },
                                            ]}
                                            onPress={() => setNewTask({ ...newTask, type: catKey })}
                                        >
                                            <Icon size={16} color={isSelected ? '#FFFFFF' : conf.color} />
                                            <Text
                                                style={[
                                                    styles.catOptionModalText,
                                                    isSelected ? { color: '#FFFFFF' } : { color: '#4A5568' },
                                                ]}
                                            >
                                                {conf.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Due Date */}
                            <Text style={styles.inputLabel}>Due Date (YYYY-MM-DD) *</Text>
                            <View style={styles.dateInputContainer}>
                                <Calendar size={16} color="#718096" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.dateTextInput}
                                    placeholder="e.g. 2026-08-30"
                                    placeholderTextColor="#A0AEC0"
                                    value={newTask.dueDate}
                                    onChangeText={(t) => setNewTask({ ...newTask, dueDate: t })}
                                />
                            </View>

                            {/* Description */}
                            <Text style={styles.inputLabel}>Description / Guidelines (Optional)</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Details about this submission, format specs, rubric..."
                                placeholderTextColor="#A0AEC0"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                value={newTask.description}
                                onChangeText={(t) => setNewTask({ ...newTask, description: t })}
                            />

                            {/* Urgent Priority Toggle */}
                            <TouchableOpacity
                                style={[styles.urgentToggle, newTask.urgent && styles.urgentToggleActive]}
                                onPress={() => setNewTask({ ...newTask, urgent: !newTask.urgent })}
                                activeOpacity={0.8}
                            >
                                <AlertTriangle size={18} color={newTask.urgent ? '#E53E3E' : '#A0AEC0'} />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={[styles.urgentToggleTitle, newTask.urgent && { color: '#E53E3E' }]}>
                                        Mark as Urgent Submission
                                    </Text>
                                    <Text style={styles.urgentToggleSub}>Pins this task to student priority widgets</Text>
                                </View>
                                <View style={[styles.checkbox, newTask.urgent && styles.checkboxActive]}>
                                    {newTask.urgent && <View style={styles.checkboxInner} />}
                                </View>
                            </TouchableOpacity>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                                onPress={handleBroadcastSubmission}
                                disabled={isSubmitting}
                                activeOpacity={0.85}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Send size={16} color="#fff" strokeWidth={2.5} />
                                        <Text style={styles.submitBtnText}>Broadcast Submission</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
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
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAddBtn: {
        backgroundColor: '#2B6CB0',
    },
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

    // Detail Modal Styles
    detailSafeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    detailContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    detailCloseBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F0F4F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailHeaderTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F2754',
    },
    detailScroll: { flex: 1 },
    detailContent: { padding: 20 },
    detailBadgesRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A3A6B',
        lineHeight: 28,
        marginBottom: 4,
    },
    detailSubtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#718096',
        marginBottom: 16,
    },
    detailDueCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#EBF8FF',
        borderWidth: 1,
        borderColor: '#BEE3F8',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    detailDueCardUrgent: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FEB2B2',
    },
    detailDueLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#718096',
        textTransform: 'uppercase',
    },
    detailDueValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2B6CB0',
        marginTop: 2,
    },
    detailSectionBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    detailSectionHeading: {
        fontSize: 12,
        fontWeight: '700',
        color: '#A0AEC0',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    detailDescText: {
        fontSize: 14,
        color: '#2D3748',
        lineHeight: 22,
    },
    detailProgressTrack: {
        height: 8,
        backgroundColor: '#EDF2F7',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 16,
    },
    detailProgressFill: {
        height: '100%',
        borderRadius: 4,
    },
    detailStatsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 12,
    },
    detailStatBox: {
        alignItems: 'center',
        flex: 1,
    },
    detailStatNum: {
        fontSize: 18,
        fontWeight: '800',
    },
    detailStatLbl: {
        fontSize: 11,
        fontWeight: '600',
        color: '#718096',
        marginTop: 2,
    },
    detailFooter: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    acknowledgeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#0F2754',
        borderRadius: 12,
        paddingVertical: 15,
        elevation: 2,
        shadowColor: '#0F2754',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    acknowledgeBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },

    // FAB Styles
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2B6CB0',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },

    // Broadcast Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F2754',
    },
    modalSub: {
        fontSize: 11,
        color: '#718096',
        marginTop: 2,
    },

    // Target Audience Section
    modalAudienceSection: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 10,
    },
    modalAudienceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    modalAudienceTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    modalAudienceTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    audienceBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    audienceBadgeAll: {
        backgroundColor: '#EBF8FF',
        borderWidth: 1,
        borderColor: '#BEE3F8',
    },
    audienceBadgeTargeted: {
        backgroundColor: '#FAF5FF',
        borderWidth: 1,
        borderColor: '#E9D8FD',
    },
    audienceBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    audienceBadgeTextAll: {
        color: '#2B6CB0',
    },
    audienceBadgeTextTargeted: {
        color: '#6B46C1',
    },
    modalSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 38,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 8,
    },
    modalSearchInput: {
        flex: 1,
        fontSize: 12,
        color: '#2D3748',
    },
    modalChipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    modalRoleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modalRoleChipActive: {
        backgroundColor: '#2B6CB0',
        borderColor: '#2B6CB0',
    },
    modalRoleChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4A5568',
    },
    modalRoleChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    allStudentsChip: {
        backgroundColor: '#EDF2F7',
        borderColor: '#CBD5E0',
    },
    allStudentsChipActive: {
        backgroundColor: '#0F2754',
        borderColor: '#0F2754',
    },

    // Form inputs
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4A5568',
        marginBottom: 6,
        marginTop: 10,
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 12,
        fontSize: 13,
        color: '#2D3748',
    },
    textArea: {
        height: 75,
        textAlignVertical: 'top',
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
    },
    dateTextInput: {
        flex: 1,
        fontSize: 13,
        color: '#2D3748',
    },

    // Category Grid Modal
    categoryGridModal: {
        flexDirection: 'row',
        gap: 8,
    },
    catOptionModal: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    catOptionModalText: {
        fontSize: 11,
        fontWeight: '700',
    },

    // Urgent Toggle
    urgentToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
    },
    urgentToggleActive: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FEB2B2',
    },
    urgentToggleTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
    },
    urgentToggleSub: {
        fontSize: 10,
        color: '#718096',
        marginTop: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#CBD5E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        borderColor: '#E53E3E',
    },
    checkboxInner: {
        width: 10,
        height: 10,
        borderRadius: 2,
        backgroundColor: '#E53E3E',
    },

    // Submit button
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2B6CB0',
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 18,
        marginBottom: 16,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});

export default SubmissionsScreen;