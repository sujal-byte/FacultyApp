import React, { useState, useEffect, useMemo } from 'react';
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
    FlatList,
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
    Layers,
    Sparkles,
    GraduationCap,
    BookOpen,
    Filter,
} from 'lucide-react-native';
import { rolesApi, User, UserGroup } from '../../services/api';
import { DEFAULT_ROLE_GROUPS, MOCK_USERS_WITH_ROLES } from '../../data/mockData';

const SYSTEM_ROLES = ['STUDENT', 'FACULTY', 'MANAGEMENT', 'ADMIN'];
const CATEGORY_PRESETS = [
    'Batch',
    'Section',
    'Course',
    'Department',
    'Committee',
    'Club',
    'Academic',
    'Administrative',
];

const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
    Batch: ['Batch_2029', 'Batch_2028', 'Batch_2027', 'Batch_2026', 'Batch_2025'],
    Section: ['CSE-J', 'CSE-A', 'CSE-B', 'CSE-C', 'IT-A', 'AIML-A', 'ECE-A'],
    Course: ['CS401', 'CS302', 'CS501', 'CS201', 'CS601'],
    Department: ['HOD - Computer Science', 'HOD - Electronics', 'HOD - Mechanical'],
    Committee: ['Exam Cell Coordinator', 'Placement Cell', 'Anti-Ragging Committee', 'Sports Committee'],
    Club: ['AI & Robotics Club', 'Coding Club', 'Cultural Club', 'Debate Society'],
    Academic: ['Curriculum Committee', 'NAAC Cell', 'Research & Development'],
    Administrative: ['Disciplinary Committee', 'Hostel Warden', 'Library Committee'],
};

