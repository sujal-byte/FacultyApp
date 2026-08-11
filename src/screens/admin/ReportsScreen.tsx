import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    FileText,
    Download,
    BarChart2,
    Users,
    CalendarCheck,
    BookOpen
} from 'lucide-react-native';

export default function ReportsScreen({ navigation }: any) {
    const [selectedReport, setSelectedReport] = useState<string | null>('attendance');

    const reportTypes = [
        { id: 'attendance', title: 'Overall Attendance', desc: 'College-wide student attendance stats', icon: Users, color: '#3182CE', bg: '#EBF8FF' },
        { id: 'academic', title: 'Academic Performance', desc: 'Grades and passing percentages', icon: BarChart2, color: '#38A169', bg: '#F0FFF4' },
        { id: 'leave', title: 'Faculty Leaves', desc: 'Approved and pending leave requests', icon: CalendarCheck, color: '#D69E2E', bg: '#FFFFF0' },
        { id: 'workload', title: 'Faculty Workload', desc: 'Assigned courses and hours per week', icon: BookOpen, color: '#6B46C1', bg: '#FAF5FF' },
    ];

    const handleGenerate = () => {
        if (!selectedReport) {
            Alert.alert('Select Report', 'Please select a report type to generate.');
            return;
        }
        Alert.alert(
            'Report Generated',
            'The requested report has been generated and is downloading to your device.',
            [{ text: 'OK' }]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>System Reports</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                <View style={styles.sectionHeader}>
                    <FileText size={18} color="#1A3A6B" />
                    <Text style={styles.sectionTitle}>Select Report Type</Text>
                </View>

                {/* Report Types List */}
                <View style={styles.reportList}>
                    {reportTypes.map((report) => {
                        const Icon = report.icon;
                        const isSelected = selectedReport === report.id;

                        return (
                            <TouchableOpacity
                                key={report.id}
                                style={[styles.reportCard, isSelected && styles.reportCardSelected]}
                                onPress={() => setSelectedReport(report.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconWrap, { backgroundColor: report.bg }]}>
                                    <Icon size={22} color={report.color} />
                                </View>
                                <View style={styles.reportContent}>
                                    <Text style={styles.reportTitle}>{report.title}</Text>
                                    <Text style={styles.reportDesc}>{report.desc}</Text>
                                </View>
                                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                                    {isSelected && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Quick Filters Placeholder */}
                <View style={styles.filtersBox}>
                    <Text style={styles.filterTitle}>Report Parameters</Text>
                    <Text style={styles.filterDesc}>Date Range: Current Semester</Text>
                    <Text style={styles.filterDesc}>Department: All Departments</Text>
                    <TouchableOpacity style={styles.editFilterBtn}>
                        <Text style={styles.editFilterText}>Modify Parameters</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
                    <Download size={18} color="#FFFFFF" />
                    <Text style={styles.generateBtnText}>Generate & Download</Text>
                </TouchableOpacity>
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
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        padding: 20,
        paddingBottom: 40,
        flexGrow: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A3A6B',
    },
    reportList: {
        gap: 12,
        marginBottom: 24,
    },
    reportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    reportCardSelected: {
        borderColor: '#3182CE',
        backgroundColor: '#EBF8FF',
    },
    iconWrap: {
        width: 44, height: 44,
        borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A3A6B',
        marginBottom: 2,
    },
    reportDesc: {
        fontSize: 11,
        color: '#718096',
        lineHeight: 16,
    },
    radioCircle: {
        width: 20, height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#CBD5E0',
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 10,
    },
    radioCircleSelected: {
        borderColor: '#3182CE',
    },
    radioInner: {
        width: 10, height: 10,
        borderRadius: 5,
        backgroundColor: '#3182CE',
    },
    filtersBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 8,
    },
    filterDesc: {
        fontSize: 12,
        color: '#4A5568',
        marginBottom: 4,
    },
    editFilterBtn: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    editFilterText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#3182CE',
    },
    bottomBar: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    generateBtn: {
        flexDirection: 'row',
        backgroundColor: '#276749',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    generateBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});