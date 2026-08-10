// src/screens/LoginScreen.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { DEMO_FACULTY, VALID_CREDENTIALS } from '../data/mockData';
import CalendarModal from '../components/CalendarModal';
import {
    Calendar,
    Eye,
    EyeOff,
    User,
    CakeSlice,
    LogIn,
    GraduationCap,
    Shield,
} from 'lucide-react-native';

type LoginScreenNav = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNav;
}

// Validates date string in DD/MM/YYYY format
const isValidDateFormat = (str: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(str)) return false;
    const [, day, month, year] = str.match(regex)!;
    const d = new Date(`${year}-${month}-${day}`);
    return !isNaN(d.getTime());
};

// Convert DD/MM/YYYY -> YYYY-MM-DD for comparison
const toISODate = (dob: string): string => {
    const [day, month, year] = dob.split('/');
    return `${year}-${month}-${day}`;
};

// Format date input automatically as user types
const formatDateInput = (raw: string, prev: string): string => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [facultyId, setFacultyId] = useState('');
    const [dob, setDob] = useState('');
    const [showCalModal, setShowCalModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ facultyId?: string; dob?: string }>({});
    const [secureEntry, setSecureEntry] = useState(true);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const validate = (): boolean => {
        const newErrors: { facultyId?: string; dob?: string } = {};
        if (!facultyId.trim()) {
            newErrors.facultyId = 'Faculty ID is required.';
        } else if (!/^FAC-\d{4}-\d{4}$/.test(facultyId.trim())) {
            newErrors.facultyId = 'Invalid format. Use FAC-YYYY-NNNN';
        }
        if (!dob.trim()) {
            newErrors.dob = 'Date of Birth is required.';
        } else if (!isValidDateFormat(dob.trim())) {
            newErrors.dob = 'Invalid date. Use DD/MM/YYYY';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) {
            shake();
            return;
        }

        setLoading(true);

        // Simulate network call (replace with API call in production)
        await new Promise((res) => setTimeout(res, 1400));

        const idMatch = facultyId.trim() === VALID_CREDENTIALS.facultyId;
        const dobMatch = toISODate(dob.trim()) === VALID_CREDENTIALS.dob;

        setLoading(false);

        if (idMatch && dobMatch) {
            navigation.replace('Dashboard', { faculty: DEMO_FACULTY });
        } else {
            shake();
            setErrors({
                facultyId: !idMatch ? 'Faculty ID not found.' : undefined,
                dob: !dobMatch ? 'Date of Birth does not match.' : undefined,
            });
            Alert.alert(
                'Authentication Failed',
                'The Faculty ID or Date of Birth is incorrect. Please try again.',
                [{ text: 'OK', style: 'default' }]
            );
        }
    };

    const handleDobChange = (text: string) => {
        setDob(formatDateInput(text, dob));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.kav}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Bar */}
                    <View style={styles.headerBar}>
                        <View style={styles.headerLeft}>
                            <GraduationCap size={22} color="#FFFFFF" strokeWidth={2} />
                            <Text style={styles.headerTitle}>Faculty Portal</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.calBtn}
                            onPress={() => setShowCalModal(true)}
                            accessibilityLabel="Open academic calendar"
                            accessibilityRole="button"
                        >
                            <Calendar size={22} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>

                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.logoCircle}>
                            <Shield size={36} color="#FFFFFF" strokeWidth={1.5} />
                        </View>
                        <Text style={styles.heroTitle}>Welcome Back</Text>
                        <Text style={styles.heroSubtitle}>
                            Sign in with your Faculty credentials to access your portal
                        </Text>
                    </View>

                    {/* Form Card */}
                    <Animated.View
                        style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}
                    >
                        <Text style={styles.formTitle}>Faculty Authentication</Text>
                        <Text style={styles.formSubtitle}>
                            Demo credentials: FAC-2024-0042 / 15/03/1985
                        </Text>

                        {/* Faculty ID */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Faculty ID Number</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    errors.facultyId ? styles.inputError : null,
                                ]}
                            >
                                <User size={18} color={errors.facultyId ? '#E53E3E' : '#A0AEC0'} />
                                <TextInput
                                    style={styles.input}
                                    value={facultyId}
                                    onChangeText={(t) => {
                                        setFacultyId(t.toUpperCase());
                                        setErrors((e) => ({ ...e, facultyId: undefined }));
                                    }}
                                    placeholder="e.g. FAC-2024-0042"
                                    placeholderTextColor="#CBD5E0"
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    accessibilityLabel="Faculty ID Number"
                                    editable={!loading}
                                />
                            </View>
                            {errors.facultyId && (
                                <Text style={styles.errorText}>{errors.facultyId}</Text>
                            )}
                        </View>

                        {/* Date of Birth */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    errors.dob ? styles.inputError : null,
                                ]}
                            >
                                <CakeSlice size={18} color={errors.dob ? '#E53E3E' : '#A0AEC0'} />
                                <TextInput
                                    style={styles.input}
                                    value={dob}
                                    onChangeText={handleDobChange}
                                    placeholder="DD/MM/YYYY"
                                    placeholderTextColor="#CBD5E0"
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                    secureTextEntry={secureEntry}
                                    accessibilityLabel="Date of Birth"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setSecureEntry((v) => !v)}
                                    accessibilityLabel={secureEntry ? 'Show date' : 'Hide date'}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    {secureEntry ? (
                                        <Eye size={18} color="#A0AEC0" />
                                    ) : (
                                        <EyeOff size={18} color="#A0AEC0" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            {errors.dob && (
                                <Text style={styles.errorText}>{errors.dob}</Text>
                            )}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Sign In"
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <LogIn size={18} color="#FFFFFF" strokeWidth={2.5} />
                                    <Text style={styles.loginBtnText}>Sign In</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Security Note */}
                        <View style={styles.secNote}>
                            <Shield size={13} color="#718096" />
                            <Text style={styles.secNoteText}>
                                Secured access. Authorized faculty only.
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Footer */}
                    <Text style={styles.footer}>
                        Technical issues? Contact IT Helpdesk: it@college.edu.in
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>

            <CalendarModal
                visible={showCalModal}
                onClose={() => setShowCalModal(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0F2754',
    },
    kav: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingBottom: 32,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#0F2754',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    calBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
        backgroundColor: '#0F2754',
    },
    logoCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.65)',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginHorizontal: 16,
        marginTop: -4,
        padding: 24,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A3A6B',
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 12,
        color: '#A0AEC0',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A5568',
        marginBottom: 7,
        letterSpacing: 0.2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    inputError: {
        borderColor: '#FC8181',
        backgroundColor: '#FFF5F5',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#2D3748',
        fontWeight: '500',
        padding: 0,
    },
    errorText: {
        fontSize: 12,
        color: '#E53E3E',
        marginTop: 5,
        marginLeft: 2,
    },
    loginBtn: {
        backgroundColor: '#1A3A6B',
        borderRadius: 12,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 8,
        elevation: 4,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    loginBtnDisabled: {
        opacity: 0.7,
    },
    loginBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    secNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        marginTop: 16,
    },
    secNoteText: {
        fontSize: 11,
        color: '#A0AEC0',
    },
    footer: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        marginTop: 24,
        paddingHorizontal: 20,
    },
});

export default LoginScreen;