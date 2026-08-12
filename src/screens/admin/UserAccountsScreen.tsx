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
    Modal,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, UserPlus, Shield, Trash2, Edit3, X } from 'lucide-react-native';
import { adminApi } from '../../services/api';

export default function UserAccountsScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [usersList, setUsersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        dob: '',
        role: 'FACULTY',
        usn: '',
        department: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminApi.getAllUsers();
            setUsersList(response);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            Alert.alert('Error', 'Could not load user accounts. Check your server connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.dob) {
            Alert.alert('Missing Fields', 'Name, Email, and Date of Birth (DOB) are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            await adminApi.createUser(newUser);
            Alert.alert('Success', 'User created successfully!');
            setModalVisible(false);
            setNewUser({ name: '', email: '', dob: '', role: 'FACULTY', usn: '', department: '' });

            // Refresh the list to show the newly added user
            setLoading(true);
            fetchUsers();
        } catch (error: any) {
            console.error('Error creating user:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create user.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = usersList.filter((u) => {
        const matchesSearch =
            (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Accounts</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <UserPlus size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <Search size={18} color="#A0AEC0" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email..."
                        placeholderTextColor="#A0AEC0"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filterRow}>
                    {['ALL', 'FACULTY', 'STUDENT', 'ADMIN'].map((role) => (
                        <TouchableOpacity
                            key={role}
                            style={[styles.filterTab, selectedRole === role && styles.filterTabActive]}
                            onPress={() => setSelectedRole(role)}
                        >
                            <Text style={[styles.filterTabText, selectedRole === role && styles.filterTabTextActive]}>
                                {role}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                    <Text style={styles.resultCount}>Showing {filteredUsers.length} Users</Text>

                    {filteredUsers.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No users found. Try adding one!</Text>
                        </View>
                    ) : (
                        filteredUsers.map((item) => (
                            <View key={item.id} style={styles.card}>
                                <View style={styles.cardLeft}>
                                    <View style={[styles.avatar, item.role === 'ADMIN' ? styles.adminAvatar : item.role === 'FACULTY' ? styles.facultyAvatar : styles.studentAvatar]}>
                                        <Text style={styles.avatarText}>
                                            {item.name ? item.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : 'U'}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.userName}>{item.name}</Text>
                                        <Text style={styles.userEmail}>{item.email}</Text>
                                        <Text style={styles.userId}>ID: {item.usn || 'N/A'}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardRight}>
                                    <View style={styles.badge}>
                                        <Shield size={10} color="#3182CE" />
                                        <Text style={styles.badgeText}>{item.role}</Text>
                                    </View>
                                    <View style={styles.actionIcons}>
                                        <TouchableOpacity onPress={() => alert(`Edit ${item.name}`)}>
                                            <Edit3 size={16} color="#4A5568" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => alert(`Delete ${item.name}`)}>
                                            <Trash2 size={16} color="#E53E3E" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* ADD USER MODAL */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New User</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#4A5568" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput style={styles.input} placeholder="e.g. Dr. Jane Doe" value={newUser.name} onChangeText={(t) => setNewUser({ ...newUser, name: t })} />

                            <Text style={styles.label}>Email Address</Text>
                            <TextInput style={styles.input} placeholder="e.g. jane@rnsit.ac.in" keyboardType="email-address" autoCapitalize="none" value={newUser.email} onChangeText={(t) => setNewUser({ ...newUser, email: t })} />

                            <Text style={styles.label}>Date of Birth (DOB)</Text>
                            <TextInput style={styles.input} placeholder="e.g. DD-MM-YYYY or YYYY-MM-DD" value={newUser.dob} onChangeText={(t) => setNewUser({ ...newUser, dob: t })} />

                            <Text style={styles.label}>Role</Text>
                            <View style={styles.roleSelector}>
                                {['FACULTY', 'STUDENT', 'ADMIN'].map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[styles.roleBtn, newUser.role === r && styles.roleBtnActive]}
                                        onPress={() => setNewUser({ ...newUser, role: r })}
                                    >
                                        <Text style={[styles.roleBtnText, newUser.role === r && styles.roleBtnTextActive]}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>USN / Employee ID</Text>
                            <TextInput style={styles.input} placeholder="e.g. FAC123" autoCapitalize="characters" value={newUser.usn} onChangeText={(t) => setNewUser({ ...newUser, usn: t })} />

                            <Text style={styles.label}>Department</Text>
                            <TextInput style={styles.input} placeholder="e.g. Computer Science" value={newUser.department} onChangeText={(t) => setNewUser({ ...newUser, department: t })} />

                            <TouchableOpacity
                                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                                onPress={handleCreateUser}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2754' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#0F2754' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
    addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2B6CB0', alignItems: 'center', justifyContent: 'center' },
    container: { flex: 1, backgroundColor: '#F0F4F8', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 20, paddingHorizontal: 16 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#2D3748' },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    filterTab: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#E2E8F0', alignItems: 'center' },
    filterTabActive: { backgroundColor: '#1A3A6B' },
    filterTabText: { fontSize: 11, fontWeight: '700', color: '#4A5568' },
    filterTabTextActive: { color: '#FFFFFF' },
    listContainer: { paddingBottom: 40 },
    resultCount: { fontSize: 12, fontWeight: '700', color: '#718096', marginBottom: 12, textTransform: 'uppercase' },
    emptyState: { padding: 20, alignItems: 'center', marginTop: 20 },
    emptyStateText: { color: '#A0AEC0', fontSize: 14 },
    card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    adminAvatar: { backgroundColor: '#E53E3E' },
    facultyAvatar: { backgroundColor: '#1A3A6B' },
    studentAvatar: { backgroundColor: '#2B6CB0' },
    avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    userName: { fontSize: 13, fontWeight: '700', color: '#1A3A6B' },
    userEmail: { fontSize: 11, color: '#4A5568', marginTop: 1 },
    userId: { fontSize: 10, color: '#A0AEC0', marginTop: 2 },
    cardRight: { alignItems: 'flex-end', gap: 8 },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBF8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 3 },
    badgeText: { fontSize: 9, fontWeight: '700', color: '#3182CE' },
    actionIcons: { flexDirection: 'row', gap: 12, marginTop: 4 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A3A6B' },
    label: { fontSize: 12, fontWeight: 'bold', color: '#4A5568', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, color: '#2D3748' },
    roleSelector: { flexDirection: 'row', gap: 10 },
    roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
    roleBtnActive: { backgroundColor: '#3182CE', borderColor: '#3182CE' },
    roleBtnText: { fontSize: 12, fontWeight: '600', color: '#4A5568' },
    roleBtnTextActive: { color: '#FFF' },
    submitBtn: { backgroundColor: '#2B6CB0', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});