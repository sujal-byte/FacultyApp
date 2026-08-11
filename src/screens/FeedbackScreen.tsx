// src/screens/FeedbackScreen.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, FeedbackPayload } from '../types';
import {
    ArrowLeft,
    Bug,
    CheckCircle,
    HelpCircle,
    Lightbulb,
    MessageSquare,
    Send,
    ShieldAlert,
    X,
    AlertOctagon,
    ArrowRight,
} from 'lucide-react-native';

type FeedbackNav = StackNavigationProp<RootStackParamList, 'Feedback'>;
type FeedbackRoute = RouteProp<RootStackParamList, 'Feedback'>;

interface Props {
    navigation: FeedbackNav;
    route: FeedbackRoute;
}

type Category = FeedbackPayload['category'];

const CATEGORIES: { id: Category; label: string; Icon: any; color: string; bg: string }[] = [
    { id: 'suggestion', label: 'Suggestion', Icon: Lightbulb, color: '#D69E2E', bg: '#FFFFF0' },
    { id: 'bug', label: 'Bug Report', Icon: Bug, color: '#E53E3E', bg: '#FFF5F5' },
    { id: 'question', label: 'Question', Icon: HelpCircle, color: '#2B6CB0', bg: '#EBF8FF' },
    { id: 'other', label: 'Other', Icon: MessageSquare, color: '#718096', bg: '#F7FAFC' },
];

type AdminRequestType = 'urgent_bug' | 'admin_request' | 'other_urgent';

const ADMIN_MSG_TYPES: { id: AdminRequestType; label: string; Icon: any; color: string; bg: string }[] = [
    { id: 'urgent_bug', label: 'Critical Bug', Icon: Bug, color: '#E53E3E', bg: '#FFF5F5' },
    { id: 'admin_request', label: 'Admin Request', Icon: ShieldAlert, color: '#D69E2E', bg: '#FFFFF0' },
    { id: 'other_urgent', label: 'Other Urgent Issue', Icon: AlertOctagon, color: '#718096', bg: '#F7FAFC' },
];

const MAX_CHARS = 500;

