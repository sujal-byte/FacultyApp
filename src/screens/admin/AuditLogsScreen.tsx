import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Search,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    Info,
    Clock,
    RefreshCw,
} from 'lucide-react-native';
import { adminApi, AuditLogItem } from '../../services/api';

export default function AuditLogsScreen({ navigation }: any) {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('ALL');

    const fetchLogs = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const response = await adminApi.getAuditLogs();
            setLogs(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            console.error('Failed to fetch audit logs:', err);
            setError('Failed to load audit logs. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const formatTimestamp = (dateString?: string): string => {
        if (!dateString) return 'Just now';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHours = Math.floor(diffMin / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffSec < 60) return 'Just now';
            if (diffMin < 60) return `${diffMin}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;

            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const getLogType = (log: any): string => {
        if (log.type) return log.type;
        const action = (log.action || '').toUpperCase();
        if (
            action.includes('FAIL') ||
            action.includes('DELETE') ||
            action.includes('REMOVE') ||
            action.includes('DANGER') ||
            action.includes('BLOCK') ||
            action.includes('DENIED')
        ) {
            return 'DANGER';
        }
        if (
            action.includes('CREATE') ||
            action.includes('SUCCESS') ||
            action.includes('ADD') ||
            action.includes('APPROVED') ||
            action.includes('REGISTER')
        ) {
            return 'SUCCESS';
        }
        if (
            action.includes('UPDATE') ||
            action.includes('EDIT') ||
            action.includes('WARN') ||
            action.includes('CHANGE') ||
            action.includes('MODIFY')
        ) {
            return 'WARNING';
        }
        return 'INFO';
    };

    const filteredLogs = logs.filter((log: any) => {
        const action = log.action || '';
        const user = log.admin?.name || log.admin?.email || log.user || 'Admin';
        const detail = log.details || log.detail || '';
        const logType = getLogType(log);

        const matchesSearch =
            action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            detail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' || logType === filter;
        return matchesSearch && matchesFilter;
    });

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'DANGER':
                return <ShieldAlert size={20} color="#E53E3E" />;
            case 'SUCCESS':
                return <CheckCircle2 size={20} color="#38A169" />;
            case 'WARNING':
                return <AlertTriangle size={20} color="#D69E2E" />;
            default:
                return <Info size={20} color="#3182CE" />;
        }
    };

    const getLogBg = (type: string) => {
        switch (type) {
            case 'DANGER':
                return '#FFF5F5';
            case 'SUCCESS':
                return '#F0FFF4';
            case 'WARNING':
                return '#FFFFF0';
            default:
                return '#EBF8FF';
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
                    accessibilityLabel="Go back"
                >
                    <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>System Audit Logs</Text>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => fetchLogs(true)}
                    accessibilityLabel="Refresh audit logs"
                >
                    <RefreshCw size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={18} color="#A0AEC0" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search logs by action, detail or user..."
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
                            <Text
                                style={[
                                    styles.filterTabText,
                                    filter === f && styles.filterTabTextActive,
                                ]}
                            >
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Logs List */}
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#1A3A6B" />
                        <Text style={styles.statusText}>Loading audit logs...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <AlertTriangle size={36} color="#E53E3E" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryBtn}
                            onPress={() => fetchLogs()}
                        >
                            <Text style={styles.retryBtnText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => fetchLogs(true)}
                                colors={['#1A3A6B']}
                                tintColor="#1A3A6B"
                            />
                        }
                    >
                        <View style={styles.listHeader}>
                            <Text style={styles.resultCount}>
                                {filteredLogs.length} Events Found
                            </Text>
                        </View>

                        {filteredLogs.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Info size={32} color="#A0AEC0" />
                                <Text style={styles.emptyTitle}>No audit logs found</Text>
                                <Text style={styles.emptySubtitle}>
                                    {searchQuery || filter !== 'ALL'
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'No system activity has been recorded yet'}
                                </Text>
                            </View>
                        ) : (
                            filteredLogs.map((log: any) => {
                                const logType = getLogType(log);
                                const timeStr = formatTimestamp(log.createdAt || log.time);
                                const userName =
                                    log.admin?.name || log.admin?.email || log.user || 'System';
                                const detailText = log.details || log.detail || '';

                                return (
                                    <View key={log.id} style={styles.logCard}>
                                        <View
                                            style={[
                                                styles.iconWrap,
                                                { backgroundColor: getLogBg(logType) },
                                            ]}
                                        >
                                            {getLogIcon(logType)}
                                        </View>
                                        <View style={styles.logContent}>
                                            <View style={styles.logHeader}>
                                                <Text style={styles.logAction}>{log.action}</Text>
                                                <View style={styles.timeWrap}>
                                                    <Clock size={10} color="#A0AEC0" />
                                                    <Text style={styles.logTime}>{timeStr}</Text>
                                                </View>
                                            </View>
                                            {detailText ? (
                                                <Text style={styles.logDetail}>{detailText}</Text>
                                            ) : null}
                                            <Text style={styles.logUser}>Admin/User: {userName}</Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                )}
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
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
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
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2D3748',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 12,
        color: '#718096',
        textAlign: 'center',
        marginTop: 4,
    },
});