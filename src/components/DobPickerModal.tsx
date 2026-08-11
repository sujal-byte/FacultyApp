import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';

interface DobPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    value: string;
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function DobPickerModal({ visible, onClose, onSelectDate, value }: DobPickerModalProps) {
    const currentYear = new Date().getFullYear();
    const startYear = 1950;
    const yearsList = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    const [activeTab, setActiveTab] = useState<'year' | 'month' | 'day'>('year');
    const [selectedYear, setSelectedYear] = useState<number>(2000);
    const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0-indexed
    const [selectedDay, setSelectedDay] = useState<number>(1);

    const yearFlatListRef = useRef<FlatList>(null);

    // Sync state with incoming value when modal opens
    useEffect(() => {
        if (visible) {
            const match = value ? value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) : null;
            if (match) {
                const d = parseInt(match[1]);
                const m = parseInt(match[2]) - 1;
                const y = parseInt(match[3]);

                setSelectedYear(y);
                setSelectedMonth(m);
                setSelectedDay(d);
                setActiveTab('day');
            } else {
                setSelectedYear(2000);
                setSelectedMonth(0);
                setSelectedDay(1);
                setActiveTab('year');
            }
        }
    }, [visible, value]);

    // Scroll to selected year when Year tab is activated
    useEffect(() => {
        if (activeTab === 'year' && visible) {
            const itemIndex = yearsList.indexOf(selectedYear);
            if (itemIndex !== -1) {
                const rowIndex = Math.floor(itemIndex / 3);
                setTimeout(() => {
                    try {
                        yearFlatListRef.current?.scrollToIndex({
                            index: rowIndex,
                            animated: false,
                            viewPosition: 0.5,
                        });
                    } catch (err) {
                        console.warn('scrollToIndex failed', err);
                    }
                }, 100);
            }
        }
    }, [activeTab, visible]);

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    // Ensure selected day is valid for the current month/year selection
    useEffect(() => {
        if (selectedDay > daysInMonth) {
            setSelectedDay(daysInMonth);
        }
    }, [selectedYear, selectedMonth]);

    const handleConfirm = () => {
        const monthStr = String(selectedMonth + 1).padStart(2, '0');
        const dayStr = String(selectedDay).padStart(2, '0');
        const formattedDate = `${dayStr}/${monthStr}/${selectedYear}`;
        onSelectDate(formattedDate);
        onClose();
    };

    const renderYearItem = ({ item }: { item: number }) => {
        const isSelected = item === selectedYear;
        return (
            <TouchableOpacity
                style={[styles.gridItem, isSelected && styles.selectedItem]}
                onPress={() => {
                    setSelectedYear(item);
                    setActiveTab('month');
                }}
            >
                <Text style={[styles.gridItemText, isSelected && styles.selectedItemText]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Select Date of Birth</Text>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeBtn}
                                accessibilityLabel="Close date picker"
                                accessibilityRole="button"
                            >
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* Custom Tabs */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'year' && styles.activeTabButton]}
                                onPress={() => setActiveTab('year')}
                            >
                                <Text style={styles.tabLabel}>Year</Text>
                                <Text style={[styles.tabValue, activeTab === 'year' && styles.activeTabValue]}>
                                    {selectedYear}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'month' && styles.activeTabButton]}
                                onPress={() => setActiveTab('month')}
                            >
                                <Text style={styles.tabLabel}>Month</Text>
                                <Text style={[styles.tabValue, activeTab === 'month' && styles.activeTabValue]}>
                                    {MONTHS[selectedMonth]}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'day' && styles.activeTabButton]}
                                onPress={() => setActiveTab('day')}
                            >
                                <Text style={styles.tabLabel}>Day</Text>
                                <Text style={[styles.tabValue, activeTab === 'day' && styles.activeTabValue]}>
                                    {selectedDay}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Content Area */}
                        <View style={styles.content}>
                            {activeTab === 'year' && (
                                <FlatList
                                    ref={yearFlatListRef}
                                    data={yearsList}
                                    keyExtractor={(item) => item.toString()}
                                    renderItem={renderYearItem}
                                    numColumns={3}
                                    getItemLayout={(_, index) => ({
                                        length: 56,
                                        offset: 56 * index,
                                        index,
                                    })}
                                    contentContainerStyle={styles.listContent}
                                />
                            )}

                            {activeTab === 'month' && (
                                <View style={styles.monthGrid}>
                                    {MONTHS.map((month, index) => {
                                        const isSelected = index === selectedMonth;
                                        return (
                                            <TouchableOpacity
                                                key={month}
                                                style={[styles.gridItem, isSelected && styles.selectedItem]}
                                                onPress={() => {
                                                    setSelectedMonth(index);
                                                    setActiveTab('day');
                                                }}
                                            >
                                                <Text style={[styles.gridItemText, isSelected && styles.selectedItemText]}>
                                                    {month}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {activeTab === 'day' && (
                                <FlatList
                                    data={Array.from({ length: daysInMonth }, (_, i) => i + 1)}
                                    keyExtractor={(item) => item.toString()}
                                    numColumns={7}
                                    contentContainerStyle={styles.listContent}
                                    renderItem={({ item }) => {
                                        const isSelected = item === selectedDay;
                                        return (
                                            <TouchableOpacity
                                                style={[styles.dayGridItem, isSelected && styles.daySelectedItem]}
                                                onPress={() => setSelectedDay(item)}
                                            >
                                                <Text style={[styles.gridItemText, isSelected && styles.selectedItemText]}>
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            )}
                        </View>

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                                <Text style={styles.confirmText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    safeArea: {
        width: '100%',
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.75,
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    closeBtn: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        padding: 6,
        marginHorizontal: 20,
        marginVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 8,
    },
    activeTabButton: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    tabLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tabValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginTop: 2,
    },
    activeTabValue: {
        color: '#2563eb',
    },
    content: {
        height: 260,
        paddingHorizontal: 16,
    },
    listContent: {
        paddingVertical: 6,
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingVertical: 6,
    },
    gridItem: {
        width: '30%',
        marginHorizontal: '1.6%',
        marginVertical: 6,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    selectedItem: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    dayGridItem: {
        width: '11.4%',
        marginHorizontal: '1.4%',
        marginVertical: 6,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    daySelectedItem: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    gridItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    selectedItemText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    confirmButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    confirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
