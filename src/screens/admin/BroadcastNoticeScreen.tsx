import { ActivityIndicator } from 'react-native';
import { announcementsApi } from '../../services/api';
import * as SecureStore from 'expo-secure-store';
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, AlertTriangle, Users, BookOpen, Calendar, Layers, Award, GraduationCap, Bell, Tag, Search, X, Check } from 'lucide-react-native';
import { rolesApi, UserGroup } from '../../services/api';

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

export default function BroadcastNoticeScreen({ navigation }: any) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('Academic');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    // Target roles state
    const [availableRoles, setAvailableRoles] = useState<string[]>(DEFAULT_ROLES);
    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const categories = [
        { label: 'Academic', icon: BookOpen },
        { label: 'Event', icon: Calendar },
        { label: 'Administrative', icon: Users },
        { label: 'Department', icon: Layers },
        { label: 'Committee', icon: Users },
        { label: 'Club', icon: Award },
        { label: 'Exam', icon: GraduationCap },
        { label: 'General', icon: Bell },
    ];

    useEffect(() => {
        rolesApi.getGroups()
            .then((res) => {
                if (res.data && Array.isArray(res.data)) {
                    const groupCats = res.data.map((g: UserGroup) => g.category).filter(Boolean);
                    const uniqueExtra = Array.from(new Set(groupCats)).filter(
                        (c) => !categories.some((cat) => cat.label.toLowerCase() === (c as string).toLowerCase())
                    ) as string[];
                    setCustomCategories(uniqueExtra);

                    const dynamicNames = res.data.map((g: UserGroup) => g.name).filter(Boolean);
                    const merged = Array.from(new Set([...DEFAULT_ROLES, ...dynamicNames]));
                    setAvailableRoles(merged);
                }
            })
            .catch(() => { });
    }, []);

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

    const handleBroadcast = async () => {
        // Validate target audience
        if (!isAllStudentsSelected && selectedRoles.length === 0) {
            Alert.alert('Target Audience Required', 'Please select at least one role or "All Students" before broadcasting.');
            return;
        }

        if (!title.trim() || !message.trim()) {
            Alert.alert('Missing Fields', 'Please fill in both the title and message before broadcasting.');
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
                isUrgent
            });

            Alert.alert(
                'Notice Broadcasted',
                `Your notice "${title}" has been broadcasted to ${targetAudienceLabel}.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error('Error broadcasting notice:', error);
            const status = error.response?.status;
            if (status === 401) {
                await SecureStore.deleteItemAsync('userToken');
                Alert.alert(
                    'Session Expired',
                    'Your session has expired or is invalid. Please log in again.',
                    [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                );
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to send the notice.');
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
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Broadcast Notice</Text>
                <View style={{ width: 36 }} /> {/* Empty view for balance */}
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Target Audience Section with Searchable Role Selector */}
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

                {/* Title Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Notice Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter notice title..."
                        placeholderTextColor="#A0AEC0"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Category Selection */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = category === cat.label;
                            return (
                                <TouchableOpacity
                                    key={cat.label}
                                    style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                                    onPress={() => setCategory(cat.label)}
                                    activeOpacity={0.7}
                                >
                                    <Icon size={18} color={isActive ? '#FFFFFF' : '#4A5568'} />
                                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]} numberOfLines={1}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                        {customCategories.map((customCat) => {
                            const isActive = category === customCat;
                            return (
                                <TouchableOpacity
                                    key={customCat}
                                    style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                                    onPress={() => setCategory(customCat)}
                                    activeOpacity={0.7}
                                >
                                    <Tag size={18} color={isActive ? '#FFFFFF' : '#4A5568'} />
                                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]} numberOfLines={1}>
                                        {customCat}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Message Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Message Content</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Type your announcement here..."
                        placeholderTextColor="#A0AEC0"
                        multiline
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />
                </View>

                {/* Urgent Toggle */}
                <TouchableOpacity
                    style={[styles.urgentToggle, isUrgent && styles.urgentToggleActive]}
                    onPress={() => setIsUrgent(!isUrgent)}
                    activeOpacity={0.8}
                >
                    <AlertTriangle size={20} color={isUrgent ? '#E53E3E' : '#A0AEC0'} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.urgentTitle, isUrgent && { color: '#E53E3E' }]}>Mark as Urgent</Text>
                        <Text style={styles.urgentDesc}>
                            Highlights this notice in red and pins it to the top.
                        </Text>
                    </View>
                    <View style={[styles.checkbox, isUrgent && styles.checkboxActive]}>
                        {isUrgent && <View style={styles.checkboxInner} />}
                    </View>
                </TouchableOpacity>

            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.broadcastBtn, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleBroadcast}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Send size={18} color="#FFFFFF" />
                            <Text style={styles.broadcastBtnText}>Broadcast Notice</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
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
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
    container: {
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        padding: 16,
        paddingBottom: 40,
        gap: 14,
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
    inputGroup: { marginBottom: 16 },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A3A6B',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: '#2D3748',
    },
    textArea: { height: 120 },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    chip: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    chipActive: {
        backgroundColor: '#1A3A6B',
        borderColor: '#1A3A6B',
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4A5568',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryCard: {
        width: '23%',
        minWidth: 74,
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
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
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
    },
    urgentToggleActive: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FEB2B2',
    },
    urgentTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D3748',
    },
    urgentDesc: {
        fontSize: 11,
        color: '#A0AEC0',
        marginTop: 2,
    },
    checkbox: {
        width: 22, height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CBD5E0',
        alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: {
        borderColor: '#E53E3E',
    },
    checkboxInner: {
        width: 12, height: 12,
        borderRadius: 3,
        backgroundColor: '#E53E3E',
    },
    bottomBar: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    broadcastBtn: {
        flexDirection: 'row',
        backgroundColor: '#2B6CB0',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    broadcastBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});