import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator,
    Alert,
    AlertButton,
    Modal,
    KeyboardAvoidingView,
    Platform,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Search,
    ShieldCheck,
    Tag,
    Plus,
    Pencil,
    Trash2,
    X,
    ChevronDown,
    Users,
    Check,
    Layers
} from 'lucide-react-native';
import { rolesApi, User, UserGroup } from '../../services/api';

const SYSTEM_ROLES = ['STUDENT', 'FACULTY', 'MANAGEMENT', 'ADMIN'];
const CATEGORY_PRESETS = ['Department', 'Committee', 'Club', 'Academic', 'Administrative'];

export default function RolesDashboardScreen({ navigation }: any) {
    const [activeTab, setActiveTab] = useState<'users' | 'tags'>('users');
    const [usersList, setUsersList] = useState<User[]>([]);
    const [groupsList, setGroupsList] = useState<UserGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

    // Tag Create/Edit Modal
    const [isTagModalVisible, setTagModalVisible] = useState(false);
    const [editingTag, setEditingTag] = useState<UserGroup | null>(null);
    const [tagName, setTagName] = useState('');
    const [tagCategory, setTagCategory] = useState('Committee');
    const [isSubmittingTag, setIsSubmittingTag] = useState(false);

    // Assign Tag Modal
    const [isAssignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, groupsRes] = await Promise.all([
                rolesApi.getUsers(),
                rolesApi.getGroups(),
            ]);
            setUsersList(usersRes.data);
            setGroupsList(groupsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load roles and users list');
        } finally {
            setLoading(false);
        }
    };

    // Change User System Role
    const handleChangeSystemRole = (user: User) => {
        const roleButtons: AlertButton[] = [
            ...SYSTEM_ROLES.map((role): AlertButton => ({
                text: role === user.role ? `(Current) ${role}` : role,
                onPress: async () => {
                    if (role === user.role) return;
                    try {
                        await rolesApi.updateUserRole(user.id, role);
                        Alert.alert('Success', `Role updated to ${role}`);
                        loadData();
                    } catch (err: any) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed to update role');
                    }
                },
            })),
            { text: 'Cancel', style: 'cancel' },
        ];

        Alert.alert(
            `Change Role: ${user.name}`,
            'Select the base system permission level:',
            roleButtons
        );
    };

    // Save/Update Dynamic Tag
    const handleSaveTag = async () => {
        if (!tagName.trim()) {
            Alert.alert('Validation Error', 'Tag name is required');
            return;
        }

        try {
            setIsSubmittingTag(true);
            if (editingTag) {
                await rolesApi.updateGroup(editingTag.id, {
                    name: tagName.trim(),
                    category: tagCategory.trim(),
                });
                Alert.alert('Success', 'Tag updated successfully');
            } else {
                await rolesApi.createGroup({
                    name: tagName.trim(),
                    category: tagCategory.trim(),
                });
                Alert.alert('Success', 'New role tag created');
            }
            setTagModalVisible(false);
            setTagName('');
            setEditingTag(null);
            loadData();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to save tag');
        } finally {
            setIsSubmittingTag(false);
        }
    };

    // Delete Dynamic Tag
    const handleDeleteTag = (group: UserGroup) => {
        Alert.alert(
            'Delete Role Tag',
            `Are you sure you want to delete "${group.name}"? This removes this tag from all assigned users.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rolesApi.deleteGroup(group.id);
                            Alert.alert('Deleted', `Tag "${group.name}" deleted successfully`);
                            loadData();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete tag');
                        }
                    },
                },
            ]
        );
    };

    // Assign Tag to User
    const handleAssignTag = async (groupId: string) => {
        if (!selectedUser) return;
        try {
            await rolesApi.assignUserGroup(selectedUser.id, groupId);
            setAssignModalVisible(false);
            loadData();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to assign tag');
        }
    };

    // Remove Tag from User
    const handleRemoveTag = (userId: string, groupId: string, name: string) => {
        Alert.alert('Remove Role Tag', `Remove "${name}" from this user?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await rolesApi.removeUserGroup(userId, groupId);
                        loadData();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to remove tag');
                    }
                },
            },
        ]);
    };

    // Filter Users
    const filteredUsers = usersList.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.usn && u.usn.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Manage Roles</Text>
                    <Text style={styles.headerSubtitle}>System Permissions & Dynamic Role Tags</Text>
                </View>
            </View>

            {/* Segmented Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'users' && styles.tabItemActive]}
                    onPress={() => setActiveTab('users')}
                >
                    <Users size={16} color={activeTab === 'users' ? '#1A3A6B' : '#718096'} />
                    <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
                        Users & Roles ({usersList.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'tags' && styles.tabItemActive]}
                    onPress={() => setActiveTab('tags')}
                >
                    <Tag size={16} color={activeTab === 'tags' ? '#1A3A6B' : '#718096'} />
                    <Text style={[styles.tabText, activeTab === 'tags' && styles.tabTextActive]}>
                        Role Tags ({groupsList.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#1A3A6B" />
                        <Text style={styles.loadingText}>Loading roles data...</Text>
                    </View>
                ) : activeTab === 'users' ? (
                    /* TAB 1: USERS & ROLES */
                    <View style={{ flex: 1 }}>
                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <Search size={18} color="#718096" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by name, email, department..."
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

                        {/* Role Filter Pills */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.filterScroll}
                            contentContainerStyle={styles.filterContent}
                        >
                            {['ALL', ...SYSTEM_ROLES].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.filterPill,
                                        selectedRoleFilter === role && styles.filterPillActive,
                                    ]}
                                    onPress={() => setSelectedRoleFilter(role)}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            selectedRoleFilter === role && styles.filterPillTextActive,
                                        ]}
                                    >
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Users List */}
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => (
                                <View style={styles.userCard}>
                                    <View style={styles.userTopRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.userName}>{item.name}</Text>
                                            <Text style={styles.userEmail}>{item.email}</Text>
                                            {item.department ? (
                                                <Text style={styles.userDept}>Dept: {item.department}</Text>
                                            ) : null}
                                        </View>

                                        <TouchableOpacity
                                            style={[
                                                styles.roleBadge,
                                                item.role === 'ADMIN' && { backgroundColor: '#FEE2E2' },
                                                item.role === 'FACULTY' && { backgroundColor: '#EDE9FE' },
                                                item.role === 'STUDENT' && { backgroundColor: '#E0F2FE' },
                                                item.role === 'MANAGEMENT' && { backgroundColor: '#FEF3C7' },
                                            ]}
                                            onPress={() => handleChangeSystemRole(item)}
                                        >
                                            <Text
                                                style={[
                                                    styles.roleBadgeText,
                                                    item.role === 'ADMIN' && { color: '#DC2626' },
                                                    item.role === 'FACULTY' && { color: '#7C3AED' },
                                                    item.role === 'STUDENT' && { color: '#0284C7' },
                                                    item.role === 'MANAGEMENT' && { color: '#D97706' },
                                                ]}
                                            >
                                                {item.role}
                                            </Text>
                                            <ChevronDown size={12} color="#718096" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Assigned Dynamic Tags */}
                                    <View style={styles.tagSection}>
                                        <Text style={styles.tagSectionTitle}>Dynamic Role Tags:</Text>
                                        <View style={styles.tagsContainer}>
                                            {item.groups && item.groups.length > 0 ? (
                                                item.groups.map((g) => (
                                                    <TouchableOpacity
                                                        key={g.id}
                                                        style={styles.userTagBadge}
                                                        onPress={() => handleRemoveTag(item.id, g.id, g.name)}
                                                    >
                                                        <Tag size={11} color="#4F46E5" />
                                                        <Text style={styles.userTagText}>{g.name}</Text>
                                                        <X size={12} color="#6366F1" />
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <Text style={styles.noTagsLabel}>None assigned</Text>
                                            )}

                                            <TouchableOpacity
                                                style={styles.addTagButton}
                                                onPress={() => {
                                                    setSelectedUser(item);
                                                    setAssignModalVisible(true);
                                                }}
                                            >
                                                <Plus size={12} color="#1A3A6B" />
                                                <Text style={styles.addTagButtonText}>Assign Tag</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No users found matching query</Text>
                                </View>
                            }
                        />
                    </View>
                ) : (
                    /* TAB 2: DYNAMIC ROLE TAGS */
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            style={styles.createTagButton}
                            onPress={() => {
                                setEditingTag(null);
                                setTagName('');
                                setTagCategory('Committee');
                                setTagModalVisible(true);
                            }}
                        >
                            <Plus size={18} color="#FFFFFF" />
                            <Text style={styles.createTagButtonText}>Create New Role Tag</Text>
                        </TouchableOpacity>

                        <FlatList
                            data={groupsList}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => (
                                <View style={styles.tagCard}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Tag size={16} color="#1A3A6B" />
                                            <Text style={styles.tagCardTitle}>{item.name}</Text>
                                        </View>
                                        <View style={styles.tagCardMeta}>
                                            <View style={styles.categoryBadge}>
                                                <Text style={styles.categoryBadgeText}>{item.category}</Text>
                                            </View>
                                            <Text style={styles.tagCardCount}>
                                                {item._count?.users || (item.users ? item.users.length : 0)} assigned users
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.tagCardActions}>
                                        <TouchableOpacity
                                            style={[styles.iconActionBtn, { backgroundColor: '#EEF2FF' }]}
                                            onPress={() => {
                                                setEditingTag(item);
                                                setTagName(item.name);
                                                setTagCategory(item.category);
                                                setTagModalVisible(true);
                                            }}
                                        >
                                            <Pencil size={16} color="#4F46E5" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.iconActionBtn, { backgroundColor: '#FEE2E2' }]}
                                            onPress={() => handleDeleteTag(item)}
                                        >
                                            <Trash2 size={16} color="#DC2626" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Tag size={36} color="#CBD5E1" />
                                    <Text style={styles.emptyTitle}>No Role Tags Yet</Text>
                                    <Text style={styles.emptyText}>
                                        Create dynamic tags like "HOD", "Exam Cell", "AI Club" to assign to users.
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                )}
            </View>

            {/* CREATE / EDIT TAG MODAL */}
            <Modal
                visible={isTagModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setTagModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingTag ? 'Edit Dynamic Tag' : 'Create Dynamic Tag'}
                            </Text>
                            <TouchableOpacity onPress={() => setTagModalVisible(false)}>
                                <X size={20} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Tag / Role Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. HOD, Exam Cell, Sports Committee"
                            placeholderTextColor="#A0AEC0"
                            value={tagName}
                            onChangeText={setTagName}
                        />

                        <Text style={styles.inputLabel}>Category</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Department, Committee, Club"
                            placeholderTextColor="#A0AEC0"
                            value={tagCategory}
                            onChangeText={setTagCategory}
                        />

                        {/* Category Presets */}
                        <View style={styles.presetsRow}>
                            {CATEGORY_PRESETS.map((preset) => (
                                <TouchableOpacity
                                    key={preset}
                                    style={[
                                        styles.presetPill,
                                        tagCategory === preset && styles.presetPillActive,
                                    ]}
                                    onPress={() => setTagCategory(preset)}
                                >
                                    <Text
                                        style={[
                                            styles.presetPillText,
                                            tagCategory === preset && styles.presetPillTextActive,
                                        ]}
                                    >
                                        {preset}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setTagModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalSaveBtn}
                                onPress={handleSaveTag}
                                disabled={isSubmittingTag}
                            >
                                {isSubmittingTag ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalSaveText}>
                                        {editingTag ? 'Save Changes' : 'Create Tag'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ASSIGN TAG MODAL */}
            <Modal
                visible={isAssignModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Assign Tag to {selectedUser?.name}
                            </Text>
                            <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                                <X size={20} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.assignSubtitle}>
                            Select a dynamic role tag to attach to this user:
                        </Text>

                        <ScrollView style={{ maxHeight: 260, marginVertical: 10 }}>
                            {groupsList.length === 0 ? (
                                <Text style={styles.noGroupsModalText}>
                                    No role tags available. Please create one in the Role Tags tab first.
                                </Text>
                            ) : (
                                groupsList.map((group) => {
                                    const isAssigned = selectedUser?.groups?.some(
                                        (g) => g.id === group.id
                                    );
                                    return (
                                        <TouchableOpacity
                                            key={group.id}
                                            disabled={isAssigned}
                                            style={[
                                                styles.assignOption,
                                                isAssigned && styles.assignOptionDisabled,
                                            ]}
                                            onPress={() => handleAssignTag(group.id)}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.assignOptionTitle}>{group.name}</Text>
                                                <Text style={styles.assignOptionCategory}>Category: {group.category}</Text>
                                            </View>
                                            {isAssigned ? (
                                                <View style={styles.assignedBadge}>
                                                    <Check size={12} color="#16A34A" />
                                                    <Text style={styles.assignedBadgeText}>Assigned</Text>
                                                </View>
                                            ) : (
                                                <Plus size={18} color="#1A3A6B" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={() => setAssignModalVisible(false)}
                        >
                            <Text style={styles.modalCancelText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 14,
        backgroundColor: '#0F2754',
        gap: 12,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.65)',
        marginTop: 2,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#0F2754',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 9,
        borderRadius: 10,
        gap: 6,
    },
    tabItemActive: {
        backgroundColor: '#FFFFFF',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
    },
    tabTextActive: {
        color: '#1A3A6B',
    },
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 13,
        color: '#718096',
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 44,
        marginBottom: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#1A3A6B',
    },
    filterScroll: {
        maxHeight: 36,
        marginBottom: 12,
    },
    filterContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterPillActive: {
        backgroundColor: '#1A3A6B',
        borderColor: '#1A3A6B',
    },
    filterPillText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#718096',
    },
    filterPillTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    userTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    userName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    userEmail: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    userDept: {
        fontSize: 11,
        color: '#A0AEC0',
        marginTop: 1,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 4,
    },
    roleBadgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    tagSection: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 10,
        marginTop: 4,
    },
    tagSectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginBottom: 6,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
    },
    userTagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    userTagText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4F46E5',
    },
    noTagsLabel: {
        fontSize: 11,
        color: '#A0AEC0',
        fontStyle: 'italic',
        marginRight: 6,
    },
    addTagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        gap: 3,
    },
    addTagButtonText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1A3A6B',
    },
    createTagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A3A6B',
        marginHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 14,
        gap: 8,
        elevation: 2,
    },
    createTagButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    tagCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tagCardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    tagCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    categoryBadge: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6B46C1',
    },
    tagCardCount: {
        fontSize: 11,
        color: '#718096',
    },
    tagCardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconActionBtn: {
        width: 34,
        height: 34,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 39, 84, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4A5568',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        color: '#1A3A6B',
        marginBottom: 12,
    },
    presetsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 16,
    },
    presetPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    presetPillActive: {
        backgroundColor: '#1A3A6B',
    },
    presetPillText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#718096',
    },
    presetPillTextActive: {
        color: '#FFFFFF',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 4,
    },
    modalCancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#718096',
    },
    modalSaveBtn: {
        backgroundColor: '#1A3A6B',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalSaveText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    assignSubtitle: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 8,
    },
    assignOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    assignOptionDisabled: {
        opacity: 0.6,
        backgroundColor: '#F1F5F9',
    },
    assignOptionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    assignOptionCategory: {
        fontSize: 11,
        color: '#718096',
        marginTop: 2,
    },
    assignedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    assignedBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#16A34A',
    },
    noGroupsModalText: {
        textAlign: 'center',
        color: '#718096',
        fontSize: 12,
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A3A6B',
        marginTop: 10,
    },
    emptyText: {
        fontSize: 12,
        color: '#718096',
        textAlign: 'center',
        marginTop: 4,
    },
});
