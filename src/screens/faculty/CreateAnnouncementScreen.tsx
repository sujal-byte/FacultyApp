// src/screens/faculty/CreateAnnouncementScreen.tsx
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
    BookOpen,
    Calendar,
    Layers,
    Award,
    GraduationCap,
    Bell,
    Tag,
} from 'lucide-react-native';
import { announcementsApi, rolesApi, UserGroup } from '../../services/api';
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

const CATEGORIES = [
    { label: 'Academic', icon: BookOpen },
    { label: 'Event', icon: Calendar },
    { label: 'Administrative', icon: Users },
    { label: 'Department', icon: Layers },
    { label: 'Committee', icon: Users },
    { label: 'Club', icon: Award },
    { label: 'Exam', icon: GraduationCap },
    { label: 'General', icon: Bell },
];

export default function CreateAnnouncementScreen({ navigation }: any) {
    // Content state
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('Academic');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Target roles state
    const [availableRoles, setAvailableRoles] = useState<string[]>(DEFAULT_ROLES);
    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    // selectedRoles: empty array represents 'All Students' (or list of explicit role strings)
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    useEffect(() => {
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
    }, []);

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
            // Deselect specific role
            setSelectedRoles(selectedRoles.filter((r) => r !== role));
        } else {
            // Select role (automatically deselects 'All Students' because selectedRoles becomes non-empty)
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const isAllStudentsSelected = selectedRoles.length === 0;

    const handleBroadcast = async () => {
        // Validate target selection: either 'All Students' (selectedRoles is empty) or at least 1 role
        if (!isAllStudentsSelected && selectedRoles.length === 0) {
            Alert.alert('Target Audience Required', 'Please select at least one role or "All Students" before broadcasting.');
            return;
        }

        // Validate content
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for the announcement.');
            return;
        }
        if (!message.trim()) {
            Alert.alert('Missing Message', 'Please enter the message content before broadcasting.');
            return;
        }

        const targetRolesPayload = selectedRoles.length > 0 ? selectedRoles : ['All Students'];
        const targetAudienceLabel = selectedRoles.length > 0 ? selectedRoles.join(', ') : 'All Students';

        setIsSubmitting(true);
        try {
            await announcementsApi.create({
                title: title.trim(),
                message: message.trim(),
                category,
                targetAudience: targetAudienceLabel,
                targetRoles: targetRolesPayload,
                isUrgent,
            });

            Alert.alert(
                'Broadcast Successful',
                `Your announcement has been broadcasted to ${targetAudienceLabel}.`,
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
            setMessage('');
            setCategory('Academic');
            setSelectedRoles([]);
            setIsUrgent(false);
            setRoleSearchQuery('');
        } catch (error: any) {
            console.error('Error broadcasting announcement:', error);
            const status = error.response?.status;
            if (status === 401) {
                await SecureStore.deleteItemAsync('userToken');
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please log in again.',
                    [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                );
            } else {
                const errorMsg = error.response?.data?.message || 'Failed to broadcast announcement. Please try again.';
                Alert.alert('Broadcast Error', Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
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
                    <Text style={styles.headerTitle}>Create Announcement</Text>
                    <Text style={styles.headerSub}>Role-targeted student & faculty broadcast</Text>
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
                    {/* TASK 1: TARGET AUDIENCE SECTION ABOVE MAIN INPUTS */}
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
                            Select specific roles to target your broadcast or keep &quot;All Students&quot; active.
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
                        {/* Notice Title */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Notice Title *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter a clear, concise headline..."
                                placeholderTextColor="#A0AEC0"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        {/* Category Selector */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Category</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isCatActive = category === cat.label;
                                    return (
                                        <TouchableOpacity
                                            key={cat.label}
                                            style={[
                                                styles.categoryCard,
                                                isCatActive && styles.categoryCardActive,
                                            ]}
                                            onPress={() => setCategory(cat.label)}
                                            activeOpacity={0.7}
                                        >
                                            <Icon
                                                size={16}
                                                color={isCatActive ? '#FFFFFF' : '#4A5568'}
                                            />
                                            <Text
                                                style={[
                                                    styles.categoryText,
                                                    isCatActive && styles.categoryTextActive,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Message Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Message Content *</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Write the announcement details, instructions, or updates..."
                                placeholderTextColor="#A0AEC0"
                                multiline
                                textAlignVertical="top"
                                value={message}
                                onChangeText={setMessage}
                            />
                        </View>

                        {/* Urgent Toggle */}
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
                                    Mark as Urgent
                                </Text>
                                <Text style={styles.urgentDesc}>
                                    Highlights this announcement with high priority in student feeds.
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
                    onPress={handleBroadcast}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Send size={18} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.broadcastBtnText}>Broadcast Announcement</Text>
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
    textArea: {
        height: 110,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryCard: {
        width: '23%',
        minWidth: 72,
        flexGrow: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    categoryCardActive: {
        backgroundColor: '#1A3A6B',
        borderColor: '#1A3A6B',
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4A5568',
        textAlign: 'center',
    },
    categoryTextActive: {
        color: '#FFFFFF',
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
