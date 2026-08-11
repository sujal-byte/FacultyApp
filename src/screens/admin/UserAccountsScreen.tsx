import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, UserPlus, Shield, Trash2, Edit3 } from 'lucide-react-native';

export default function UserAccountsScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');

    // Placeholder mock data for user accounts
    const usersList = [
        { id: '1', name: 'Dr. Smitha Rao', email: 'smitha.rao@rnsit.ac.in', role: 'FACULTY', usn: 'FAC101' },
        { id: '2', name: 'Sujal Parmar', email: 'sujal@rnsit.ac.in', role: 'STUDENT', usn: '1RV24CS001' },
        { id: '3', name: 'Admin User', email: 'admin@rnsit.ac.in', role: 'ADMIN', usn: 'ADM001' },
        { id: '4', name: 'Prof. Anand Kumar', email: 'anand@rnsit.ac.in', role: 'FACULTY', usn: 'FAC102' },
    ];

    const filteredUsers = usersList.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Accounts Management</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => alert('Add User modal coming soon!')}>
                    <UserPlus size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {/* Search Bar */}
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

                {/* Role Filter Tabs */}
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

                {/* Users List */}
                <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                    <Text style={styles.resultCount}>Showing {filteredUsers.length} Users</Text>

                    {filteredUsers.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <View style={styles.cardLeft}>
                                <View style={[styles.avatar, item.role === 'ADMIN' ? styles.adminAvatar : item.role === 'FACULTY' ? styles.facultyAvatar : styles.studentAvatar]}>
                                    <Text style={styles.avatarText}>
                                        {item.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.userName}>{item.name}</Text>
                                    <Text style={styles.userEmail}>{item.email}</Text>
                                    <Text style={styles.userId}>ID: {item.usn}</Text>
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
                    ))}
                </ScrollView>
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
    addBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#2B6CB0',
        alignItems: 'center', justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#2D3748' },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: '#1A3A6B',
    },
    filterTabText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4A5568',
    },
    filterTabTextActive: {
        color: '#FFFFFF',
    },
    listContainer: { paddingBottom: 40 },
    resultCount: {
        fontSize: 12,
        fontWeight: '700',
        color: '#718096',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 42, height: 42, borderRadius: 21,
        alignItems: 'center', justifyContent: 'center',
    },
    adminAvatar: { backgroundColor: '#E53E3E' },
    facultyAvatar: { backgroundColor: '#1A3A6B' },
    studentAvatar: { backgroundColor: '#2B6CB0' },
    avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    userName: { fontSize: 13, fontWeight: '700', color: '#1A3A6B' },
    userEmail: { fontSize: 11, color: '#4A5568', marginTop: 1 },
    userId: { fontSize: 10, color: '#A0AEC0', marginTop: 2 },
    cardRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 3,
    },
    badgeText: { fontSize: 9, fontWeight: '700', color: '#3182CE' },
    actionIcons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
});