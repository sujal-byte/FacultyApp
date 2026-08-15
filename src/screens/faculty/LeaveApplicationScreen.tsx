// src/screens/LeaveApplicationScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Modal,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, LeaveApplication } from '../../types';
import { LEAVE_APPLICATIONS, TOTAL_LEAVE_QUOTA } from '../../data/mockData';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    Plus,
    XCircle,
    AlertCircle,
    ChevronDown,
    Send,
    X,
} from 'lucide-react-native';

type LeaveNav = StackNavigationProp<RootStackParamList, 'LeaveApplication'>;
type LeaveRoute = RouteProp<RootStackParamList, 'LeaveApplication'>;

interface Props {
    navigation: LeaveNav;
    route: LeaveRoute;
}

const TYPE_CONFIG: Record<LeaveApplication['type'], { label: string; color: string; bg: string; badgeBg: string }> = {
    casual: { label: 'Casual', color: '#2B6CB0', bg: '#EBF8FF', badgeBg: '#BEE3F8' },
    medical: { label: 'Medical', color: '#276749', bg: '#F0FFF4', badgeBg: '#C6F6D5' },
    emergency: { label: 'Emergency', color: '#E53E3E', bg: '#FFF5F5', badgeBg: '#FED7D7' },
    personal: { label: 'Personal', color: '#B7791F', bg: '#FFFFF0', badgeBg: '#FEFCBF' },
};

const STATUS_CONFIG: Record<LeaveApplication['status'], { label: string; color: string; bg: string; Icon: any }> = {
    approved: { label: 'Approved', color: '#276749', bg: '#F0FFF4', Icon: CheckCircle },
    pending: { label: 'Pending', color: '#B7791F', bg: '#FFFFF0', Icon: Clock },
    rejected: { label: 'Rejected', color: '#E53E3E', bg: '#FFF5F5', Icon: XCircle },
};

const LEAVE_TYPES: LeaveApplication['type'][] = ['casual', 'medical', 'emergency', 'personal'];

