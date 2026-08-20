// src/screens/faculty/CreateSubmissionScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Search,
    Send,
    AlertTriangle,
    Users,
    X,
    Check,
    Calendar,
    FileText,
    Layers,
    HelpCircle,
    FlaskConical,
    Tag,
    Clock,
} from 'lucide-react-native';
import { submissionsApi, rolesApi, adminApi, UserGroup, User } from '../../services/api';
import * as SecureStore from 'expo-secure-store';

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

type SubmissionType = 'assignment' | 'project' | 'quiz' | 'lab';

const TYPE_OPTIONS: { key: SubmissionType; label: string; icon: any; color: string; bg: string }[] = [
    { key: 'assignment', label: 'Assignment', icon: FileText, color: '#2B6CB0', bg: '#EBF8FF' },
    { key: 'project', label: 'Project', icon: Layers, color: '#6B46C1', bg: '#FAF5FF' },
    { key: 'quiz', label: 'Quiz', icon: HelpCircle, color: '#D69E2E', bg: '#FFFFF0' },
    { key: 'lab', label: 'Lab', icon: FlaskConical, color: '#276749', bg: '#F0FFF4' },
];

export default function CreateSubmissionScreen({ navigation, route }: any) {
    const routeFaculty = route?.params?.faculty;

    // Content state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [type, setType] = useState<SubmissionType>('assignment');
    const [isUrgent, setIsUrgent] = useState(false);
    const [facultyId, setFacultyId] = useState(routeFaculty?.id || 'FAC-2024-0042');
    const [facultyList, setFacultyList] = useState<User[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Target roles state
    const [availableRoles, setAvailableRoles] = useState<string[]>(DEFAULT_ROLES);
    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    // selectedRoles: empty array represents 'All Students' (or list of explicit role strings)
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    useEffect(() => {
        // Load dynamic roles
        rolesApi.getGroups()
            .then((res) => {
                if (res.data && Array.isArray(res.data)) {
                    const dynamicNames = res.data.map((g: UserGroup) => g.name).filter(Boolean);
                    const merged = Array.from(new Set([...DEFAULT_ROLES, ...dynamicNames]));
                    setAvailableRoles(merged);
                }
            })
            .catch((err) => {
                console.log('Using default roles fallback:', err);
            });

        // Load faculty members if needed
        adminApi.getAllUsers()
            .then((users) => {
                const faculties = (users || []).filter((u: User) => u.role === 'FACULTY');
                setFacultyList(faculties);
                if (faculties.length > 0 && !routeFaculty?.id) {
                    setFacultyId(faculties[0].id);
                }
            })
            .catch(() => {});
    }, [routeFaculty]);

    // Filtered roles based on search query
    const filteredRoles = useMemo(() => {
        const q = roleSearchQuery.trim().toLowerCase();
        if (!q) return availableRoles;
        return availableRoles.filter((r) => r.toLowerCase().includes(q));
    }, [availableRoles, roleSearchQuery]);

    // Handle 'All Students' chip press
    const handleSelectAllStudents = () => {
        setSelectedRoles([]);
    };

    // Handle specific role chip press
    const handleToggleRole = (role: string) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter((r) => r !== role));
        } else {
            // Select role (automatically deselects 'All Students')
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const isAllStudentsSelected = selectedRoles.length === 0;

    const handleBroadcastSubmission = async () => {
        // Validate target selection
        if (!isAllStudentsSelected && selectedRoles.length === 0) {
            Alert.alert('Target Audience Required', 'Please select at least one role or "All Students" before broadcasting.');
            return;
        }

        // Validate title
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for the submission task.');
            return;
        }

        // Validate due date
        if (!dueDate.trim()) {
            Alert.alert('Missing Due Date', 'Please specify a due date (e.g. 2026-08-30).');
            return;
        }

        const targetRolesPayload = selectedRoles.length > 0 ? selectedRoles : ['All Students'];
        const targetAudienceLabel = selectedRoles.length > 0 ? selectedRoles.join(', ') : 'All Students';

        setIsSubmitting(true);
        try {
            await submissionsApi.create({
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate.trim(),
                facultyId: facultyId || 'FAC-2024-0042',
                type,
                urgent: isUrgent,
                status: 'PENDING',
                targetRoles: targetRolesPayload,
            });

            Alert.alert(
                'Submission Broadcasted',
                `Your submission task "${title}" has been broadcasted to ${targetAudienceLabel}.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (navigation && navigation.canGoBack()) {
                                navigation.goBack();
                            }
                        },
                    },
                ]
            );

            // Reset form
            setTitle('');
            setDescription('');
            setDueDate('');
            setType('assignment');
            setSelectedRoles([]);
            setIsUrgent(false);
            setRoleSearchQuery('');
        } catch (error: any) {
            console.error('Error broadcasting submission:', error);
            const status = error.response?.status;
            if (status === 401) {
                await SecureStore.deleteItemAsync('userToken');
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please log in again.',
                    [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                );
            } else {
                const errorMsg = error.response?.data?.message || 'Failed to broadcast submission. Please verify date format.';
                Alert.alert('Submission Error', Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
            }
        } finally {
            setIsSubmitting(false);
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
                    <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Create Submission</Text>
                    <Text style={styles.headerSub}>Role-targeted student task assignment</Text>
                </View>
                <View style={{ width: 36 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* TASK 1: TARGET AUDIENCE SECTION ABOVE MAIN CONTENT INPUTS */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionTitleWrap}>
                                <Users size={18} color="#1A3A6B" />
                                <Text style={styles.sectionTitle}>Target Audience</Text>
                            </View>
                            <View style={[styles.audienceBadge, isAllStudentsSelected ? styles.audienceBadgeAll : styles.audienceBadgeTargeted]}>
                                <Text style={[styles.audienceBadgeText, isAllStudentsSelected ? styles.audienceBadgeTextAll : styles.audienceBadgeTextTargeted]}>
                                    {isAllStudentsSelected ? 'All Students' : `${selectedRoles.length} Selected`}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.sectionSubtitle}>
                            Select specific classes, batches, or sections to assign this submission to.
                        </Text>

                        {/* Search Bar with Search Icon */}
                        <View style={styles.searchBarContainer}>
                            <Search size={18} color="#718096" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search roles (e.g. Batch_2029, CSE-Core, CSE-J)..."
                                placeholderTextColor="#A0AEC0"
                                value={roleSearchQuery}
                                onChangeText={setRoleSearchQuery}
                                autoCapitalize="none"
                            />
                            {roleSearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setRoleSearchQuery('')}
                                    style={styles.searchClearBtn}
                                    accessibilityLabel="Clear search"
                                >
                                    <X size={16} color="#718096" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Roles Selection Chips (Wrapped Layout) */}
                        <View style={styles.chipsWrapper}>
                            {/* Default 'All Students' Chip */}
                            <TouchableOpacity
                                style={[
                                    styles.roleChip,
                                    styles.allStudentsChip,
                                    isAllStudentsSelected && styles.allStudentsChipActive,
                                ]}
                                onPress={handleSelectAllStudents}
                                activeOpacity={0.7}
                            >
                                <Users
                                    size={14}
                                    color={isAllStudentsSelected ? '#FFFFFF' : '#1A3A6B'}
                                    strokeWidth={2.5}
                                />
                                <Text
                                    style={[
                                        styles.roleChipText,
                                        isAllStudentsSelected && styles.roleChipTextActive,
                                    ]}
                                >
                                    All Students
                                </Text>
                                {isAllStudentsSelected && (
                                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                                )}
                            </TouchableOpacity>

                            {/* Filtered Dynamic/Static Role Chips */}
                            {filteredRoles.map((role) => {
                                const isSelected = selectedRoles.includes(role);
                                return (
                                    <TouchableOpacity
                                        key={role}
                                        style={[
                                            styles.roleChip,
                                            isSelected && styles.roleChipActive,
                                        ]}
                                        onPress={() => handleToggleRole(role)}
                                        activeOpacity={0.7}
                                    >
                                        <Tag
                                            size={12}
                                            color={isSelected ? '#FFFFFF' : '#718096'}
                                            strokeWidth={2}
                                        />
                                        <Text
                                            style={[
                                                styles.roleChipText,
                                                isSelected && styles.roleChipTextActive,
                                            ]}
                                        >
                                            {role}
                                        </Text>
                                        {isSelected && (
                                            <Check size={13} color="#FFFFFF" strokeWidth={3} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {filteredRoles.length === 0 && (
                            <Text style={styles.noRolesText}>
                                No roles matching &quot;{roleSearchQuery}&quot;
                            </Text>
                        )}
                    </View>

                    {/* MAIN CONTENT INPUTS */}
                    <View style={styles.sectionCard}>
                        {/* Task Title */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Task Title *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Lab Exercise 4 – Neural Networks"
                                placeholderTextColor="#A0AEC0"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        {/* Submission Category / Type */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Task Category *</Text>
                            <View style={styles.typeGrid}>
                                {TYPE_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const isTypeActive = type === opt.key;
                                    return (
                                        <TouchableOpacity
                                            key={opt.key}
                                            style={[
                                                styles.typeOptionCard,
                                                isTypeActive && { backgroundColor: opt.color, borderColor: opt.color },
                                            ]}
                                            onPress={() => setType(opt.key)}
                                            activeOpacity={0.7}
                                        >
                                            <Icon
                                                size={16}
                                                color={isTypeActive ? '#FFFFFF' : opt.color}
                                            />
                                            <Text
                                                style={[
                                                    styles.typeOptionText,
                                                    isTypeActive && styles.typeOptionTextActive,
                                                ]}
                                            >
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Description & Guidelines */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Description / Guidelines (Optional)</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Submission specifications, format guidelines, repo links..."
                                placeholderTextColor="#A0AEC0"
                                multiline
                                textAlignVertical="top"
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        {/* Due Date Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Due Date (YYYY-MM-DD) *</Text>
                            <View style={styles.dateInputContainer}>
                                <Calendar size={18} color="#718096" style={styles.inputLeadingIcon} />
                                <TextInput
                                    style={styles.dateTextInput}
                                    placeholder="e.g. 2026-08-30"
                                    placeholderTextColor="#A0AEC0"
                                    value={dueDate}
                                    onChangeText={setDueDate}
                                />
                            </View>
                        </View>

                        {/* Faculty Member Selector (if multiple available) */}
                        {facultyList.length > 1 && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Assigned Faculty Evaluator</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facultyScroll}>
                                    {facultyList.map((f) => {
                                        const isSelected = facultyId === f.id;
                                        return (
                                            <TouchableOpacity
                                                key={f.id}
                                                style={[styles.facultyChip, isSelected && styles.facultyChipActive]}
                                                onPress={() => setFacultyId(f.id)}
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
                            </View>
                        )}

                        {/* Urgent Priority Toggle */}
                        <TouchableOpacity
                            style={[
                                styles.urgentToggle,
                                isUrgent && styles.urgentToggleActive,
                            ]}
                            onPress={() => setIsUrgent(!isUrgent)}
                            activeOpacity={0.8}
                        >
                            <AlertTriangle
                                size={20}
                                color={isUrgent ? '#E53E3E' : '#A0AEC0'}
                            />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text
                                    style={[
                                        styles.urgentTitle,
                                        isUrgent && { color: '#E53E3E' },
                                    ]}
                                >
                                    Mark as Urgent Submission
                                </Text>
                                <Text style={styles.urgentDesc}>
                                    Pins this task to the urgent deadlines widget for students.
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.checkbox,
                                    isUrgent && styles.checkboxActive,
                                ]}
                            >
                                {isUrgent && <View style={styles.checkboxInner} />}
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.broadcastBtn, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleBroadcastSubmission}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Send size={18} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.broadcastBtnText}>Broadcast Submission</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0F2754',
    },
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
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerSub: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.65)',
        marginTop: 1,
    },
    scroll: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    container: {
        padding: 16,
        gap: 14,
        paddingBottom: 24,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    sectionTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 12,
    },
    audienceBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
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
        fontSize: 11,
        fontWeight: '700',
    },
    audienceBadgeTextAll: {
        color: '#2B6CB0',
    },
    audienceBadgeTextTargeted: {
        color: '#6B46C1',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#2D3748',
    },
    searchClearBtn: {
        padding: 4,
    },
    chipsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    roleChipActive: {
        backgroundColor: '#2B6CB0',
        borderColor: '#2B6CB0',
    },
    roleChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4A5568',
    },
    roleChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    allStudentsChip: {
        backgroundColor: '#EDF2F7',
        borderColor: '#CBD5E0',
    },
    allStudentsChipActive: {
        backgroundColor: '#1A3A6B',
        borderColor: '#1A3A6B',
    },
    noRolesText: {
        fontSize: 12,
        color: '#A0AEC0',
        textAlign: 'center',
        marginVertical: 10,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A3A6B',
        marginBottom: 6,
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#2D3748',
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    inputLeadingIcon: {
        marginRight: 8,
    },
    dateTextInput: {
        flex: 1,
        fontSize: 14,
        color: '#2D3748',
    },
    textArea: {
        height: 100,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeOptionCard: {
        width: '48%',
        flexGrow: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    typeOptionText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4A5568',
    },
    typeOptionTextActive: {
        color: '#FFFFFF',
    },
    facultyScroll: {
        flexDirection: 'row',
        marginTop: 4,
    },
    facultyChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
    },
    facultyChipActive: {
        backgroundColor: '#EBF8FF',
        borderColor: '#3182CE',
    },
    facultyChipName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2D3748',
    },
    facultyChipNameActive: {
        color: '#2B6CB0',
    },
    facultyChipDept: {
        fontSize: 10,
        color: '#718096',
        marginTop: 2,
    },
    facultyChipDeptActive: {
        color: '#3182CE',
    },
    urgentToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        marginTop: 4,
    },
    urgentToggleActive: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FEB2B2',
    },
    urgentTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
    },
    urgentDesc: {
        fontSize: 11,
        color: '#A0AEC0',
        marginTop: 2,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
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
    bottomBar: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    broadcastBtn: {
        flexDirection: 'row',
        backgroundColor: '#2B6CB0',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#2B6CB0',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 3,
    },
    broadcastBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});
