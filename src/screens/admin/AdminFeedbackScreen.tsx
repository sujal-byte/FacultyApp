import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Search,
    MessageSquare,
    Lightbulb,
    Bug,
    HelpCircle,
    Check,
    Clock,
    User,
    ChevronRight,
} from 'lucide-react-native';

export default function AdminFeedbackScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [feedbacks, setFeedbacks] = useState([
        {
            id: '1',
            facultyName: 'Dr. Priya Nair',
            facultyId: 'FAC-2024-0042',
            department: 'Computer Science & Engineering',
            category: 'suggestion',
            message: 'The syllabus management UI is very smooth. Could we add an option to duplicate a course workload structure for the next semester?',
            time: '2 hours ago',
            status: 'pending',
        },
        {
            id: '2',
            facultyName: 'Prof. Anand Kumar',
            facultyId: 'FAC-2024-0010',
            department: 'Information Science',
            category: 'bug',
            message: 'Unable to mark attendance for CS-101 section C on mobile. The save button remains disabled even after selection.',
            time: '4 hours ago',
            status: 'pending',
        },
        {
            id: '3',
            facultyName: 'Dr. Smitha Rao',
            facultyId: 'FAC-2024-0015',
            department: 'Electronics & Communication',
            category: 'question',
            message: 'Where can we request custom reports for academic audits? Is there a template available in the system?',
            time: 'Yesterday',
            status: 'reviewed',
        },
        {
            id: '4',
            facultyName: 'Prof. R. K. Sen',
            facultyId: 'FAC-2024-0089',
            department: 'Mechanical Engineering',
            category: 'other',
            message: 'Requesting access to the library book purchase request form for CSE reference titles.',
            time: '3 days ago',
            status: 'reviewed',
        },
        {
            id: '5',
            facultyName: 'Dr. Priya Nair',
            facultyId: 'FAC-2024-0042',
            department: 'Computer Science & Engineering',
            category: 'bug',
            message: 'Critical: The leave calculation showing total remaining quota is incorrect. It should be 12 instead of 10.',
            time: '4 days ago',
            status: 'pending',
        },
    ]);

    const filteredFeedbacks = feedbacks.filter((fb) => {
        const matchesSearch =
            fb.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fb.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fb.facultyId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || fb.category === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const handleAction = (id: string, actionType: 'review' | 'reply') => {
        if (actionType === 'review') {
            setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: 'reviewed' } : f));
            Alert.alert('Status Updated', 'Feedback marked as reviewed.');
        } else {
            Alert.alert('Reply Sent', 'Your response has been dispatched to the faculty member.');
        }
    };

    const getCategoryDetails = (cat: string) => {
        switch (cat) {
            case 'bug':
                return { icon: Bug, color: '#E53E3E', bg: '#FFF5F5', label: 'Bug Report' };
            case 'suggestion':
                return { icon: Lightbulb, color: '#D69E2E', bg: '#FFFFF0', label: 'Suggestion' };
            case 'question':
                return { icon: HelpCircle, color: '#2B6CB0', bg: '#EBF8FF', label: 'Question' };
            default:
                return { icon: MessageSquare, color: '#718096', bg: '#F7FAFC', label: 'Other' };
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
                <Text style={styles.headerTitle}>Faculty Feedback</Text>
                <View style={{ width: 36 }} />
            </View>

            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={18} color="#A0AEC0" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search feedback content, faculty, ID..."
                        placeholderTextColor="#A0AEC0"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterRow}
                >
                    {['ALL', 'SUGGESTION', 'BUG', 'QUESTION', 'OTHER'].map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.filterTab, selectedCategory === cat && styles.filterTabActive]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[styles.filterTabText, selectedCategory === cat && styles.filterTabTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Feedback List */}
                <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                    <Text style={styles.resultCount}>Showing {filteredFeedbacks.length} Feedback Submissions</Text>

                    {filteredFeedbacks.map((fb) => {
                        const { icon: CatIcon, color, bg, label } = getCategoryDetails(fb.category);
                        return (
                            <View key={fb.id} style={styles.card}>
                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.facultyMeta}>
                                        <View style={styles.avatar}>
                                            <User size={16} color="#FFFFFF" />
                                        </View>
                                        <View>
                                            <Text style={styles.facultyName}>{fb.facultyName}</Text>
                                            <Text style={styles.facultyId}>{fb.facultyId} • {fb.department}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: bg }]}>
                                        <CatIcon size={12} color={color} />
                                        <Text style={[styles.badgeText, { color }]}>{label}</Text>
                                    </View>
                                </View>

                                {/* Message */}
                                <Text style={styles.messageText}>{fb.message}</Text>

                                {/* Bottom Row */}
                                <View style={styles.cardFooter}>
                                    <View style={styles.timeWrap}>
                                        <Clock size={12} color="#A0AEC0" />
                                        <Text style={styles.timeText}>{fb.time}</Text>
                                    </View>

                                    <View style={styles.actions}>
                                        {fb.status === 'pending' ? (
                                            <TouchableOpacity
                                                style={styles.reviewBtn}
                                                onPress={() => handleAction(fb.id, 'review')}
                                            >
                                                <Check size={12} color="#2F855A" />
                                                <Text style={styles.reviewBtnText}>Review</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <View style={styles.reviewedBadge}>
                                                <Check size={10} color="#718096" />
                                                <Text style={styles.reviewedText}>Reviewed</Text>
                                            </View>
                                        )}

                                        <TouchableOpacity
                                            style={styles.replyBtn}
                                            onPress={() => handleAction(fb.id, 'reply')}
                                        >
                                            <Text style={styles.replyBtnText}>Reply</Text>
                                            <ChevronRight size={12} color="#1A3A6B" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
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
    resultCount: {
        fontSize: 12,
        fontWeight: '700',
        color: '#718096',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    facultyMeta: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2B6CB0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    facultyName: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    facultyId: {
        fontSize: 10,
        color: '#718096',
        marginTop: 1,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    messageText: {
        fontSize: 13,
        color: '#2D3748',
        lineHeight: 18,
        marginBottom: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        paddingTop: 12,
    },
    timeWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 11,
        color: '#A0AEC0',
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C6F6D5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 3,
    },
    reviewBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#22543D',
    },
    reviewedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EDF2F7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 3,
    },
    reviewedText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#718096',
    },
    replyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#1A3A6B',
        gap: 2,
    },
    replyBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1A3A6B',
    },
});