// ── Apply Leave Modal ──────────────────────────────────────────
const ApplyLeaveModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    onSubmit: (leave: Omit<LeaveApplication, 'id' | 'status' | 'appliedOn'>) => void;
    remainingLeaves: number;
}> = ({ visible, onClose, onSubmit, remainingLeaves }) => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reason, setReason] = useState('');
    const [type, setType] = useState<LeaveApplication['type']>('casual');
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const formatDateInput = (text: string) => {
        const digits = text.replace(/\D/g, '');
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    };

    const isValidDate = (d: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(d);

    const calcDays = (): number => {
        if (!isValidDate(fromDate) || !isValidDate(toDate)) return 0;
        const [fd, fm, fy] = fromDate.split('/');
        const [td, tm, ty] = toDate.split('/');
        const from = new Date(`${fy}-${fm}-${fd}`);
        const to = new Date(`${ty}-${tm}-${td}`);
        const diff = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 0;
    };

    const toDisplayDate = (d: string) => {
        if (!isValidDate(d)) return d;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const [day, month, year] = d.split('/');
        return `${day} ${months[parseInt(month) - 1]} ${year}`;
    };

    const canSubmit = isValidDate(fromDate) && isValidDate(toDate) &&
        reason.trim().length >= 10 && calcDays() > 0 && calcDays() <= remainingLeaves;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1200));
        setLoading(false);
        onSubmit({
            fromDate, toDate,
            fromDateDisplay: toDisplayDate(fromDate),
            toDateDisplay: toDisplayDate(toDate),
            days: calcDays(),
            reason: reason.trim(),
            type,
        });
        setFromDate(''); setToDate(''); setReason(''); setType('casual');
        onClose();
    };

    const days = calcDays();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
                <View style={styles.modalSheet}>
                    {/* Handle */}
                    <View style={styles.modalHandle} />

                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>Apply for Leave</Text>
                            <Text style={styles.modalSub}>{remainingLeaves} leaves remaining</Text>
                        </View>
                        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
                            <X size={18} color="#718096" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                        {/* Leave type */}
                        <Text style={styles.modalLabel}>Leave Type</Text>
                        <TouchableOpacity
                            style={styles.typeSelector}
                            onPress={() => setShowTypePicker(v => !v)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.typeDot, { backgroundColor: TYPE_CONFIG[type].color }]} />
                            <Text style={styles.typeSelectorText}>{TYPE_CONFIG[type].label} Leave</Text>
                            <ChevronDown size={16} color="#A0AEC0" strokeWidth={2} />
                        </TouchableOpacity>

                        {showTypePicker && (
                            <View style={styles.typePickerDropdown}>
                                {LEAVE_TYPES.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[
                                            styles.typePickerItem,
                                            t === type && { backgroundColor: TYPE_CONFIG[t].bg },
                                        ]}
                                        onPress={() => { setType(t); setShowTypePicker(false); }}
                                    >
                                        <View style={[styles.typeDot, { backgroundColor: TYPE_CONFIG[t].color }]} />
                                        <Text style={[
                                            styles.typePickerText,
                                            t === type && { color: TYPE_CONFIG[t].color, fontWeight: '700' },
                                        ]}>
                                            {TYPE_CONFIG[t].label} Leave
                                        </Text>
                                        {t === type && <CheckCircle size={15} color={TYPE_CONFIG[t].color} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Date row */}
                        <View style={styles.dateRow}>
                            <View style={styles.dateField}>
                                <Text style={styles.modalLabel}>From Date</Text>
                                <View style={styles.dateInput}>
                                    <Calendar size={15} color="#A0AEC0" strokeWidth={2} />
                                    <TextInput
                                        style={styles.dateInputText}
                                        placeholder="DD/MM/YYYY"
                                        placeholderTextColor="#CBD5E0"
                                        value={fromDate}
                                        onChangeText={t => setFromDate(formatDateInput(t))}
                                        keyboardType="number-pad"
                                        maxLength={10}
                                    />
                                </View>
                            </View>
                            <View style={styles.dateField}>
                                <Text style={styles.modalLabel}>To Date</Text>
                                <View style={styles.dateInput}>
                                    <Calendar size={15} color="#A0AEC0" strokeWidth={2} />
                                    <TextInput
                                        style={styles.dateInputText}
                                        placeholder="DD/MM/YYYY"
                                        placeholderTextColor="#CBD5E0"
                                        value={toDate}
                                        onChangeText={t => setToDate(formatDateInput(t))}
                                        keyboardType="number-pad"
                                        maxLength={10}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Days calculated */}
                        {days > 0 && (
                            <View style={[
                                styles.daysChip,
                                days > remainingLeaves && styles.daysChipError,
                            ]}>
                                <Text style={[
                                    styles.daysChipText,
                                    days > remainingLeaves && { color: '#E53E3E' },
                                ]}>
                                    {days > remainingLeaves
                                        ? `⚠️ ${days} days exceeds your remaining quota of ${remainingLeaves}`
                                        : `✓ ${days} day${days > 1 ? 's' : ''} of leave`}
                                </Text>
                            </View>
                        )}

                        {/* Reason */}
                        <Text style={styles.modalLabel}>Reason for Leave</Text>
                        <View style={styles.reasonInput}>
                            <TextInput
                                style={styles.reasonText}
                                placeholder="Describe your reason clearly (min. 10 characters)…"
                                placeholderTextColor="#CBD5E0"
                                value={reason}
                                onChangeText={setReason}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                        <Text style={[
                            styles.reasonCount,
                            reason.length < 10 && reason.length > 0 && { color: '#E53E3E' },
                        ]}>
                            {reason.length} characters {reason.length < 10 && reason.length > 0 ? '(min. 10)' : ''}
                        </Text>

                        {/* Warning if no leaves left */}
                        {remainingLeaves === 0 && (
                            <View style={styles.noLeavesWarning}>
                                <AlertCircle size={16} color="#E53E3E" />
                                <Text style={styles.noLeavesText}>
                                    You have exhausted your leave quota for this year.
                                </Text>
                            </View>
                        )}

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={!canSubmit || loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <>
                                    <Send size={17} color="#fff" strokeWidth={2.5} />
                                    <Text style={styles.submitBtnText}>Submit Application</Text>
                                </>
                            }
                        </TouchableOpacity>
                        <View style={{ height: 24 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// ── Main Screen ───────────────────────────────────────────────
const LeaveApplicationScreen: React.FC<Props> = ({ navigation, route }) => {
    const { faculty } = route.params;
    const [leaves, setLeaves] = useState<LeaveApplication[]>(LEAVE_APPLICATIONS);
    const [modalVisible, setModalVisible] = useState(false);

    const taken = leaves.filter(l => l.status === 'approved').reduce((s, l) => s + l.days, 0);
    const pending = leaves.filter(l => l.status === 'pending').reduce((s, l) => s + l.days, 0);
    const remaining = TOTAL_LEAVE_QUOTA - taken;
    const progressPct = Math.min((taken / TOTAL_LEAVE_QUOTA) * 100, 100);

    const progressColor = progressPct >= 80 ? '#E53E3E' : progressPct >= 60 ? '#D69E2E' : '#38A169';

    const handleNewLeave = (leave: Omit<LeaveApplication, 'id' | 'status' | 'appliedOn'>) => {
        const newLeave: LeaveApplication = {
            ...leave,
            id: `lv-${Date.now()}`,
            status: 'pending',
            appliedOn: new Date().toISOString().split('T')[0],
        };
        setLeaves(prev => [newLeave, ...prev]);
        Alert.alert(
            'Application Submitted',
            'Your leave application has been submitted and is pending HoD approval.',
            [{ text: 'OK' }]
        );
    };

    // Sort: pending first, then by date descending
    const sorted = [...leaves].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return b.fromDate.localeCompare(a.fromDate);
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                >
                    <ArrowLeft size={22} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Leave Application</Text>
                    <Text style={styles.headerSub}>{faculty.name}</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.quotaBadge}>
                        <Text style={styles.quotaNum}>{remaining}</Text>
                        <Text style={styles.quotaLbl}>left</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Leave Quota Card ── */}
                <View style={styles.quotaCard}>
                    <View style={styles.quotaTopRow}>
                        <View>
                            <Text style={styles.quotaTitle}>Annual Leave Quota</Text>
                            <Text style={styles.quotaYear}>Academic Year 2024–25</Text>
                        </View>
                        <View style={styles.quotaCircle}>
                            <Text style={styles.quotaCircleNum}>{taken}</Text>
                            <Text style={styles.quotaCircleSub}>used</Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, {
                            width: `${progressPct}%`,
                            backgroundColor: progressColor,
                        }]} />
                    </View>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressLabelLeft}>{taken} days taken</Text>
                        <Text style={styles.progressLabelRight}>{TOTAL_LEAVE_QUOTA} days total</Text>
                    </View>

                    {/* Stats row */}
                    <View style={styles.quotaStatsRow}>
                        <View style={styles.quotaStat}>
                            <Text style={[styles.quotaStatNum, { color: '#38A169' }]}>{remaining}</Text>
                            <Text style={styles.quotaStatLbl}>Remaining</Text>
                        </View>
                        <View style={styles.quotaStatDiv} />
                        <View style={styles.quotaStat}>
                            <Text style={[styles.quotaStatNum, { color: '#2B6CB0' }]}>{taken}</Text>
                            <Text style={styles.quotaStatLbl}>Approved</Text>
                        </View>
                        <View style={styles.quotaStatDiv} />
                        <View style={styles.quotaStat}>
                            <Text style={[styles.quotaStatNum, { color: '#D69E2E' }]}>{pending}</Text>
                            <Text style={styles.quotaStatLbl}>Pending</Text>
                        </View>
                        <View style={styles.quotaStatDiv} />
                        <View style={styles.quotaStat}>
                            <Text style={[styles.quotaStatNum, { color: '#E53E3E' }]}>
                                {leaves.filter(l => l.status === 'rejected').length}
                            </Text>
                            <Text style={styles.quotaStatLbl}>Rejected</Text>
                        </View>
                    </View>
                </View>

                {/* ── Leave History ── */}
                <View style={styles.sectionRow}>
                    <View style={styles.sectionLeft}>
                        <FileText size={15} color="#1A3A6B" strokeWidth={2} />
                        <Text style={styles.sectionTitle}>Leave History</Text>
                    </View>
                    <Text style={styles.sectionCount}>{leaves.length} applications</Text>
                </View>

                {sorted.map((leave) => {
                    const typeConf = TYPE_CONFIG[leave.type];
                    const statusConf = STATUS_CONFIG[leave.status];
                    const StatusIcon = statusConf.Icon;
                    const isMultiDay = leave.fromDate !== leave.toDate;

                    return (
                        <View key={leave.id} style={styles.leaveCard}>
                            {/* Left accent */}
                            <View style={[styles.leaveAccent, { backgroundColor: typeConf.color }]} />

                            <View style={styles.leaveCardInner}>
                                {/* Top row */}
                                <View style={styles.leaveTopRow}>
                                    {/* Date block */}
                                    <View style={[styles.leaveDateBlock, { backgroundColor: typeConf.bg }]}>
                                        <Text style={[styles.leaveDateDay, { color: typeConf.color }]}>
                                            {leave.fromDateDisplay.split(' ')[0]}
                                        </Text>
                                        <Text style={[styles.leaveDateMonth, { color: typeConf.color }]}>
                                            {leave.fromDateDisplay.split(' ')[1]}
                                        </Text>
                                        <Text style={[styles.leaveDateYear, { color: typeConf.color }]}>
                                            {leave.fromDateDisplay.split(' ')[2]}
                                        </Text>
                                    </View>

                                    <View style={styles.leaveMiddle}>
                                        {/* Badges row */}
                                        <View style={styles.leaveBadgesRow}>
                                            <View style={[styles.typeBadge, { backgroundColor: typeConf.badgeBg }]}>
                                                <Text style={[styles.typeBadgeText, { color: typeConf.color }]}>
                                                    {typeConf.label}
                                                </Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
                                                <StatusIcon size={10} color={statusConf.color} strokeWidth={2.5} />
                                                <Text style={[styles.statusBadgeText, { color: statusConf.color }]}>
                                                    {statusConf.label}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Date range */}
                                        <Text style={styles.leaveDateRange}>
                                            {isMultiDay
                                                ? `${leave.fromDateDisplay} → ${leave.toDateDisplay}`
                                                : leave.fromDateDisplay}
                                        </Text>

                                        {/* Days chip */}
                                        <View style={styles.leaveDaysChip}>
                                            <Text style={styles.leaveDaysText}>
                                                {leave.days} day{leave.days > 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Reason */}
                                <Text style={styles.leaveReason} numberOfLines={2}>
                                    {leave.reason}
                                </Text>

                                {/* Footer */}
                                <View style={styles.leaveFooter}>
                                    <Text style={styles.leaveAppliedOn}>
                                        Applied: {leave.appliedOn}
                                    </Text>
                                    {!!leave.remarks && (
                                        <Text style={styles.leaveRemarks} numberOfLines={1}>
                                            💬 {leave.remarks}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Apply for New Leave button */}
            <View style={styles.applyBtnContainer}>
                <TouchableOpacity
                    style={[
                        styles.applyBtn,
                        remaining === 0 && styles.applyBtnDisabled,
                    ]}
                    onPress={() => setModalVisible(true)}
                    disabled={remaining === 0}
                    activeOpacity={0.85}
                >
                    <Plus size={20} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.applyBtnText}>Apply for New Leave</Text>
                </TouchableOpacity>
            </View>

            <ApplyLeaveModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleNewLeave}
                remainingLeaves={remaining}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0F2754' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12,
        backgroundColor: '#0F2754',
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
    headerRight: { width: 48, alignItems: 'flex-end' },
    quotaBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
        alignItems: 'center',
    },
    quotaNum: { fontSize: 16, fontWeight: '800', color: '#fff' },
    quotaLbl: { fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },

    // Scroll
    scroll: { flex: 1, backgroundColor: '#F0F4F8' },
    scrollContent: { padding: 14 },

    // Quota card
    quotaCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 18,
        marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0',
        elevation: 3, shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10,
    },
    quotaTopRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 16,
    },
    quotaTitle: { fontSize: 15, fontWeight: '800', color: '#1A3A6B' },
    quotaYear: { fontSize: 11, color: '#A0AEC0', marginTop: 2 },
    quotaCircle: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#EBF8FF', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#BEE3F8',
    },
    quotaCircleNum: { fontSize: 18, fontWeight: '800', color: '#1A3A6B' },
    quotaCircleSub: { fontSize: 9, fontWeight: '600', color: '#718096' },
    progressTrack: {
        height: 8, backgroundColor: '#EDF2F7', borderRadius: 4,
        overflow: 'hidden', marginBottom: 6,
    },
    progressFill: { height: '100%', borderRadius: 4 },
    progressLabels: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16,
    },
    progressLabelLeft: { fontSize: 11, color: '#718096', fontWeight: '600' },
    progressLabelRight: { fontSize: 11, color: '#718096', fontWeight: '600' },
    quotaStatsRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#F7FAFC', borderRadius: 10,
        paddingVertical: 12,
    },
    quotaStat: { alignItems: 'center', flex: 1 },
    quotaStatNum: { fontSize: 18, fontWeight: '800' },
    quotaStatLbl: { fontSize: 9, color: '#A0AEC0', fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
    quotaStatDiv: { width: 1, height: 28, backgroundColor: '#E2E8F0' },

    // Section header
    sectionRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 12,
    },
    sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A3A6B' },
    sectionCount: { fontSize: 12, color: '#A0AEC0', fontWeight: '600' },

    // Leave card
    leaveCard: {
        flexDirection: 'row', backgroundColor: '#fff',
        borderRadius: 14, marginBottom: 10,
        overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0',
        elevation: 2, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
    },
    leaveAccent: { width: 4, flexShrink: 0 },
    leaveCardInner: { flex: 1, padding: 13 },
    leaveTopRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    leaveDateBlock: {
        width: 52, borderRadius: 10, padding: 8,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    leaveDateDay: { fontSize: 20, fontWeight: '800', lineHeight: 22 },
    leaveDateMonth: { fontSize: 11, fontWeight: '700' },
    leaveDateYear: { fontSize: 10, fontWeight: '500', opacity: 0.7 },
    leaveMiddle: { flex: 1 },
    leaveBadgesRow: { flexDirection: 'row', gap: 6, marginBottom: 5, flexWrap: 'wrap' },
    typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
    typeBadgeText: { fontSize: 10, fontWeight: '700' },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5,
    },
    statusBadgeText: { fontSize: 10, fontWeight: '700' },
    leaveDateRange: { fontSize: 11, color: '#4A5568', fontWeight: '600', marginBottom: 5 },
    leaveDaysChip: {
        alignSelf: 'flex-start',
        backgroundColor: '#EDF2F7', paddingHorizontal: 7,
        paddingVertical: 2, borderRadius: 6,
    },
    leaveDaysText: { fontSize: 10, fontWeight: '700', color: '#4A5568' },
    leaveReason: { fontSize: 12, color: '#4A5568', lineHeight: 18, marginBottom: 8 },
    leaveFooter: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
    leaveAppliedOn: { fontSize: 10, color: '#A0AEC0' },
    leaveRemarks: { fontSize: 10, color: '#718096', flex: 1, textAlign: 'right' },

    // Apply button
    applyBtnContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#EDF2F7',
        padding: 14, paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    },
    applyBtn: {
        backgroundColor: '#1A3A6B', borderRadius: 14,
        paddingVertical: 15, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: 10,
        elevation: 4, shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    applyBtnDisabled: { backgroundColor: '#A0AEC0', elevation: 0 },
    applyBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '90%',
        elevation: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15, shadowRadius: 20,
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#E2E8F0', alignSelf: 'center', marginTop: 12, marginBottom: 4,
    },
    modalHeader: {
        flexDirection: 'row', alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#EDF2F7',
    },
    modalTitle: { fontSize: 17, fontWeight: '800', color: '#1A3A6B' },
    modalSub: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
    modalCloseBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#F7FAFC', alignItems: 'center', justifyContent: 'center',
    },
    modalScroll: { paddingHorizontal: 20 },
    modalLabel: {
        fontSize: 12, fontWeight: '700', color: '#4A5568',
        marginTop: 16, marginBottom: 7, letterSpacing: 0.2,
    },
    typeSelector: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#F7FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
        borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12,
    },
    typeDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
    typeSelectorText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#2D3748' },
    typePickerDropdown: {
        backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
        borderColor: '#E2E8F0', overflow: 'hidden', marginTop: 4,
        elevation: 6, shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
    },
    typePickerItem: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 14, paddingVertical: 12,
    },
    typePickerText: { flex: 1, fontSize: 13, color: '#4A5568', fontWeight: '500' },
    dateRow: { flexDirection: 'row', gap: 10 },
    dateField: { flex: 1 },
    dateInput: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F7FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
        borderRadius: 11, paddingHorizontal: 12, paddingVertical: 11,
    },
    dateInputText: { flex: 1, fontSize: 13, color: '#2D3748', fontWeight: '500' },
    daysChip: {
        backgroundColor: '#F0FFF4', borderRadius: 8, padding: 10,
        marginTop: 8, borderWidth: 1, borderColor: '#C6F6D5',
    },
    daysChipError: { backgroundColor: '#FFF5F5', borderColor: '#FED7D7' },
    daysChipText: { fontSize: 12, fontWeight: '700', color: '#276749', textAlign: 'center' },
    reasonInput: {
        backgroundColor: '#F7FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
        borderRadius: 11, padding: 12, minHeight: 110,
    },
    reasonText: { fontSize: 13, color: '#2D3748', lineHeight: 20 },
    reasonCount: { fontSize: 11, color: '#A0AEC0', marginTop: 4, textAlign: 'right' },
    noLeavesWarning: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FFF5F5', borderRadius: 10, padding: 12,
        borderWidth: 1, borderColor: '#FED7D7', marginTop: 12,
    },
    noLeavesText: { fontSize: 12, color: '#E53E3E', fontWeight: '600', flex: 1 },
    submitBtn: {
        backgroundColor: '#1A3A6B', borderRadius: 12, paddingVertical: 15,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, marginTop: 20,
        elevation: 4, shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    submitBtnDisabled: { backgroundColor: '#A0AEC0', elevation: 0, shadowOpacity: 0 },
    submitBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

export default LeaveApplicationScreen;