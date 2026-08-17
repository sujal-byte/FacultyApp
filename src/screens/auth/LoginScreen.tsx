import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../services/api';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import DobPickerModal from '../../components/DobPickerModal';

export default function LoginScreen({ navigation }: any) {
    const [usn, setUsn] = useState('');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDobPicker, setShowDobPicker] = useState(false);

    const handleLogin = async () => {
        if (!usn || !dob) {
            Alert.alert('Error', 'Please enter both Faculty ID and Date of Birth');
            return;
        }

        try {
            setLoading(true);

            const response = await api.post('/auth/login', {
                usn: usn.trim().toUpperCase(),
                dob: dob.trim()
            });

            await SecureStore.setItemAsync('userToken', response.data.access_token);
            await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));

            Alert.alert('Success', `Welcome back, ${response.data.user.name}!`);
            if (response.data.user?.role === 'ADMIN') {
                navigation.navigate('AdminDashboard');
            } else {
                navigation.navigate('Dashboard');
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert(
                'Login Failed',
                error.response?.data?.message || 'Invalid credentials or network issue.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.card}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.title}>RNSIT Faculty Portal</Text>
                <Text style={styles.subtitle}>RNS Institute of Technology · Bengaluru</Text>

                <TextInput
                    placeholder="Faculty ID / USN (e.g. 1RN25CS001)"
                    placeholderTextColor="#888"
                    value={usn}
                    onChangeText={setUsn}
                    autoCapitalize="characters"
                    style={styles.input}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Date of Birth (e.g. 15/01/2004)"
                        placeholderTextColor="#888"
                        value={dob}
                        onChangeText={setDob}
                        autoCapitalize="none"
                        style={styles.inputInside}
                    />
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setShowDobPicker(true)}
                        accessibilityLabel="Open date of birth picker"
                        accessibilityRole="button"
                    >
                        <CalendarIcon size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <DobPickerModal
                    visible={showDobPicker}
                    onClose={() => setShowDobPicker(false)}
                    onSelectDate={setDob}
                    value={dob}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Login'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#0f172a', // Clean dark theme accent
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A3A6B',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        padding: 14,
        marginBottom: 16,
        borderRadius: 10,
        fontSize: 16,
        color: '#334155',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 10,
        marginBottom: 16,
        paddingHorizontal: 14,
    },
    inputInside: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#334155',
    },
    iconButton: {
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#2563eb',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});