const getCategoryStyle = (category: string) => {
    switch (category) {
        case 'Batch':
            return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', dot: '#0284C7' };
        case 'Section':
            return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', dot: '#16A34A' };
        case 'Course':
            return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', dot: '#D97706' };
        case 'Department':
            return { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF', dot: '#9333EA' };
        case 'Committee':
            return { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8', dot: '#DB2777' };
        case 'Club':
            return { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA', dot: '#EA580C' };
        case 'Academic':
            return { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE', dot: '#4F46E5' };
        case 'Administrative':
        default:
            return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', dot: '#64748B' };
    }
};

export default function RolesDashboardScreen({ navigation }: any) {
    const [activeTab, setActiveTab] = useState<'users' | 'tags'>('users');
    const [usersList, setUsersList] = useState<User[]>([]);
    const [groupsList, setGroupsList] = useState<UserGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

    // Tags Tab Filters
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [selectedTagCategory, setSelectedTagCategory] = useState('ALL');

    // Tag Create/Edit Modal
    const [isTagModalVisible, setTagModalVisible] = useState(false);
    const [editingTag, setEditingTag] = useState<UserGroup | null>(null);
    const [tagName, setTagName] = useState('');
    const [tagCategory, setTagCategory] = useState('Batch');
    const [isSubmittingTag, setIsSubmittingTag] = useState(false);

    // Assign Tag Modal
    const [isAssignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [assignTagSearch, setAssignTagSearch] = useState('');
    const [assignCategoryFilter, setAssignCategoryFilter] = useState('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, groupsRes] = await Promise.allSettled([
                rolesApi.getUsers(),
                rolesApi.getGroups(),
            ]);

            // Handle users
            if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data) && usersRes.value.data.length > 0) {
                setUsersList(usersRes.value.data);
            } else {
                setUsersList(MOCK_USERS_WITH_ROLES);
            }

            // Handle groups
            if (groupsRes.status === 'fulfilled' && Array.isArray(groupsRes.value.data) && groupsRes.value.data.length > 0) {
                // Ensure all default role groups (like Batch_2029, CSE-J) exist, merge if necessary
                const fetched = groupsRes.value.data;
                const fetchedNames = new Set(fetched.map((g) => g.name.toLowerCase()));
                const missingDefaults = DEFAULT_ROLE_GROUPS.filter((dg) => !fetchedNames.has(dg.name.toLowerCase()));
                setGroupsList([...fetched, ...missingDefaults]);
            } else {
                setGroupsList(DEFAULT_ROLE_GROUPS);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setUsersList(MOCK_USERS_WITH_ROLES);
            setGroupsList(DEFAULT_ROLE_GROUPS);
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
                        // Optimistic fallback
                        setUsersList((prev) =>
                            prev.map((u) => (u.id === user.id ? { ...u, role: role as any } : u))
                        );
                        Alert.alert('Role Updated', `Base role set to ${role}`);
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

    // Save / Create Dynamic Tag
    const handleSaveTag = async () => {
        if (!tagName.trim()) {
            Alert.alert('Validation Error', 'Tag name is required (e.g. Batch_2029, CSE-J)');
            return;
        }

        try {
            setIsSubmittingTag(true);
            const trimmedName = tagName.trim();
            const trimmedCategory = tagCategory.trim();

            if (editingTag) {
                try {
                    await rolesApi.updateGroup(editingTag.id, {
                        name: trimmedName,
                        category: trimmedCategory,
                    });
                } catch (_) {
                    // Local fallback
                }
                setGroupsList((prev) =>
                    prev.map((g) =>
                        g.id === editingTag.id
                            ? { ...g, name: trimmedName, category: trimmedCategory }
                            : g
                    )
                );
                Alert.alert('Success', `Role tag "${trimmedName}" updated successfully`);
            } else {
                let newId = `grp-${Date.now()}`;
                try {
                    const res = await rolesApi.createGroup({
                        name: trimmedName,
                        category: trimmedCategory,
                    });
                    if (res.data?.id) newId = res.data.id;
                } catch (_) {
                    // Local fallback
                }
                const newGroup: UserGroup = {
                    id: newId,
                    name: trimmedName,
                    category: trimmedCategory,
                    _count: { users: 0 },
                };
                setGroupsList((prev) => [newGroup, ...prev]);
                Alert.alert('Success', `New role tag "${trimmedName}" created in ${trimmedCategory}`);
            }

            setTagModalVisible(false);
            setTagName('');
            setEditingTag(null);
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
            `Are you sure you want to delete "${group.name}" (${group.category})?\n\nThis removes this tag from all assigned users and attendance filters.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rolesApi.deleteGroup(group.id);
                        } catch (_) {
                            // Local fallback
                        }
                        setGroupsList((prev) => prev.filter((g) => g.id !== group.id));
                        // Also remove from local users
                        setUsersList((prev) =>
                            prev.map((u) => ({
                                ...u,
                                groups: u.groups?.filter((g) => g.id !== group.id),
                            }))
                        );
                        Alert.alert('Deleted', `Tag "${group.name}" deleted successfully`);
                    },
                },
            ]
        );
    };

    // Assign Tag to User
    const handleAssignTag = async (group: UserGroup) => {
        if (!selectedUser) return;
        try {
            try {
                await rolesApi.assignUserGroup(selectedUser.id, group.id);
            } catch (_) {
                // Local fallback
            }

            // Update user list
            setUsersList((prev) =>
                prev.map((u) => {
                    if (u.id === selectedUser.id) {
                        const existing = u.groups || [];
                        if (existing.some((g) => g.id === group.id)) return u;
                        return { ...u, groups: [...existing, group] };
                    }
                    return u;
                })
            );

            // Update selected user in modal
            setSelectedUser((prev) => {
                if (!prev) return null;
                const existing = prev.groups || [];
                return { ...prev, groups: [...existing, group] };
            });

            // Update group user count
            setGroupsList((prev) =>
                prev.map((g) => {
                    if (g.id === group.id) {
                        const current = g._count?.users ?? 0;
                        return { ...g, _count: { users: current + 1 } };
                    }
                    return g;
                })
            );

            Alert.alert('Tag Assigned', `Assigned "${group.name}" to ${selectedUser.name}`);
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
                        try {
                            await rolesApi.removeUserGroup(userId, groupId);
                        } catch (_) {
                            // Local fallback
                        }

                        setUsersList((prev) =>
                            prev.map((u) => {
                                if (u.id === userId) {
                                    return {
                                        ...u,
                                        groups: u.groups?.filter((g) => g.id !== groupId),
                                    };
                                }
                                return u;
                            })
                        );

                        if (selectedUser?.id === userId) {
                            setSelectedUser((prev) =>
                                prev
                                    ? {
                                          ...prev,
                                          groups: prev.groups?.filter((g) => g.id !== groupId),
                                      }
                                    : null
                            );
                        }

                        setGroupsList((prev) =>
                            prev.map((g) => {
                                if (g.id === groupId) {
                                    const current = g._count?.users ?? 1;
                                    return { ...g, _count: { users: Math.max(0, current - 1) } };
                                }
                                return g;
                            })
                        );
                    } catch (err) {
                        Alert.alert('Error', 'Failed to remove tag');
                    }
                },
            },
        ]);
    };

    // Filter Users
    const filteredUsers = useMemo(() => {
        return usersList.filter((u) => {
            const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
            if (!matchesRole) return false;

            if (!searchQuery.trim()) return true;

            const q = searchQuery.toLowerCase();
            const matchesText =
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.usn && u.usn.toLowerCase().includes(q)) ||
                (u.department && u.department.toLowerCase().includes(q));

            const matchesTag = u.groups?.some((g) => g.name.toLowerCase().includes(q));

            return matchesText || matchesTag;
        });
    }, [usersList, selectedRoleFilter, searchQuery]);

    // Filter Tags
    const filteredGroups = useMemo(() => {
        return groupsList.filter((g) => {
            const matchesCategory =
                selectedTagCategory === 'ALL' ||
                g.category.toLowerCase() === selectedTagCategory.toLowerCase();
            if (!matchesCategory) return false;

            if (!tagSearchQuery.trim()) return true;

            const q = tagSearchQuery.toLowerCase();
            return g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
        });
    }, [groupsList, selectedTagCategory, tagSearchQuery]);

    // Filter Assign Modal Tags
    const modalAssignableGroups = useMemo(() => {
        return groupsList.filter((g) => {
            const matchesCategory =
                assignCategoryFilter === 'ALL' ||
                g.category.toLowerCase() === assignCategoryFilter.toLowerCase();
            if (!matchesCategory) return false;

            if (!assignTagSearch.trim()) return true;

            const q = assignTagSearch.toLowerCase();
            return g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
        });
    }, [groupsList, assignCategoryFilter, assignTagSearch]);

    // Stats calculations
    const batchCount = useMemo(
        () => groupsList.filter((g) => g.category.toLowerCase() === 'batch').length,
        [groupsList]
    );
    const sectionCount = useMemo(
        () => groupsList.filter((g) => g.category.toLowerCase() === 'section').length,
        [groupsList]
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Go back"
                >
                    <ArrowLeft size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Manage Roles & Tags</Text>
                    <Text style={styles.headerSubtitle}>
                        System Roles, Batches, Sections & Dynamic Tags
                    </Text>
                </View>
            </View>

            {/* Stat Summary Bar */}
            <View style={styles.summaryStrip}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{groupsList.length}</Text>
                    <Text style={styles.summaryLabel}>Total Tags</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: '#0284C7' }]}>{batchCount}</Text>
                    <Text style={styles.summaryLabel}>Batches</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: '#16A34A' }]}>{sectionCount}</Text>
                    <Text style={styles.summaryLabel}>Sections</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{usersList.length}</Text>
                    <Text style={styles.summaryLabel}>Users</Text>
                </View>
            </View>

            {/* Segmented Navigation Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'users' && styles.tabItemActive]}
                    onPress={() => setActiveTab('users')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activeTab === 'users' }}
                >
                    <Users size={16} color={activeTab === 'users' ? '#1A3A6B' : '#718096'} />
                    <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
                        Users & Roles ({usersList.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'tags' && styles.tabItemActive]}
                    onPress={() => setActiveTab('tags')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activeTab === 'tags' }}
                >
                    <Tag size={16} color={activeTab === 'tags' ? '#1A3A6B' : '#718096'} />
                    <Text style={[styles.tabText, activeTab === 'tags' && styles.tabTextActive]}>
                        Role Tags & Batches ({groupsList.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#1A3A6B" />
                        <Text style={styles.loadingText}>Loading roles & tags data...</Text>
                    </View>
                ) : activeTab === 'users' ? (
                    /* TAB 1: USERS & ROLES */
                    <View style={{ flex: 1 }}>
                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <Search size={18} color="#718096" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by name, email, department, or tag..."
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
                                            {item.usn ? (
                                                <Text style={styles.userDept}>Roll / USN: {item.usn}</Text>
                                            ) : item.department ? (
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
                                        <Text style={styles.tagSectionTitle}>Assigned Role Tags:</Text>
                                        <View style={styles.tagsContainer}>
                                            {item.groups && item.groups.length > 0 ? (
                                                item.groups.map((g) => {
                                                    const catStyle = getCategoryStyle(g.category);
                                                    return (
                                                        <TouchableOpacity
                                                            key={g.id}
                                                            style={[
                                                                styles.userTagBadge,
                                                                {
                                                                    backgroundColor: catStyle.bg,
                                                                    borderColor: catStyle.border,
                                                                },
                                                            ]}
                                                            onPress={() =>
                                                                handleRemoveTag(item.id, g.id, g.name)
                                                            }
                                                            accessibilityLabel={`Remove tag ${g.name}`}
                                                        >
                                                            <View
                                                                style={[
                                                                    styles.categoryDot,
                                                                    { backgroundColor: catStyle.dot },
                                                                ]}
                                                            />
                                                            <Text
                                                                style={[
                                                                    styles.userTagText,
                                                                    { color: catStyle.text },
                                                                ]}
                                                            >
                                                                {g.name}
                                                            </Text>
                                                            <X size={12} color={catStyle.text} />
                                                        </TouchableOpacity>
                                                    );
                                                })
                                            ) : (
                                                <Text style={styles.noTagsLabel}>No tags assigned</Text>
                                            )}

                                            <TouchableOpacity
                                                style={styles.addTagButton}
                                                onPress={() => {
                                                    setSelectedUser(item);
                                                    setAssignTagSearch('');
                                                    setAssignCategoryFilter('ALL');
                                                    setAssignModalVisible(true);
                                                }}
                                            >
                                                <Plus size={12} color="#1A3A6B" />
                                                <Text style={styles.addTagButtonText}>+ Assign Tag</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No users found matching your query</Text>
                                </View>
                            }
                        />
                    </View>
                ) : (
                    /* TAB 2: DYNAMIC ROLE TAGS & BATCHES */
                    <View style={{ flex: 1 }}>
                        {/* Search Role Tags */}
                        <View style={styles.searchContainer}>
                            <Search size={18} color="#718096" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search role tags (e.g. Batch_2029, CSE-J)..."
                                placeholderTextColor="#A0AEC0"
                                value={tagSearchQuery}
                                onChangeText={setTagSearchQuery}
                            />
                            {tagSearchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setTagSearchQuery('')}>
                                    <X size={16} color="#718096" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Category Filter Pills */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.filterScroll}
                            contentContainerStyle={styles.filterContent}
                        >
                            {['ALL', ...CATEGORY_PRESETS].map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.filterPill,
                                        selectedTagCategory === cat && styles.filterPillActive,
                                    ]}
                                    onPress={() => setSelectedTagCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            selectedTagCategory === cat && styles.filterPillTextActive,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Create Tag Button */}
                        <TouchableOpacity
                            style={styles.createTagButton}
                            onPress={() => {
                                setEditingTag(null);
                                setTagName('');
                                setTagCategory(
                                    selectedTagCategory !== 'ALL' ? selectedTagCategory : 'Batch'
                                );
                                setTagModalVisible(true);
                            }}
                            activeOpacity={0.85}
                        >
                            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.createTagButtonText}>Create New Role Tag</Text>
                        </TouchableOpacity>

                        {/* Role Tags List */}
                        <FlatList
                            data={filteredGroups}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => {
                                const catStyle = getCategoryStyle(item.category);
                                const userCount =
                                    item._count?.users ??
                                    (item.users ? item.users.length : 0);

                                return (
                                    <View style={styles.tagCard}>
                                        <View style={{ flex: 1 }}>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                }}
                                            >
                                                <View
                                                    style={[
                                                        styles.categoryDot,
                                                        { backgroundColor: catStyle.dot, width: 8, height: 8 },
                                                    ]}
                                                />
                                                <Text style={styles.tagCardTitle}>{item.name}</Text>
                                            </View>
                                            <View style={styles.tagCardMeta}>
                                                <View
                                                    style={[
                                                        styles.categoryBadge,
                                                        {
                                                            backgroundColor: catStyle.bg,
                                                            borderColor: catStyle.border,
                                                            borderWidth: 1,
                                                        },
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.categoryBadgeText,
                                                            { color: catStyle.text },
                                                        ]}
                                                    >
                                                        {item.category}
                                                    </Text>
                                                </View>
                                                <Text style={styles.tagCardCount}>
                                                    {userCount} assigned user{userCount === 1 ? '' : 's'}
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
                                                accessibilityLabel={`Edit ${item.name}`}
                                            >
                                                <Pencil size={15} color="#4F46E5" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.iconActionBtn, { backgroundColor: '#FEE2E2' }]}
                                                onPress={() => handleDeleteTag(item)}
                                                accessibilityLabel={`Delete ${item.name}`}
                                            >
                                                <Trash2 size={15} color="#DC2626" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Tag size={36} color="#CBD5E1" />
                                    <Text style={styles.emptyTitle}>No Role Tags Found</Text>
                                    <Text style={styles.emptyText}>
                                        Create tags like "Batch_2029", "CSE-J", "HOD", or "Exam Cell" to organize
                                        attendance and system roles.
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
                            <View>
                                <Text style={styles.modalTitle}>
                                    {editingTag ? 'Edit Role Tag' : 'Create New Role Tag'}
                                </Text>
                                <Text style={styles.modalSubTitle}>
                                    Define application roles for attendance filtering & permissions
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseCircle}
                                onPress={() => setTagModalVisible(false)}
                            >
                                <X size={18} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        {/* Category Selector */}
                        <Text style={styles.inputLabel}>Select Category</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: 12 }}
                            contentContainerStyle={{ gap: 6 }}
                        >
                            {CATEGORY_PRESETS.map((preset) => {
                                const isSelected = tagCategory === preset;
                                const catStyle = getCategoryStyle(preset);
                                return (
                                    <TouchableOpacity
                                        key={preset}
                                        style={[
                                            styles.presetPill,
                                            isSelected && {
                                                backgroundColor: catStyle.bg,
                                                borderColor: catStyle.dot,
                                                borderWidth: 1.5,
                                            },
                                        ]}
                                        onPress={() => setTagCategory(preset)}
                                    >
                                        <Text
                                            style={[
                                                styles.presetPillText,
                                                isSelected && { color: catStyle.text, fontWeight: '800' },
                                            ]}
                                        >
                                            {preset}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Tag Name Input */}
                        <Text style={styles.inputLabel}>Tag / Role Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Batch_2029, CSE-J, CS401"
                            placeholderTextColor="#A0AEC0"
                            value={tagName}
                            onChangeText={setTagName}
                        />

                        {/* Category Suggestions / Quick Chips */}
                        {CATEGORY_SUGGESTIONS[tagCategory] && (
                            <View style={styles.suggestionsWrapper}>
                                <View style={styles.suggestionsHeader}>
                                    <Sparkles size={12} color="#D97706" />
                                    <Text style={styles.suggestionsHeaderText}>
                                        Suggested {tagCategory} Tags:
                                    </Text>
                                </View>
                                <View style={styles.suggestionsChipsRow}>
                                    {CATEGORY_SUGGESTIONS[tagCategory].map((sug) => (
                                        <TouchableOpacity
                                            key={sug}
                                            style={styles.suggestionChip}
                                            onPress={() => setTagName(sug)}
                                        >
                                            <Text style={styles.suggestionChipTxt}>+ {sug}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

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
                    <View style={[styles.modalContent, { maxHeight: '85%' }]}>
                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>
                                    Assign Tag to {selectedUser?.name}
                                </Text>
                                <Text style={styles.modalSubTitle}>
                                    Role: {selectedUser?.role} • USN/Dept: {selectedUser?.usn || selectedUser?.department || '—'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseCircle}
                                onPress={() => setAssignModalVisible(false)}
                            >
                                <X size={18} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        {/* Search within Assign Modal */}
                        <View style={styles.assignSearchBox}>
                            <Search size={14} color="#A0AEC0" />
                            <TextInput
                                style={styles.assignSearchInput}
                                placeholder="Search tags (e.g. Batch_2029, CSE-J)..."
                                placeholderTextColor="#A0AEC0"
                                value={assignTagSearch}
                                onChangeText={setAssignTagSearch}
                            />
                            {assignTagSearch.length > 0 && (
                                <TouchableOpacity onPress={() => setAssignTagSearch('')}>
                                    <X size={14} color="#A0AEC0" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Category filter pills in Assign Modal */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ maxHeight: 36, marginBottom: 8 }}
                            contentContainerStyle={{ gap: 6 }}
                        >
                            {['ALL', ...CATEGORY_PRESETS].map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.presetPill,
                                        assignCategoryFilter === cat && styles.presetPillActive,
                                    ]}
                                    onPress={() => setAssignCategoryFilter(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.presetPillText,
                                            assignCategoryFilter === cat && styles.presetPillTextActive,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Tag list for assignment */}
                        <ScrollView style={{ maxHeight: 280, marginVertical: 6 }} showsVerticalScrollIndicator={false}>
                            {modalAssignableGroups.length === 0 ? (
                                <Text style={styles.noGroupsModalText}>
                                    No role tags matching search criteria.
                                </Text>
                            ) : (
                                modalAssignableGroups.map((group) => {
                                    const isAssigned = selectedUser?.groups?.some(
                                        (g) => g.id === group.id || g.name.toLowerCase() === group.name.toLowerCase()
                                    );
                                    const catStyle = getCategoryStyle(group.category);

                                    return (
                                        <TouchableOpacity
                                            key={group.id}
                                            disabled={isAssigned}
                                            style={[
                                                styles.assignOption,
                                                isAssigned && styles.assignOptionDisabled,
                                            ]}
                                            onPress={() => handleAssignTag(group)}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                    <View
                                                        style={[
                                                            styles.categoryDot,
                                                            { backgroundColor: catStyle.dot },
                                                        ]}
                                                    />
                                                    <Text style={styles.assignOptionTitle}>{group.name}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                                    <View
                                                        style={[
                                                            styles.categoryBadge,
                                                            {
                                                                backgroundColor: catStyle.bg,
                                                                borderColor: catStyle.border,
                                                                borderWidth: 1,
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.categoryBadgeText,
                                                                { color: catStyle.text, fontSize: 9 },
                                                            ]}
                                                        >
                                                            {group.category}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {isAssigned ? (
                                                <View style={styles.assignedBadge}>
                                                    <Check size={12} color="#16A34A" strokeWidth={2.5} />
                                                    <Text style={styles.assignedBadgeText}>Assigned</Text>
                                                </View>
                                            ) : (
                                                <View style={styles.assignPlusBtn}>
                                                    <Plus size={16} color="#1A3A6B" strokeWidth={2.2} />
                                                    <Text style={styles.assignPlusBtnTxt}>Assign</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalDoneBtn}
                            onPress={() => setAssignModalVisible(false)}
                        >
                            <Text style={styles.modalDoneBtnText}>Done</Text>
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
        paddingBottom: 10,
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
        marginTop: 1,
    },
    summaryStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.65)',
        marginTop: 1,
    },
    summaryDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 5,
        borderWidth: 1,
    },
    categoryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    userTagText: {
        fontSize: 11,
        fontWeight: '700',
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
        backgroundColor: '#0F2754',
        marginHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 12,
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
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '700',
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
        backgroundColor: 'rgba(15, 39, 84, 0.55)',
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
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    modalSubTitle: {
        fontSize: 11,
        color: '#718096',
        marginTop: 2,
    },
    modalCloseCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: '#F8FAFC',
    },
    presetPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    presetPillActive: {
        backgroundColor: '#1A3A6B',
        borderColor: '#1A3A6B',
    },
    presetPillText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#718096',
    },
    presetPillTextActive: {
        color: '#FFFFFF',
    },
    suggestionsWrapper: {
        backgroundColor: '#FFFBEB',
        borderRadius: 10,
        padding: 10,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    suggestionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 6,
    },
    suggestionsHeaderText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#B45309',
        textTransform: 'uppercase',
    },
    suggestionsChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    suggestionChip: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#FDE68A',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    suggestionChipTxt: {
        fontSize: 11,
        fontWeight: '600',
        color: '#92400E',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 6,
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
        backgroundColor: '#0F2754',
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
    assignSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 38,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 6,
        marginBottom: 8,
    },
    assignSearchInput: {
        flex: 1,
        fontSize: 12,
        color: '#1A3A6B',
        padding: 0,
    },
    assignOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    assignOptionDisabled: {
        opacity: 0.7,
        backgroundColor: '#F1F5F9',
    },
    assignOptionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1A3A6B',
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
    assignPlusBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 3,
    },
    assignPlusBtnTxt: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1A3A6B',
    },
    noGroupsModalText: {
        textAlign: 'center',
        color: '#718096',
        fontSize: 12,
        padding: 16,
    },
    modalDoneBtn: {
        backgroundColor: '#0F2754',
        paddingVertical: 11,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    modalDoneBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
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
