import { ActivityIndicator } from 'react-native';
import { announcementsApi } from '../../services/api';
import * as SecureStore from 'expo-secure-store';
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
import { ArrowLeft, Send, AlertTriangle, Users, BookOpen, Calendar } from 'lucide-react-native';

export default function BroadcastNoticeScreen({ navigation }: any) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('Academic');
    const [targetAudience, setTargetAudience] = useState('All');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { label: 'Academic', icon: BookOpen },
        { label: 'Event', icon: Calendar },
        { label: 'Admin', icon: Users },
    ];

    const audiences = ['All', 'Faculty', 'Students'];

    const handleBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            Alert.alert('Missing Fields', 'Please fill in both the title and message before broadcasting.');
            return;
        }

        setIsSubmitting(true);
        try {
            await announcementsApi.create({
                title,
                message,
                category,
                targetAudience,
                isUrgent
            });

            Alert.alert(
                'Notice Broadcasted',
                `Your notice "${title}" has been sent successfully.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error('Error broadcasting notice:', error);
            const status = error.response?.status;
            if (status === 401) {
                // Stale or invalid token — clear it and force re-login
                await SecureStore.deleteItemAsync('userToken');
                Alert.alert(
                    'Session Expired',
                    'Your session has expired or is invalid. Please log in again.',
                    [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                );
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to send the notice.');
            }
        } finally {
            setIsSubmitting(false);
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
                <Text style={styles.headerTitle}>Broadcast Notice</Text>
                <View style={{ width: 36 }} /> {/* Empty view for balance */}
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Title Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Notice Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter notice title..."
                        placeholderTextColor="#A0AEC0"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Target Audience */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Target Audience</Text>
                    <View style={styles.row}>
                        {audiences.map((aud) => (
                            <TouchableOpacity
                                key={aud}
                                style={[styles.chip, targetAudience === aud && styles.chipActive]}
                                onPress={() => setTargetAudience(aud)}
                            >
                                <Text style={[styles.chipText, targetAudience === aud && styles.chipTextActive]}>
                                    {aud}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Category Selection */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.row}>
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = category === cat.label;
                            return (
                                <TouchableOpacity
                                    key={cat.label}
                                    style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                                    onPress={() => setCategory(cat.label)}
                                >
                                    <Icon size={18} color={isActive ? '#FFFFFF' : '#4A5568'} />
                                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Message Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Message Content</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Type your announcement here..."
                        placeholderTextColor="#A0AEC0"
                        multiline
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />
                </View>

                {/* Urgent Toggle */}
                <TouchableOpacity
                    style={[styles.urgentToggle, isUrgent && styles.urgentToggleActive]}
                    onPress={() => setIsUrgent(!isUrgent)}
                    activeOpacity={0.8}
                >
                    <AlertTriangle size={20} color={isUrgent ? '#E53E3E' : '#A0AEC0'} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.urgentTitle, isUrgent && { color: '#E53E3E' }]}>Mark as Urgent</Text>
                        <Text style={styles.urgentDesc}>
                            Highlights this notice in red and pins it to the top.
                        </Text>
                    </View>
                    <View style={[styles.checkbox, isUrgent && styles.checkboxActive]}>
                        {isUrgent && <View style={styles.checkboxInner} />}
                    </View>
                </TouchableOpacity>

            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.broadcastBtn, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleBroadcast}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Send size={18} color="#FFFFFF" />
                            <Text style={styles.broadcastBtnText}>Broadcast Notice</Text>
                        </>
                    )}
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
    },
    inputGroup: { marginBottom: 20 },
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
        paddingVertical: 14,
        fontSize: 14,
        color: '#2D3748',
    },
    textArea: { height: 120 },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    chip: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    chipActive: {
        backgroundColor: '#1A3A6B',
        borderColor: '#1A3A6B',
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4A5568',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
    categoryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    categoryCardActive: {
        backgroundColor: '#3182CE',
        borderColor: '#3182CE',
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4A5568',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    urgentToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
    },
    urgentToggleActive: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FEB2B2',
    },
    urgentTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D3748',
    },
    urgentDesc: {
        fontSize: 11,
        color: '#A0AEC0',
        marginTop: 2,
    },
    checkbox: {
        width: 22, height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CBD5E0',
        alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: {
        borderColor: '#E53E3E',
    },
    checkboxInner: {
        width: 12, height: 12,
        borderRadius: 3,
        backgroundColor: '#E53E3E',
    },
    bottomBar: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    broadcastBtn: {
        flexDirection: 'row',
        backgroundColor: '#2B6CB0',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    broadcastBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});