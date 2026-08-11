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
import {
    ArrowLeft,
    Search,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    Info,
    Clock
} from 'lucide-react-native';

export default function AuditLogsScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('ALL');

    // Mock data for system audit logs
    const logsData = [
        { id: '1', action: 'Failed Login Attempt', user: 'Unknown IP', time: '10 mins ago', type: 'DANGER', detail: 'Multiple failed attempts from 192.168.1.45' },
        { id: '2', action: 'User Account Created', user: 'Admin User', time: '1 hour ago', type: 'SUCCESS', detail: 'New faculty account created for Dr. Sharma' },
        { id: '3', action: 'Notice Broadcasted', user: 'Admin User', time: '3 hours ago', type: 'INFO', detail: 'Sent "Exam Schedule" to Students' },
        { id: '4', action: 'System Update', user: 'System', time: 'Yesterday', type: 'WARNING', detail: 'Database backup completed with minor delays' },
        { id: '5', action: 'Attendance Modified', user: 'Prof. Anand Kumar', time: 'Yesterday', type: 'INFO', detail: 'Updated record for CS-101' },
    ];

    const filteredLogs = logsData.filter((log) => {
        const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || log.user.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' || log.type === filter;
        return matchesSearch && matchesFilter;
    });

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'DANGER': return <ShieldAlert size={20} color="#E53E3E" />;
            case 'SUCCESS': return <CheckCircle2 size={20} color="#38A169" />;
            case 'WARNING': return <AlertTriangle size={20} color="#D69E2E" />;
            default: return <Info size={20} color="#3182CE" />;
        }
    };

    const getLogBg = (type: string) => {
        switch (type) {
            case 'DANGER': return '#FFF5F5';
            case 'SUCCESS': return '#F0FFF4';
            case 'WARNING': return '#FFFFF0';
            default: return '#EBF8FF';
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
                <Text style={styles.headerTitle}>System Audit Logs</Text>
                <View style={{ width: 36 }} /> {/* Empty view for balance */}
            </View>

            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={18} color="#A0AEC0" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search logs by action or user..."
                        placeholderTextColor="#A0AEC0"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterRow}
                >
                    {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'DANGER'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, filter === f && styles.filterTabActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Logs List */}
                <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.listHeader}>
                        <Text style={styles.resultCount}>{filteredLogs.length} Events Found</Text>
                    </View>

                    {filteredLogs.map((log) => (
                        <View key={log.id} style={styles.logCard}>
                            <View style={[styles.iconWrap, { backgroundColor: getLogBg(log.type) }]}>
                                {getLogIcon(log.type)}
                            </View>
                            <View style={styles.logContent}>
                                <View style={styles.logHeader}>
                                    <Text style={styles.logAction}>{log.action}</Text>
                                    <View style={styles.timeWrap}>
                                        <Clock size={10} color="#A0AEC0" />
                                        <Text style={styles.logTime}>{log.time}</Text>
                                    </View>
                                </View>
                                <Text style={styles.logDetail}>{log.detail}</Text>
                                <Text style={styles.logUser}>User: {log.user}</Text>
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
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingTop: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#2D3748' },
    filterScroll: {
        maxHeight: 40,
        marginBottom: 12,
    },
    filterRow: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterTab: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
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
    listContainer: { paddingHorizontal: 16, paddingBottom: 40 },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    resultCount: {
        fontSize: 12,
        fontWeight: '700',
        color: '#718096',
        textTransform: 'uppercase',
    },
    logCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    iconWrap: {
        width: 40, height: 40,
        borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12,
    },
    logContent: { flex: 1 },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    logAction: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A3A6B',
        flex: 1,
        paddingRight: 8,
    },
    timeWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    logTime: {
        fontSize: 10,
        color: '#A0AEC0',
        fontWeight: '600',
    },
    logDetail: {
        fontSize: 12,
        color: '#4A5568',
        marginBottom: 6,
        lineHeight: 16,
    },
    logUser: {
        fontSize: 11,
        color: '#718096',
        fontWeight: '600',
    },
});