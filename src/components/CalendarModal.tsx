// src/components/CalendarModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { X } from 'lucide-react-native';

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
}

// Marked dates for demo purposes (events, deadlines)
const MARKED_DATES = {
    '2025-01-22': { marked: true, dotColor: '#E53E3E', activeOpacity: 0, selectedColor: '#E53E3E' },
    '2025-01-24': { marked: true, dotColor: '#E53E3E' },
    '2025-01-28': { marked: true, dotColor: '#DD6B20' },
    '2025-02-01': { marked: true, dotColor: '#DD6B20' },
    '2025-01-30': { marked: true, dotColor: '#2B6CB0' },
};

const CalendarModal: React.FC<CalendarModalProps> = ({ visible, onClose }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');

    const today = new Date().toISOString().split('T')[0];

    const markedDatesWithSelected = selectedDate
        ? {
            ...MARKED_DATES,
            [selectedDate]: {
                selected: true,
                selectedColor: '#1A3A6B',
                ...(MARKED_DATES[selectedDate as keyof typeof MARKED_DATES] || {}),
            },
        }
        : {
            ...MARKED_DATES,
            [today]: { today: true, todayTextColor: '#1A3A6B' },
        };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.container}>
                        {/* Modal Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Academic Calendar</Text>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeBtn}
                                accessibilityLabel="Close calendar"
                                accessibilityRole="button"
                            >
                                <X size={22} color="#4A5568" />
                            </TouchableOpacity>
                        </View>

                        {/* Calendar */}
                        <Calendar
                            current={today}
                            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                            markedDates={markedDatesWithSelected}
                            theme={{
                                backgroundColor: '#FFFFFF',
                                calendarBackground: '#FFFFFF',
                                textSectionTitleColor: '#718096',
                                selectedDayBackgroundColor: '#1A3A6B',
                                selectedDayTextColor: '#FFFFFF',
                                todayTextColor: '#1A3A6B',
                                dayTextColor: '#2D3748',
                                textDisabledColor: '#CBD5E0',
                                dotColor: '#E53E3E',
                                selectedDotColor: '#FFFFFF',
                                arrowColor: '#1A3A6B',
                                monthTextColor: '#1A3A6B',
                                textDayFontFamily: 'System',
                                textMonthFontFamily: 'System',
                                textDayHeaderFontFamily: 'System',
                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 12,
                                textMonthFontWeight: '700',
                            }}
                            style={styles.calendar}
                        />

                        {/* Legend */}
                        <View style={styles.legend}>
                            <Text style={styles.legendTitle}>Legend</Text>
                            <View style={styles.legendItems}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#E53E3E' }]} />
                                    <Text style={styles.legendText}>Submission Deadline</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#DD6B20' }]} />
                                    <Text style={styles.legendText}>Assessment</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#2B6CB0' }]} />
                                    <Text style={styles.legendText}>IA Marks Entry</Text>
                                </View>
                            </View>
                        </View>

                        {/* Selected Date Info */}
                        {selectedDate ? (
                            <View style={styles.selectedInfo}>
                                <Text style={styles.selectedInfoText}>
                                    Selected: <Text style={styles.selectedDateText}>{selectedDate}</Text>
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    safeArea: {
        width: '100%',
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#1A3A6B',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'hsla(180, 28%, 92%, 1.00)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendar: {
        borderRadius: 0,
    },
    legend: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        paddingTop: 12,
    },
    legendTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#718096',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    legendItems: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#4A5568',
    },
    selectedInfo: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    selectedInfoText: {
        fontSize: 13,
        color: '#718096',
    },
    selectedDateText: {
        color: '#1A3A6B',
        fontWeight: '700',
    },
});

export default CalendarModal;