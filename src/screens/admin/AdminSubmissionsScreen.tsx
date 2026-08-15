import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Search,
    Plus,
    Calendar,
    User as UserIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    FileCheck,
    X,
} from 'lucide-react-native';
import { adminApi, submissionsApi, SubmissionItem, User } from '../../services/api';

export default function AdminSubmissionsScreen({ navigation }: any) {
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [facultyList, setFacultyList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

    // Modal state for assigning a new task
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        dueDate: '',
        facultyId: '',
        status: 'PENDING' as 'PENDING' | 'SUBMITTED' | 'OVERDUE',
    });

    const loadData = async () => {
        try {
            const [subRes, usersRes] = await Promise.all([
                submissionsApi.getAll(),
                adminApi.getAllUsers().catch(() => [] as User[]),
            ]);
            setSubmissions(subRes.data || []);
            const faculties = (usersRes || []).filter((u: User) => u.role === 'FACULTY');
            setFacultyList(faculties);
            if (faculties.length > 0 && !newTask.facultyId) {
                setNewTask((prev) => ({ ...prev, facultyId: faculties[0].id }));
            }
        } catch (error) {
            console.error('Failed to load submissions:', error);
            Alert.alert('Error', 'Unable to fetch submissions from server.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleCreateTask = async () => {
        if (!newTask.title.trim()) {
            Alert.alert('Validation Error', 'Please enter a task title.');
            return;
        }
        if (!newTask.facultyId) {
            Alert.alert('Validation Error', 'Please select a faculty member.');
            return;
        }
        if (!newTask.dueDate.trim()) {
            Alert.alert('Validation Error', 'Please specify a due date (e.g. 2026-08-25).');
            return;
        }

        setIsSubmitting(true);
        try {
            await adminApi.createSubmission({
                title: newTask.title.trim(),
                description: newTask.description.trim() || undefined,
                dueDate: newTask.dueDate.trim(),
                facultyId: newTask.facultyId,
                status: newTask.status,
            });

            Alert.alert('Success', 'Task assigned successfully!');
            setModalVisible(false);
            setNewTask({
                title: '',
                description: '',
                dueDate: '',
                facultyId: facultyList.length > 0 ? facultyList[0].id : '',
                status: 'PENDING',
            });
            loadData();
        } catch (error: any) {
            console.error('Failed to create task:', error);
            const msg = error.response?.data?.message || 'Failed to assign task. Please verify date format.';
            Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No due date';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'SUBMITTED':
                return {
                    label: 'SUBMITTED',
                    color: '#2F855A',
                    bg: '#F0FFF4',
                    border: '#9AE6B4',
                    icon: CheckCircle2,
                };
            case 'OVERDUE':
                return {
                    label: 'OVERDUE',
                    color: '#E53E3E',
                    bg: '#FFF5F5',
                    border: '#FEB2B2',
                    icon: AlertCircle,
                };
            case 'PENDING':
            default:
                return {
                    label: 'PENDING',
                    color: '#D69E2E',
                    bg: '#FFFFF0',
                    border: '#FBD38D',
                    icon: Clock,
                };
        }
    };

    const filteredSubmissions = submissions.filter((sub) => {
        const matchesStatus =
            selectedStatus === 'ALL' || sub.status === selectedStatus;
        const q = searchQuery.toLowerCase();
        const matchesQuery =
            !q ||
            sub.title.toLowerCase().includes(q) ||
            (sub.description && sub.description.toLowerCase().includes(q)) ||
            (sub.faculty?.name && sub.faculty.name.toLowerCase().includes(q)) ||
            (sub.faculty?.department && sub.faculty.department.toLowerCase().includes(q)) ||
            (sub.faculty?.usn && sub.faculty.usn.toLowerCase().includes(q));

        return matchesStatus && matchesQuery;
    });

    const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;
    const submittedCount = submissions.filter((s) => s.status === 'SUBMITTED').length;
    const overdueCount = submissions.filter((s) => s.status === 'OVERDUE').length;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Top Navigation Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerTitleWrap}>
                    <Text style={styles.headerTitle}>Upcoming Submissions</Text>
                    <Text style={styles.headerSub}>Admin Task & Submission Monitor</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setModalVisible(true)}
                >
                    <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={18} color="#718096" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search task title, description, faculty..."
                        placeholderTextColor="#A0AEC0"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={16} color="#718096" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Tabs with Badges */}
                <View style={styles.filterRow}>
                    <TouchableOpacity
                        style={[styles.filterTab, selectedStatus === 'ALL' && styles.filterTabActive]}
                        onPress={() => setSelectedStatus('ALL')}
                    >
                        <Text style={[styles.filterTabText, selectedStatus === 'ALL' && styles.filterTabTextActive]}>
                            All ({submissions.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterTab, selectedStatus === 'PENDING' && styles.filterTabActive]}
                        onPress={() => setSelectedStatus('PENDING')}
                    >
                        <Text style={[styles.filterTabText, selectedStatus === 'PENDING' && styles.filterTabTextActive]}>
                            Pending ({pendingCount})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterTab, selectedStatus === 'SUBMITTED' && styles.filterTabActive]}
                        onPress={() => setSelectedStatus('SUBMITTED')}
                    >
                        <Text style={[styles.filterTabText, selectedStatus === 'SUBMITTED' && styles.filterTabTextActive]}>
                            Submitted ({submittedCount})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterTab, selectedStatus === 'OVERDUE' && styles.filterTabActive]}
                        onPress={() => setSelectedStatus('OVERDUE')}
                    >
                        <Text style={[styles.filterTabText, selectedStatus === 'OVERDUE' && styles.filterTabTextActive]}>
                            Overdue ({overdueCount})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Submissions List */}
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#1A3A6B" />
                        <Text style={styles.loadingText}>Loading submissions...</Text>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A3A6B']} />
                        }
                    >
                        <Text style={styles.resultCount}>
                            Showing {filteredSubmissions.length} of {submissions.length} tasks
                        </Text>

                        {filteredSubmissions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <FileCheck size={48} color="#CBD5E0" />
                                <Text style={styles.emptyStateTitle}>No submissions found</Text>
                                <Text style={styles.emptyStateText}>
                                    {searchQuery ? 'Try adjusting your search filters.' : 'Tap "+" to assign a task to faculty.'}
                                </Text>
                            </View>
                        ) : (
                            filteredSubmissions.map((sub) => {
                                const statusConfig = getStatusConfig(sub.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <View key={sub.id} style={styles.card}>
                                        <View style={[styles.cardAccent, { backgroundColor: statusConfig.color }]} />
                                        <View style={styles.cardContent}>
                                            {/* Top Row: Title & Status Badge */}
                                            <View style={styles.cardTopRow}>
                                                <Text style={styles.cardTitle} numberOfLines={2}>
                                                    {sub.title}
                                                </Text>
                                                <View
                                                    style={[
                                                        styles.statusBadge,
                                                        {
                                                            backgroundColor: statusConfig.bg,
                                                            borderColor: statusConfig.border,
                                                        },
                                                    ]}
                                                >
                                                    <StatusIcon size={12} color={statusConfig.color} />
                                                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                                        {statusConfig.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Description if present */}
                                            {sub.description ? (
                                                <Text style={styles.cardDesc} numberOfLines={2}>
                                                    {sub.description}
                                                </Text>
                                            ) : null}

                                            {/* Assigned Faculty Details */}
                                            <View style={styles.facultyRow}>
                                                <View style={styles.facultyIconWrap}>
                                                    <UserIcon size={14} color="#3182CE" />
                                                </View>
                                                <View style={styles.facultyInfo}>
                                                    <Text style={styles.facultyName}>
                                                        {sub.faculty?.name || 'Assigned Faculty'}
                                                    </Text>
                                                    <Text style={styles.facultySub}>
                                                        {sub.faculty?.department || 'Department'} • {sub.faculty?.usn || sub.faculty?.email || 'ID'}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Due Date & Meta Row */}
                                            <View style={styles.cardBottomRow}>
                                                <View style={styles.metaItem}>
                                                    <Calendar size={13} color="#718096" />
                                                    <Text style={styles.metaText}>
                                                        Due: <Text style={styles.metaBold}>{formatDate(sub.dueDate)}</Text>
                                                    </Text>
                                                </View>
                                                {sub.createdAt && (
                                                    <View style={styles.metaItem}>
                                                        <Clock size={12} color="#A0AEC0" />
                                                        <Text style={styles.dateSubText}>
                                                            Created {formatDate(sub.createdAt)}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                )}
            </View>

            {/* ASSIGN TASK MODAL */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Assign Task</Text>
                                <Text style={styles.modalSub}>Create a new submission requirement for faculty</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#4A5568" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                            <Text style={styles.label}>Task Title *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Mid-Term Grades Submission"
                                placeholderTextColor="#A0AEC0"
                                value={newTask.title}
                                onChangeText={(t) => setNewTask({ ...newTask, title: t })}
                            />

                            <Text style={styles.label}>Assign to Faculty *</Text>
                            {facultyList.length === 0 ? (
                                <Text style={styles.helperText}>No faculty members found.</Text>
                            ) : (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facultyChipsScroll}>
                                    {facultyList.map((f) => {
                                        const isSelected = newTask.facultyId === f.id;
                                        return (
                                            <TouchableOpacity
                                                key={f.id}
                                                style={[styles.facultyChip, isSelected && styles.facultyChipActive]}
                                                onPress={() => setNewTask({ ...newTask, facultyId: f.id })}
                                            >
                                                <Text style={[styles.facultyChipName, isSelected && styles.facultyChipNameActive]}>
                                                    {f.name}
                                                </Text>
                                                <Text style={[styles.facultyChipDept, isSelected && styles.facultyChipDeptActive]}>
                                                    {f.department || 'Faculty'}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            )}

                            <Text style={styles.label}>Description / Instructions (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Details about this submission or deadlines..."
                                placeholderTextColor="#A0AEC0"
                                multiline
                                numberOfLines={3}
                                value={newTask.description}
                                onChangeText={(t) => setNewTask({ ...newTask, description: t })}
                            />

                            <Text style={styles.label}>Due Date (YYYY-MM-DD) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 2026-08-30"
                                placeholderTextColor="#A0AEC0"
                                value={newTask.dueDate}
                                onChangeText={(t) => setNewTask({ ...newTask, dueDate: t })}
                            />

                            <Text style={styles.label}>Initial Status</Text>
                            <View style={styles.statusSelector}>
                                {(['PENDING', 'SUBMITTED', 'OVERDUE'] as const).map((st) => (
                                    <TouchableOpacity
                                        key={st}
                                        style={[styles.statusOption, newTask.status === st && styles.statusOptionActive]}
                                        onPress={() => setNewTask({ ...newTask, status: st })}
                                    >
                                        <Text style={[styles.statusOptionText, newTask.status === st && styles.statusOptionTextActive]}>
                                            {st}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                                onPress={handleCreateTask}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Assign Task</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0F2754' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0F2754',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleWrap: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2B6CB0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
    loadingText: { marginTop: 10, color: '#718096', fontSize: 13, fontWeight: '600' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 46,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 13, color: '#2D3748' },
    filterRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTabActive: { backgroundColor: '#1A3A6B' },
    filterTabText: { fontSize: 11, fontWeight: '700', color: '#4A5568' },
    filterTabTextActive: { color: '#FFFFFF' },
    listContainer: { paddingBottom: 30 },
    resultCount: {
        fontSize: 11,
        fontWeight: '700',
        color: '#718096',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    emptyState: { padding: 30, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    emptyStateTitle: { fontSize: 16, fontWeight: '700', color: '#718096', marginTop: 12 },
    emptyStateText: { fontSize: 12, color: '#A0AEC0', textAlign: 'center', marginTop: 4 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        overflow: 'hidden',
    },
    cardAccent: { width: 5 },
    cardContent: { flex: 1, padding: 14 },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 6,
    },
    cardTitle: { fontSize: 14, fontWeight: '800', color: '#1A3A6B', flex: 1 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
    cardDesc: { fontSize: 12, color: '#4A5568', lineHeight: 16, marginBottom: 10 },
    facultyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 10,
        gap: 8,
    },
    facultyIconWrap: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#EBF8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    facultyInfo: { flex: 1 },
    facultyName: { fontSize: 12, fontWeight: '700', color: '#2D3748' },
    facultySub: { fontSize: 10, color: '#718096', marginTop: 1 },
    cardBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
    },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11, color: '#718096' },
    metaBold: { fontWeight: '700', color: '#2D3748' },
    dateSubText: { fontSize: 10, color: '#A0AEC0' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
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
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A3A6B' },
    modalSub: { fontSize: 11, color: '#718096', marginTop: 2 },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4A5568',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#2D3748',
    },
    textArea: { height: 75, textAlignVertical: 'top' },
    facultyChipsScroll: { flexDirection: 'row', marginBottom: 4 },
    facultyChip: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginRight: 8,
    },
    facultyChipActive: { backgroundColor: '#2B6CB0', borderColor: '#2B6CB0' },
    facultyChipName: { fontSize: 12, fontWeight: '700', color: '#2D3748' },
    facultyChipNameActive: { color: '#FFF' },
    facultyChipDept: { fontSize: 10, color: '#718096', marginTop: 2 },
    facultyChipDeptActive: { color: 'rgba(255,255,255,0.8)' },
    helperText: { fontSize: 11, color: '#A0AEC0', fontStyle: 'italic' },
    statusSelector: { flexDirection: 'row', gap: 8 },
    statusOption: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    statusOptionActive: { backgroundColor: '#3182CE', borderColor: '#3182CE' },
    statusOptionText: { fontSize: 11, fontWeight: '700', color: '#4A5568' },
    statusOptionTextActive: { color: '#FFF' },
    submitBtn: {
        backgroundColor: '#2B6CB0',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});
