// src/components/SubmissionItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Submission } from '../types';
import { Clock, FileText, FlaskConical, HelpCircle, Layers } from 'lucide-react-native';

interface SubmissionItemProps {
    submission: Submission;
}

const TYPE_CONFIG = {
    assignment: { icon: FileText, color: '#2B6CB0', bg: '#EBF8FF', label: 'Assignment' },
    project: { icon: Layers, color: '#6B46C1', bg: '#FAF5FF', label: 'Project' },
    quiz: { icon: HelpCircle, color: '#D69E2E', bg: '#FFFFF0', label: 'Quiz' },
    lab: { icon: FlaskConical, color: '#276749', bg: '#F0FFF4', label: 'Lab' },
};

const SubmissionItem: React.FC<SubmissionItemProps> = ({ submission }) => {
    const typeKey = (submission.type || 'assignment') as keyof typeof TYPE_CONFIG;
    const config = TYPE_CONFIG[typeKey] || TYPE_CONFIG.assignment;
    const TypeIcon = config.icon;
    const total = submission.totalStudents ?? 60;
    const submitted = submission.submittedCount ?? 0;
    const progress = total > 0 ? Math.round((submitted / total) * 100) : 0;

    return (
        <View style={styles.container}>
            {/* Left accent bar */}
            <View
                style={[
                    styles.accentBar,
                    { backgroundColor: submission.urgent ? '#E53E3E' : config.color },
                ]}
            />

            <View style={styles.iconWrap}>
                <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                    <TypeIcon size={18} color={config.color} strokeWidth={2} />
                </View>
            </View>

            <View style={styles.content}>
                {/* Course code + type badge */}
                <View style={styles.topRow}>
                    <Text style={styles.courseCode}>{submission.courseCode}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.typeBadgeText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                    {submission.urgent && (
                        <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>Urgent</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.title} numberOfLines={2}>
                    {submission.title}
                </Text>

                <Text style={styles.courseName}>{submission.courseName}</Text>

                {/* Bottom row: due date + progress */}
                <View style={styles.bottomRow}>
                    <View style={styles.dueDateRow}>
                        <Clock size={12} color={submission.urgent ? '#E53E3E' : '#718096'} />
                        <Text
                            style={[
                                styles.dueDate,
                                submission.urgent && { color: '#E53E3E', fontWeight: '700' },
                            ]}
                        >
                            {' '}Due {submission.dueDateDisplay}
                        </Text>
                    </View>

                    <Text style={styles.progressText}>
                        {submission.submittedCount}/{submission.totalStudents} submitted
                    </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarTrack}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${progress}%`,
                                backgroundColor: progress > 50 ? '#38A169' : config.color,
                            },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    accentBar: {
        width: 4,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    iconWrap: {
        paddingVertical: 14,
        paddingLeft: 10,
        paddingRight: 4,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 12,
        paddingLeft: 6,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    courseCode: {
        fontSize: 11,
        fontWeight: '800',
        color: '#1A3A6B',
        letterSpacing: 0.5,
    },
    typeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    urgentBadge: {
        backgroundColor: '#FFF5F5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FEB2B2',
    },
    urgentText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#E53E3E',
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
        lineHeight: 18,
        marginBottom: 2,
    },
    courseName: {
        fontSize: 11,
        color: '#718096',
        marginBottom: 8,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    dueDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dueDate: {
        fontSize: 11,
        color: '#718096',
    },
    progressText: {
        fontSize: 10,
        color: '#718096',
    },
    progressBarTrack: {
        height: 3,
        backgroundColor: '#EDF2F7',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
});

export default SubmissionItem;