const FeedbackScreen: React.FC<Props> = ({ navigation, route }) => {
    const { facultyId } = route.params;
    const [category, setCategory] = useState<Category>('suggestion');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Contact Admin States
    const [adminModalVisible, setAdminModalVisible] = useState(false);
    const [adminMessage, setAdminMessage] = useState('');
    const [adminMsgType, setAdminMsgType] = useState<AdminRequestType>('urgent_bug');
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminSubmitted, setAdminSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim() || message.trim().length < 10) return;

        setLoading(true);

        const payload: FeedbackPayload = {
            facultyId,
            category,
            message: message.trim(),
            timestamp: new Date().toISOString(),
        };

        // TODO: Replace with POST to /api/feedback in production (Node.js + PostgreSQL)
        console.log('Feedback payload ready for API:', payload);
        await new Promise((r) => setTimeout(r, 1500));

        setLoading(false);
        setSubmitted(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    const handleAdminSubmit = async () => {
        if (!adminMessage.trim() || adminMessage.trim().length < 10) return;

        setAdminLoading(true);

        const payload = {
            facultyId,
            type: adminMsgType,
            message: adminMessage.trim(),
            priority: 'immediate',
            timestamp: new Date().toISOString(),
        };

        // Simulated API call to send admin message
        console.log('Admin support payload ready for API:', payload);
        await new Promise((r) => setTimeout(r, 1500));

        setAdminLoading(false);
        setAdminSubmitted(true);
    };

    if (submitted) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
                    <View style={styles.successIconWrap}>
                        <CheckCircle size={64} color="#38A169" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.successTitle}>Feedback Submitted!</Text>
                    <Text style={styles.successBody}>
                        Thank you for helping us improve. Our team will review your feedback shortly.
                    </Text>
                    <Text style={styles.successRef}>
                        Ref: FB-{Date.now().toString().slice(-6)}
                    </Text>
                    <TouchableOpacity
                        style={styles.backToDashBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <ArrowLeft size={18} color="#FFFFFF" />
                        <Text style={styles.backToDashText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        );
    }

    const selectedCat = CATEGORIES.find((c) => c.id === category)!;
    const charCount = message.length;
    const isValid = message.trim().length >= 10;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.kav}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <ArrowLeft size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Feedback & Help</Text>
                        <Text style={styles.headerSubtitle}>Your input shapes the portal</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Intro Card */}
                    <View style={styles.introCard}>
                        <MessageSquare size={22} color="#1A3A6B" strokeWidth={1.8} />
                        <View style={styles.introText}>
                            <Text style={styles.introTitle}>Help us improve</Text>
                            <Text style={styles.introBody}>
                                Report a bug, share a suggestion, or ask a question. All submissions are reviewed by the IT & Academic team.
                            </Text>
                        </View>
                    </View>

                    {/* Admin Contact Card */}
                    <View style={styles.adminContactCard}>
                        <View style={styles.adminContactHeader}>
                            <View style={styles.adminIconWrapper}>
                                <ShieldAlert size={20} color="#E53E3E" strokeWidth={2} />
                            </View>
                            <View style={styles.adminTextWrapper}>
                                <Text style={styles.adminCardTitle}>Direct Contact with Admin</Text>
                                <Text style={styles.adminCardBody}>
                                    Need to report an issue or request that needs to be fixed immediately? Send a direct message to the administrator.
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.adminBtn}
                            onPress={() => {
                                setAdminMessage('');
                                setAdminSubmitted(false);
                                setAdminModalVisible(true);
                            }}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Contact Administrator"
                        >
                            <Text style={styles.adminBtnText}>Contact Administrator</Text>
                            <ArrowRight size={15} color="#E53E3E" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    {/* Category Selector */}
                    <Text style={styles.fieldLabel}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => {
                            const isActive = category === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        isActive && {
                                            backgroundColor: cat.bg,
                                            borderColor: cat.color,
                                            borderWidth: 2,
                                        },
                                    ]}
                                    onPress={() => setCategory(cat.id)}
                                    activeOpacity={0.7}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isActive }}
                                    accessibilityLabel={cat.label}
                                >
                                    <cat.Icon
                                        size={18}
                                        color={isActive ? cat.color : '#A0AEC0'}
                                        strokeWidth={2}
                                    />
                                    <Text
                                        style={[
                                            styles.categoryLabel,
                                            isActive && { color: cat.color, fontWeight: '700' },
                                        ]}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Message Input */}
                    <View style={styles.messageSection}>
                        <View style={styles.messageLabelRow}>
                            <Text style={styles.fieldLabel}>Message</Text>
                            <Text
                                style={[
                                    styles.charCount,
                                    charCount > MAX_CHARS * 0.85 && { color: '#E53E3E' },
                                ]}
                            >
                                {charCount}/{MAX_CHARS}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.textAreaWrapper,
                                charCount > 0 && !isValid && styles.textAreaError,
                            ]}
                        >
                            <TextInput
                                style={styles.textArea}
                                value={message}
                                onChangeText={(t) => setMessage(t.slice(0, MAX_CHARS))}
                                placeholder={`Describe your ${selectedCat.label.toLowerCase()} in detail (min. 10 characters)…`}
                                placeholderTextColor="#CBD5E0"
                                multiline
                                numberOfLines={7}
                                textAlignVertical="top"
                                returnKeyType="default"
                                accessibilityLabel="Feedback message"
                            />
                        </View>

                        {charCount > 0 && !isValid && (
                            <Text style={styles.minCharHint}>Minimum 10 characters required.</Text>
                        )}
                    </View>

                    {/* Faculty ID display */}
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Submitting as:</Text>
                        <Text style={styles.metaValue}>{facultyId}</Text>
                    </View>

                    {/* Guidelines */}
                    <View style={styles.guidelines}>
                        <Text style={styles.guidelinesTitle}>Submission guidelines</Text>
                        <Text style={styles.guidelinesItem}>• Be specific — include screen names, steps to reproduce, etc.</Text>
                        <Text style={styles.guidelinesItem}>• Do not share passwords or sensitive data in this form.</Text>
                        <Text style={styles.guidelinesItem}>• For urgent IT issues call ext. 4200 directly.</Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (!isValid || loading) && styles.submitBtnDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!isValid || loading}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Submit feedback"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Send size={18} color="#FFFFFF" strokeWidth={2.5} />
                                <Text style={styles.submitBtnText}>Submit Feedback</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 24 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={adminModalVisible}
                onRequestClose={() => {
                    if (!adminLoading) setAdminModalVisible(false);
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        {/* Close button in header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Contact Administrator</Text>
                            {!adminLoading && (
                                <TouchableOpacity
                                    onPress={() => setAdminModalVisible(false)}
                                    style={styles.modalCloseBtn}
                                    accessibilityRole="button"
                                    accessibilityLabel="Close modal"
                                >
                                    <X size={20} color="#718096" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {adminSubmitted ? (
                            <View style={styles.modalSuccess}>
                                <View style={styles.modalSuccessIconWrap}>
                                    <CheckCircle size={54} color="#38A169" strokeWidth={1.5} />
                                </View>
                                <Text style={styles.modalSuccessTitle}>Urgent Request Sent</Text>
                                <Text style={styles.modalSuccessText}>
                                    Your request has been dispatched directly to the admin queue. An administrator will follow up immediately.
                                </Text>
                                <TouchableOpacity
                                    style={styles.modalSuccessCloseBtn}
                                    onPress={() => setAdminModalVisible(false)}
                                    activeOpacity={0.8}
                                    accessibilityRole="button"
                                    accessibilityLabel="Close success message"
                                >
                                    <Text style={styles.modalSuccessCloseText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView
                                contentContainerStyle={styles.modalForm}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.modalSubtitle}>
                                    Send a request or report a critical issue requiring immediate resolution.
                                </Text>

                                {/* Request Type Selector */}
                                <Text style={styles.modalFieldLabel}>Request Type</Text>
                                <View style={styles.adminTypeGrid}>
                                    {ADMIN_MSG_TYPES.map((typeObj) => {
                                        const isActive = adminMsgType === typeObj.id;
                                        return (
                                            <TouchableOpacity
                                                key={typeObj.id}
                                                style={[
                                                    styles.adminTypeChip,
                                                    isActive && {
                                                        backgroundColor: typeObj.bg,
                                                        borderColor: typeObj.color,
                                                        borderWidth: 2,
                                                    },
                                                ]}
                                                onPress={() => setAdminMsgType(typeObj.id)}
                                                activeOpacity={0.7}
                                                disabled={adminLoading}
                                                accessibilityRole="radio"
                                                accessibilityState={{ checked: isActive }}
                                                accessibilityLabel={typeObj.label}
                                            >
                                                <typeObj.Icon
                                                    size={16}
                                                    color={isActive ? typeObj.color : '#A0AEC0'}
                                                    strokeWidth={2}
                                                />
                                                <Text
                                                    style={[
                                                        styles.adminTypeLabel,
                                                        isActive && { color: typeObj.color, fontWeight: '700' },
                                                    ]}
                                                >
                                                    {typeObj.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Message field */}
                                <View style={styles.modalMessageSection}>
                                    <View style={styles.modalMessageLabelRow}>
                                        <Text style={styles.modalFieldLabel}>Message to Admin</Text>
                                        <Text
                                            style={[
                                                styles.modalCharCount,
                                                adminMessage.length > MAX_CHARS * 0.85 && { color: '#E53E3E' },
                                            ]}
                                        >
                                            {adminMessage.length}/{MAX_CHARS}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.modalTextAreaWrapper,
                                            adminMessage.length > 0 && adminMessage.trim().length < 10 && styles.modalTextAreaError,
                                        ]}
                                    >
                                        <TextInput
                                            style={styles.modalTextArea}
                                            value={adminMessage}
                                            onChangeText={(t) => setAdminMessage(t.slice(0, MAX_CHARS))}
                                            placeholder="Describe the issue or request that needs administrative support (min. 10 characters)..."
                                            placeholderTextColor="#CBD5E0"
                                            multiline
                                            numberOfLines={6}
                                            textAlignVertical="top"
                                            returnKeyType="default"
                                            editable={!adminLoading}
                                            accessibilityLabel="Admin message content"
                                        />
                                    </View>

                                    {adminMessage.length > 0 && adminMessage.trim().length < 10 && (
                                        <Text style={styles.modalMinCharHint}>Minimum 10 characters required.</Text>
                                    )}
                                </View>

                                <View style={styles.modalInfoBox}>
                                    <Text style={styles.modalInfoText}>
                                        ⚠️ Note: Messages sent via this channel are flagged as HIGH PRIORITY and trigger immediate alerts for administrators.
                                    </Text>
                                </View>

                                {/* Action buttons */}
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.modalSubmitBtn,
                                            (adminMessage.trim().length < 10 || adminLoading) && styles.modalSubmitBtnDisabled,
                                        ]}
                                        onPress={handleAdminSubmit}
                                        disabled={adminMessage.trim().length < 10 || adminLoading}
                                        activeOpacity={0.8}
                                        accessibilityRole="button"
                                        accessibilityLabel="Send message to Admin"
                                    >
                                        {adminLoading ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <>
                                                <Send size={16} color="#FFFFFF" strokeWidth={2.5} />
                                                <Text style={styles.modalSubmitBtnText}>Send to Admin</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0F2754' },
    kav: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 14,
        backgroundColor: '#0F2754',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.55)',
        marginTop: 2,
    },
    scroll: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
    },
    scrollContent: {
        padding: 20,
    },
    introCard: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#EBF8FF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: '#BEE3F8',
        alignItems: 'flex-start',
    },
    introText: { flex: 1 },
    introTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A3A6B',
        marginBottom: 4,
    },
    introBody: {
        fontSize: 12,
        color: '#4A5568',
        lineHeight: 18,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A5568',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 22,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
    },
    categoryLabel: {
        fontSize: 13,
        color: '#718096',
        fontWeight: '600',
    },
    messageSection: {
        marginBottom: 16,
    },
    messageLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    charCount: {
        fontSize: 12,
        color: '#A0AEC0',
        fontWeight: '600',
    },
    textAreaWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    textAreaError: {
        borderColor: '#FC8181',
        backgroundColor: '#FFF5F5',
    },
    textArea: {
        fontSize: 14,
        color: '#2D3748',
        padding: 14,
        minHeight: 160,
        lineHeight: 22,
    },
    minCharHint: {
        fontSize: 11,
        color: '#E53E3E',
        marginTop: 5,
        marginLeft: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: '#EDF2F7',
        borderRadius: 10,
        marginBottom: 20,
    },
    metaLabel: {
        fontSize: 12,
        color: '#718096',
        fontWeight: '600',
    },
    metaValue: {
        fontSize: 12,
        color: '#1A3A6B',
        fontWeight: '800',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    guidelines: {
        backgroundColor: '#FFFFF0',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#FAF089',
        marginBottom: 24,
    },
    guidelinesTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#744210',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    guidelinesItem: {
        fontSize: 12,
        color: '#744210',
        lineHeight: 20,
        opacity: 0.85,
    },
    submitBtn: {
        backgroundColor: '#1A3A6B',
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        elevation: 4,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitBtnDisabled: {
        backgroundColor: '#A0AEC0',
        elevation: 0,
        shadowOpacity: 0,
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    // Success state
    successContainer: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    successIconWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0FFF4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#C6F6D5',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A3A6B',
        marginBottom: 12,
        textAlign: 'center',
    },
    successBody: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
    },
    successRef: {
        fontSize: 13,
        fontWeight: '700',
        color: '#A0AEC0',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 32,
    },
    backToDashBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1A3A6B',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 14,
        elevation: 4,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    backToDashText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    adminContactCard: {
        backgroundColor: '#FFF5F5',
        borderRadius: 14,
        padding: 16,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: '#FEB2B2',
    },
    adminContactHeader: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    adminIconWrapper: {
        backgroundColor: '#FED7D7',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    adminTextWrapper: {
        flex: 1,
    },
    adminCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9B2C2C',
        marginBottom: 4,
    },
    adminCardBody: {
        fontSize: 12,
        color: '#742A2A',
        lineHeight: 18,
    },
    adminBtn: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderColor: '#FEB2B2',
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
    },
    adminBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#E53E3E',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 39, 84, 0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    modalCloseBtn: {
        padding: 4,
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#718096',
        marginBottom: 18,
        lineHeight: 18,
    },
    modalForm: {
        paddingBottom: 30,
    },
    modalFieldLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A5568',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    adminTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 18,
    },
    adminTypeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    adminTypeLabel: {
        fontSize: 12,
        color: '#718096',
        fontWeight: '600',
    },
    modalMessageSection: {
        marginBottom: 16,
    },
    modalMessageLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalCharCount: {
        fontSize: 11,
        color: '#A0AEC0',
        fontWeight: '600',
    },
    modalTextAreaWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    modalTextAreaError: {
        borderColor: '#FC8181',
        backgroundColor: '#FFF5F5',
    },
    modalTextArea: {
        fontSize: 14,
        color: '#2D3748',
        padding: 12,
        minHeight: 120,
        lineHeight: 20,
    },
    modalMinCharHint: {
        fontSize: 11,
        color: '#E53E3E',
        marginTop: 4,
        marginLeft: 2,
    },
    modalInfoBox: {
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#FED7D7',
        marginBottom: 20,
    },
    modalInfoText: {
        fontSize: 11,
        color: '#9B2C2C',
        lineHeight: 16,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    modalSubmitBtn: {
        flex: 1,
        backgroundColor: '#E53E3E',
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 2,
        shadowColor: '#E53E3E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    modalSubmitBtnDisabled: {
        backgroundColor: '#A0AEC0',
        elevation: 0,
        shadowOpacity: 0,
    },
    modalSubmitBtnText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    modalSuccess: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 10,
    },
    modalSuccessIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0FFF4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#C6F6D5',
    },
    modalSuccessTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A3A6B',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSuccessText: {
        fontSize: 13,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalSuccessCloseBtn: {
        backgroundColor: '#1A3A6B',
        paddingHorizontal: 36,
        paddingVertical: 12,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    modalSuccessCloseText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});

export default FeedbackScreen;