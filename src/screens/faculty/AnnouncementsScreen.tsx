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
import { ArrowLeft, Plus, X, Send, AlertTriangle } from 'lucide-react-native';
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
                                <View key={item.id} style={[styles.card, item.isUrgent && styles.cardUrgent]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardCategory}>{item.category}</Text>
                                        <Text style={styles.cardDate}>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardMessage}>{item.message}</Text>
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.cardAudience}>To: {item.targetAudience}</Text>
                                        {item.isUrgent && (
                                            <View style={styles.urgentBadge}>
                                                <AlertTriangle size={10} color="#E53E3E" />
                                                <Text style={styles.urgentText}>URGENT</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
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
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
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

    // Modal Styles
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
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});