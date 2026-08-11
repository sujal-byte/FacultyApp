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
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Search,
    BookOpen,
    Clock,
    User,
    Plus,
    Calendar,
    ChevronRight,
    X,
    FileText,
    CheckCircle,
} from 'lucide-react-native';

export default function AdminQuizScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('SCHEDULED');
    const [modalVisible, setModalVisible] = useState(false);

    // Form states
    const [newTitle, setNewTitle] = useState('');
    const [newCourse, setNewCourse] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newDuration, setNewDuration] = useState('');
    const [newAudience, setNewAudience] = useState('');

    const [quizzes, setQuizzes] = useState([
        {
            id: 'q1',
            title: 'Mid-Semester Quiz 2',
            courseCode: 'CS401',
            courseName: 'Machine Learning',
            createdBy: 'Dr. Priya Nair',
            audience: '7th Sem Sec A & B',
            date: '01 Feb 2025',
            duration: '30 mins',
            questions: 20,
            marks: 40,
            status: 'SCHEDULED',
        },
        {
            id: 'q2',
            title: 'SQL Assignment - Normalization Quiz',
            courseCode: 'CS302',
            courseName: 'Database Systems',
            createdBy: 'Prof. Anand Kumar',
            audience: '5th Sem Sec C',
            date: '24 Jan 2025',
            duration: '45 mins',
            questions: 25,
            marks: 50,
            status: 'SCHEDULED',
        },
        {
            id: 'q3',
            title: 'Internal Assessment Test 1',
            courseCode: 'CS501',
            courseName: 'Cloud Computing',
            createdBy: 'Dr. Smitha Rao',
            audience: '7th Sem Sec A',
            date: 'Today, 10:00 AM',
            duration: '60 mins',
            questions: 30,
            marks: 60,
            status: 'ACTIVE',
        },
        {
            id: 'q4',
            title: 'Practical Lab Assessment 1',
            courseCode: 'CS302',
            courseName: 'Database Systems',
            createdBy: 'Prof. Anand Kumar',
            audience: '5th Sem Sec C',
            date: '15 Jan 2025',
            duration: '90 mins',
            questions: 10,
            marks: 30,
            status: 'COMPLETED',
        },
    ]);

    const filteredQuizzes = quizzes.filter((q) => {
        const matchesSearch =
            q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = q.status === selectedTab;
        return matchesSearch && matchesTab;
    });

    const handleCreateQuiz = () => {
        if (!newTitle.trim() || !newCourse.trim() || !newDate.trim() || !newDuration.trim() || !newAudience.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all the quiz details.');
            return;
        }

        const newQuiz = {
            id: `q${Date.now()}`,
            title: newTitle,
            courseCode: newCourse.split(' ')[0] || 'GEN',
            courseName: newCourse.split(' ').slice(1).join(' ') || newCourse,
            createdBy: 'Admin User',
            audience: newAudience,
            date: newDate,
            duration: `${newDuration} mins`,
            questions: 20,
            marks: 50,
            status: 'SCHEDULED',
        };

        setQuizzes([newQuiz, ...quizzes]);
        setModalVisible(false);
        // Clear form
        setNewTitle('');
        setNewCourse('');
        setNewDate('');
        setNewDuration('');
        setNewAudience('');
        Alert.alert('Success', 'Quiz / Exam scheduled successfully college-wide!');
    };

    const handleQuizAction = (id: string, action: string) => {
        if (action === 'delete') {
            Alert.alert('Delete Quiz', 'Are you sure you want to cancel and delete this quiz schedule?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setQuizzes(quizzes.filter(q => q.id !== id));
                    }
                }
            ]);
        } else if (action === 'results') {
            Alert.alert('Announce Results', 'Results will be processed and sent to student dashboards.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Announce', onPress: () => Alert.alert('Success', 'Quiz results announced!') }
            ]);
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
                <Text style={styles.headerTitle}>Quiz & Exam Manager</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Plus size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={18} color="#A0AEC0" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by title, course, faculty..."
                        placeholderTextColor="#A0AEC0"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Tabs */}
                <View style={styles.tabRow}>
                    {['SCHEDULED', 'ACTIVE', 'COMPLETED'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, selectedTab === tab && styles.tabActive]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* List */}
                <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                    <Text style={styles.resultCount}>{filteredQuizzes.length} Quizzes / Exams Found</Text>

                    {filteredQuizzes.map((quiz) => (
                        <View key={quiz.id} style={styles.card}>
                            {/* Course / Code */}
                            <View style={styles.cardHeader}>
                                <View style={styles.courseMeta}>
                                    <View style={styles.iconWrap}>
                                        <BookOpen size={16} color="#2B6CB0" />
                                    </View>
                                    <Text style={styles.courseText}>
                                        {quiz.courseCode} • {quiz.courseName}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    quiz.status === 'ACTIVE' ? styles.statusActive : quiz.status === 'COMPLETED' ? styles.statusCompleted : styles.statusScheduled
                                ]}>
                                    <Text style={[
                                        styles.statusBadgeText,
                                        quiz.status === 'ACTIVE' ? { color: '#E53E3E' } : quiz.status === 'COMPLETED' ? { color: '#276749' } : { color: '#2B6CB0' }
                                    ]}>
                                        {quiz.status}
                                    </Text>
                                </View>
                            </View>

                            {/* Title */}
                            <Text style={styles.quizTitle}>{quiz.title}</Text>

                            {/* Meta Grid */}
                            <View style={styles.metaGrid}>
                                <View style={styles.metaItem}>
                                    <User size={12} color="#A0AEC0" />
                                    <Text style={styles.metaText} numberOfLines={1}>By: {quiz.createdBy}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Calendar size={12} color="#A0AEC0" />
                                    <Text style={styles.metaText}>{quiz.date}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Clock size={12} color="#A0AEC0" />
                                    <Text style={styles.metaText}>Dur: {quiz.duration}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <FileText size={12} color="#A0AEC0" />
                                    <Text style={styles.metaText}>{quiz.questions} Qs / {quiz.marks} Marks</Text>
                                </View>
                            </View>

                            <View style={styles.targetAudience}>
                                <Text style={styles.audienceText}>Target: {quiz.audience}</Text>
                            </View>

                            {/* Actions Footer */}
                            <View style={styles.cardFooter}>
                                {quiz.status === 'COMPLETED' ? (
                                    <TouchableOpacity
                                        style={styles.actionBtnPrimary}
                                        onPress={() => handleQuizAction(quiz.id, 'results')}
                                    >
                                        <CheckCircle size={14} color="#FFFFFF" />
                                        <Text style={styles.actionBtnTextPrimary}>Announce Results</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.actionBtnSecondary}
                                        onPress={() => Alert.alert('Review Questions', 'This function will fetch online quiz questions.')}
                                    >
                                        <Text style={styles.actionBtnTextSecondary}>Review Questions</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => handleQuizAction(quiz.id, 'delete')}
                                >
                                    <Text style={styles.deleteBtnText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Create Quiz Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Schedule Quiz / Exam</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={20} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Quiz Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Mid-Semester Quiz 3"
                                    placeholderTextColor="#A0AEC0"
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Course Code & Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. CS401 Machine Learning"
                                    placeholderTextColor="#A0AEC0"
                                    value={newCourse}
                                    onChangeText={setNewCourse}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Scheduled Date & Time</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 05 Feb 2025, 02:00 PM"
                                    placeholderTextColor="#A0AEC0"
                                    value={newDate}
                                    onChangeText={setNewDate}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Duration (in minutes)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 45"
                                    placeholderTextColor="#A0AEC0"
                                    keyboardType="numeric"
                                    value={newDuration}
                                    onChangeText={setNewDuration}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Target Audience</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 7th Sem Sec A & B"
                                    placeholderTextColor="#A0AEC0"
                                    value={newAudience}
                                    onChangeText={setNewAudience}
                                />
                            </View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateQuiz}>
                                <Text style={styles.submitBtnText}>Schedule Quiz</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    tabRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        gap: 8,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#1A3A6B',
    },
    tabText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4A5568',
    },
    tabTextActive: {
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
        alignItems: 'center',
        marginBottom: 10,
    },
    courseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    iconWrap: {
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: '#EBF8FF',
        alignItems: 'center', justifyContent: 'center',
    },
    courseText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2B6CB0',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusScheduled: { backgroundColor: '#EBF8FF' },
    statusActive: { backgroundColor: '#FFF5F5' },
    statusCompleted: { backgroundColor: '#F0FFF4' },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: '700',
    },
    quizTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1A3A6B',
        marginBottom: 10,
    },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        width: '47%',
    },
    metaText: {
        fontSize: 11,
        color: '#718096',
        fontWeight: '500',
    },
    targetAudience: {
        backgroundColor: '#EDF2F7',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 14,
    },
    audienceText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4A5568',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        paddingTop: 12,
    },
    actionBtnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#276749',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    actionBtnTextPrimary: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    actionBtnSecondary: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#1A3A6B',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionBtnTextSecondary: {
        color: '#1A3A6B',
        fontSize: 12,
        fontWeight: '700',
    },
    deleteBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    deleteBtnText: {
        color: '#E53E3E',
        fontSize: 12,
        fontWeight: '700',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        maxHeight: '85%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    modalForm: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A3A6B',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#2D3748',
    },
    submitBtn: {
        backgroundColor: '#1A3A6B',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        elevation: 3,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});
