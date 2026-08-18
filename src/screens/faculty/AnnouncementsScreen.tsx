import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, X, Send, AlertTriangle, CheckCircle, Calendar, Users } from 'lucide-react-native';
import { announcementsApi } from '../../services/api';

const CATEGORIES = [
    'Academic',
    'Event',
    'Administrative',
    'Department',
    'Committee',
    'Club',
    'Exam',
    'General',
];

export default function AnnouncementsScreen({ navigation }: any) {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Detail modal state for selected announcement
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);

    // Modal state for composing a notice
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newNotice, setNewNotice] = useState({
        title: '',
        message: '',
        category: 'Academic',
        targetAudience: 'Students',
        isUrgent: false
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await announcementsApi.getAll();
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotice = async () => {
        if (!newNotice.title.trim() || !newNotice.message.trim()) {
            Alert.alert('Missing Fields', 'Please enter a title and message.');
            return;
        }

        setIsSubmitting(true);
        try {
            await announcementsApi.create(newNotice);
            Alert.alert('Success', 'Notice sent successfully!');
            setModalVisible(false);
            setNewNotice({ title: '', message: '', category: 'Academic', targetAudience: 'Students', isUrgent: false });

            // Refresh list
            setLoading(true);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error sending notice:', error);
            Alert.alert('Error', 'Failed to send the notice.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#1A3A6B" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Announcements</Text>
                <View style={{ width: 36 }} />
            </View>

            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2B6CB0" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                        {announcements.length === 0 ? (
                            <Text style={styles.emptyText}>No announcements found.</Text>
                        ) : (
                            announcements.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.card, item.isUrgent && styles.cardUrgent]}
                                    onPress={() => setSelectedAnnouncement(item)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardCategory}>{item.category}</Text>
                                        <Text style={styles.cardDate}>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardMessage} numberOfLines={3}>{item.message}</Text>
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.cardAudience}>To: {item.targetAudience}</Text>
                                        {item.isUrgent && (
                                            <View style={styles.urgentBadge}>
                                                <AlertTriangle size={10} color="#E53E3E" />
                                                <Text style={styles.urgentText}>URGENT</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                )}
            </View>

            {/* Floating Action Button (FAB) */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Compose Notice Modal */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Announcement</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#4A5568" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="E.g., Tomorrow's class shifted"
                                value={newNotice.title}
                                onChangeText={(t) => setNewNotice({ ...newNotice, title: t })}
                            />

                            <Text style={styles.label}>Message</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Type your notice here..."
                                multiline
                                textAlignVertical="top"
                                value={newNotice.message}
                                onChangeText={(t) => setNewNotice({ ...newNotice, message: t })}
                            />

                            <Text style={styles.label}>Category</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoryScroll}
                            >
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.categoryChip, newNotice.category === cat && styles.categoryChipActive]}
                                        onPress={() => setNewNotice({ ...newNotice, category: cat })}
                                    >
                                        <Text style={[styles.categoryChipText, newNotice.category === cat && styles.categoryChipTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.label}>Audience</Text>
                            <View style={styles.row}>
                                {['Students', 'Faculty', 'All'].map((aud) => (
                                    <TouchableOpacity
                                        key={aud}
                                        style={[styles.chip, newNotice.targetAudience === aud && styles.chipActive]}
                                        onPress={() => setNewNotice({ ...newNotice, targetAudience: aud })}
                                    >
                                        <Text style={[styles.chipText, newNotice.targetAudience === aud && styles.chipTextActive]}>{aud}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Urgent Toggle */}
                            <TouchableOpacity
                                style={[styles.urgentToggle, newNotice.isUrgent && styles.urgentToggleActive]}
                                onPress={() => setNewNotice({ ...newNotice, isUrgent: !newNotice.isUrgent })}
                                activeOpacity={0.8}
                            >
                                <AlertTriangle size={18} color={newNotice.isUrgent ? '#E53E3E' : '#A0AEC0'} />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={[styles.urgentTitle, newNotice.isUrgent && { color: '#E53E3E' }]}>Mark as Urgent</Text>
                                </View>
                                <View style={[styles.checkbox, newNotice.isUrgent && styles.checkboxActive]}>
                                    {newNotice.isUrgent && <View style={styles.checkboxInner} />}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                                onPress={handleSendNotice}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Post Announcement</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Announcement Detail Modal */}
            <Modal
                visible={selectedAnnouncement !== null}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedAnnouncement(null)}
            >
                <SafeAreaView style={styles.detailSafeArea}>
                    <View style={styles.detailContainer}>
                        {/* Header: Close Icon on Top Left */}
                        <View style={styles.detailHeader}>
                            <TouchableOpacity
                                style={styles.detailCloseBtn}
                                onPress={() => setSelectedAnnouncement(null)}
                                accessibilityLabel="Close modal"
                            >
                                <X size={22} color="#1A3A6B" />
                            </TouchableOpacity>
                            <Text style={styles.detailHeaderTitle}>Announcement Details</Text>
                            <View style={{ width: 38 }} />
                        </View>

                        {selectedAnnouncement && (
                            <ScrollView
                                style={styles.detailScroll}
                                contentContainerStyle={styles.detailContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Meta Badges */}
                                <View style={styles.detailMetaRow}>
                                    <View style={styles.detailCategoryBadge}>
                                        <Text style={styles.detailCategoryText}>
                                            {selectedAnnouncement.category || 'General'}
                                        </Text>
                                    </View>
                                    {selectedAnnouncement.isUrgent && (
                                        <View style={styles.urgentBadge}>
                                            <AlertTriangle size={12} color="#E53E3E" />
                                            <Text style={styles.urgentText}>URGENT</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Title */}
                                <Text style={styles.detailTitle}>{selectedAnnouncement.title}</Text>

                                {/* Date and Audience Card */}
                                <View style={styles.detailInfoCard}>
                                    <View style={styles.detailInfoRow}>
                                        <Calendar size={15} color="#718096" />
                                        <Text style={styles.detailInfoLabel}>Date:</Text>
                                        <Text style={styles.detailInfoValue}>
                                            {selectedAnnouncement.createdAt
                                                ? new Date(selectedAnnouncement.createdAt).toLocaleDateString(undefined, {
                                                      weekday: 'short',
                                                      year: 'numeric',
                                                      month: 'short',
                                                      day: 'numeric',
                                                  })
                                                : 'N/A'}
                                        </Text>
                                    </View>
                                    {selectedAnnouncement.targetAudience && (
                                        <View style={[styles.detailInfoRow, { marginTop: 8 }]}>
                                            <Users size={15} color="#718096" />
                                            <Text style={styles.detailInfoLabel}>Audience:</Text>
                                            <Text style={styles.detailInfoValue}>
                                                {selectedAnnouncement.targetAudience}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Full Message */}
                                <View style={styles.messageBox}>
                                    <Text style={styles.messageSectionHeading}>Message</Text>
                                    <Text style={styles.detailMessageText}>{selectedAnnouncement.message}</Text>
                                </View>
                            </ScrollView>
                        )}

                        {/* Bottom 'Mark as Read' Button */}
                        <View style={styles.detailFooter}>
                            <TouchableOpacity
                                style={styles.markAsReadBtn}
                                onPress={() => {
                                    Alert.alert('Success', 'Announcement marked as read.');
                                    setSelectedAnnouncement(null);
                                }}
                                activeOpacity={0.85}
                            >
                                <CheckCircle size={20} color="#FFFFFF" />
                                <Text style={styles.markAsReadBtnText}>Mark as Read</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1A3A6B' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1A3A6B' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
    container: { flex: 1, backgroundColor: '#F0F4F8', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 20 },
    listContainer: { paddingHorizontal: 16, paddingBottom: 80 },
    emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 40 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
    cardUrgent: { borderColor: '#FEB2B2', backgroundColor: '#FFF5F5' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    cardCategory: { fontSize: 11, fontWeight: '700', color: '#3182CE', backgroundColor: '#EBF8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    cardDate: { fontSize: 11, color: '#A0AEC0' },
    cardTitle: { fontSize: 15, fontWeight: '800', color: '#1A3A6B', marginBottom: 6 },
    cardMessage: { fontSize: 13, color: '#4A5568', lineHeight: 20, marginBottom: 12 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
    cardAudience: { fontSize: 11, fontWeight: '600', color: '#718096' },
    urgentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FED7D7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    urgentText: { fontSize: 10, fontWeight: '800', color: '#E53E3E' },

    // FAB Styles
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2B6CB0', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },

    // Compose Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A3A6B' },
    label: { fontSize: 12, fontWeight: 'bold', color: '#4A5568', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, color: '#2D3748' },
    textArea: { height: 100 },
    row: { flexDirection: 'row', gap: 10 },
    chip: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
    chipActive: { backgroundColor: '#3182CE', borderColor: '#3182CE' },
    chipText: { fontSize: 12, fontWeight: '600', color: '#4A5568' },
    chipTextActive: { color: '#FFF' },
    categoryScroll: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
    categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EDF2F7', borderWidth: 1, borderColor: '#E2E8F0' },
    categoryChipActive: { backgroundColor: '#1A3A6B', borderColor: '#1A3A6B' },
    categoryChipText: { fontSize: 12, fontWeight: '700', color: '#4A5568' },
    categoryChipTextActive: { color: '#FFFFFF' },
    urgentToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginTop: 12 },
    urgentToggleActive: { backgroundColor: '#FFF5F5', borderColor: '#FEB2B2' },
    urgentTitle: { fontSize: 13, fontWeight: '700', color: '#2D3748' },
    checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#CBD5E0', alignItems: 'center', justifyContent: 'center' },
    checkboxActive: { borderColor: '#E53E3E' },
    checkboxInner: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#E53E3E' },
    submitBtn: { backgroundColor: '#2B6CB0', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 20 },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    // Detail Modal Styles
    detailSafeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    detailContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    detailCloseBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F0F4F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailHeaderTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    detailScroll: { flex: 1 },
    detailContent: { padding: 20 },
    detailMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailCategoryBadge: {
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#BEE3F8',
    },
    detailCategoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2B6CB0',
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A3A6B',
        lineHeight: 28,
        marginBottom: 16,
    },
    detailInfoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    detailInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailInfoLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#718096',
    },
    detailInfoValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
    },
    messageBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    messageSectionHeading: {
        fontSize: 12,
        fontWeight: '700',
        color: '#A0AEC0',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    detailMessageText: {
        fontSize: 14,
        color: '#2D3748',
        lineHeight: 22,
    },
    detailFooter: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    markAsReadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#1A3A6B',
        borderRadius: 12,
        paddingVertical: 15,
        elevation: 2,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    markAsReadBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});