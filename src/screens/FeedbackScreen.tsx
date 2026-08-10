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

const MAX_CHARS = 500;

const FeedbackScreen: React.FC<Props> = ({ navigation, route }) => {
    const { facultyId } = route.params;
    const [category, setCategory] = useState<Category>('suggestion');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

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
});

export default FeedbackScreen;