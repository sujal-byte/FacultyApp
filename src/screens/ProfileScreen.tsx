// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { DEMO_FACULTY } from '../data/mockData';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    Shield,
    Lock,
    Edit2,
    Check,
    X,
    Eye,
    EyeOff,
    Briefcase,
} from 'lucide-react-native';

type ProfileScreenNav = StackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRoute = RouteProp<RootStackParamList, 'Profile'>;

interface Props {
    navigation: ProfileScreenNav;
    route: ProfileScreenRoute;
}

const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
    const { faculty } = route.params;

    // Local form states
    const [isEditing, setIsEditing] = useState(false);
    const [phone, setPhone] = useState(faculty.phone || '');
    const [officeRoom, setOfficeRoom] = useState(faculty.officeRoom || '');
    const [qualification, setQualification] = useState(faculty.qualification || '');
    const [specialization, setSpecialization] = useState(faculty.specialization || '');
    const [experience, setExperience] = useState(faculty.experience || '');
    const [portalPin, setPortalPin] = useState(faculty.portalPin || '');

    // UI States
    const [showPin, setShowPin] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleCancel = () => {
        // Reset states to original values
        setPhone(faculty.phone || '');
        setOfficeRoom(faculty.officeRoom || '');
        setQualification(faculty.qualification || '');
        setSpecialization(faculty.specialization || '');
        setExperience(faculty.experience || '');
        setPortalPin(faculty.portalPin || '');
        setErrors({});
        setIsEditing(false);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-]{10,15}$/.test(phone.trim())) {
            newErrors.phone = 'Invalid phone format (10-15 digits)';
        }

        if (!officeRoom.trim()) {
            newErrors.officeRoom = 'Office cabin/room is required';
        }

        if (!qualification.trim()) {
            newErrors.qualification = 'Qualification is required';
        }

        if (!specialization.trim()) {
            newErrors.specialization = 'Specialization is required';
        }

        if (!experience.trim()) {
            newErrors.experience = 'Experience is required';
        }

        if (!portalPin.trim()) {
            newErrors.portalPin = 'Portal PIN is required';
        } else if (!/^\d{4}$/.test(portalPin.trim())) {
            newErrors.portalPin = 'Portal PIN must be a 4-digit number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please check the highlighted fields.');
            return;
        }

        // Update the faculty object properties (mutates current memory/reference)
        const updatedFaculty = {
            ...faculty,
            phone: phone.trim(),
            officeRoom: officeRoom.trim(),
            qualification: qualification.trim(),
            specialization: specialization.trim(),
            experience: experience.trim(),
            portalPin: portalPin.trim(),
        };

        // Assign back to referenced object
        Object.assign(faculty, updatedFaculty);
        
        // Also update the global DEMO_FACULTY to stay fully in sync
        Object.assign(DEMO_FACULTY, updatedFaculty);

        setIsEditing(false);
        Alert.alert('Success', 'Profile details updated successfully!');

        // Pass updated faculty back to Dashboard so it immediately re-renders
        navigation.navigate('Dashboard', { faculty: updatedFaculty });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0F2754" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => {
                        if (isEditing) {
                            Alert.alert(
                                'Discard Changes',
                                'You have unsaved changes. Do you want to discard them?',
                                [
                                    { text: 'Keep Editing', style: 'cancel' },
                                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
                                ]
                            );
                        } else {
                            navigation.goBack();
                        }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <Text style={styles.headerSub}>{faculty.department}</Text>
                </View>
                {!isEditing ? (
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => setIsEditing(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Edit profile"
                    >
                        <Edit2 size={18} color="#FFFFFF" />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 60 }} />
                )}
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top Avatar Card */}
                    <View style={styles.avatarCard}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{getInitials(faculty.name)}</Text>
                        </View>
                        <Text style={styles.facultyName}>{faculty.name}</Text>
                        <Text style={styles.designationText}>{faculty.designation}</Text>
                        <View style={styles.deptBadge}>
                            <Text style={styles.deptBadgeText}>{faculty.department}</Text>
                        </View>
                    </View>

                    {/* Section 1: Personal Details (Read-only) */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <User size={18} color="#1A3A6B" strokeWidth={2.5} />
                            <Text style={styles.sectionTitle}>Personal Details</Text>
                            <Text style={styles.readOnlyLabel}>Locked</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Faculty ID</Text>
                            <Text style={styles.infoValueReadonly}>{faculty.id}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Gender</Text>
                            <Text style={styles.infoValueReadonly}>{faculty.gender || 'Not Specified'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date of Birth</Text>
                            <Text style={styles.infoValueReadonly}>{faculty.dob || 'Not Specified'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date of Joining</Text>
                            <Text style={styles.infoValueReadonly}>{faculty.joiningDate || 'Not Specified'}</Text>
                        </View>
                    </View>

                    {/* Section 2: Contact Information (Editable) */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Phone size={18} color="#1A3A6B" strokeWidth={2.5} />
                            <Text style={styles.sectionTitle}>Contact Info</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Official Email</Text>
                            <View style={styles.emailWrapper}>
                                <Mail size={14} color="#A0AEC0" style={{ marginRight: 6 }} />
                                <Text style={styles.infoValueReadonly}>{faculty.email}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Mobile Number</Text>
                            {isEditing ? (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input, errors.phone && styles.inputErrorBorder]}
                                        value={phone}
                                        onChangeText={(text) => {
                                            setPhone(text);
                                            if (errors.phone) setErrors({ ...errors, phone: '' });
                                        }}
                                        keyboardType="phone-pad"
                                        placeholder="e.g. +91 98765 43210"
                                    />
                                    {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                                </View>
                            ) : (
                                <Text style={styles.infoValue}>{phone}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Office / Cabin</Text>
                            {isEditing ? (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input, errors.officeRoom && styles.inputErrorBorder]}
                                        value={officeRoom}
                                        onChangeText={(text) => {
                                            setOfficeRoom(text);
                                            if (errors.officeRoom) setErrors({ ...errors, officeRoom: '' });
                                        }}
                                        placeholder="e.g. Cabin 402, Ramanujan Block"
                                    />
                                    {errors.officeRoom ? <Text style={styles.errorText}>{errors.officeRoom}</Text> : null}
                                </View>
                            ) : (
                                <Text style={styles.infoValue}>{officeRoom}</Text>
                            )}
                        </View>
                    </View>

                    {/* Section 3: Academic Credentials (Editable) */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Award size={18} color="#1A3A6B" strokeWidth={2.5} />
                            <Text style={styles.sectionTitle}>Academic Qualifications</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Highest Degree</Text>
                            {isEditing ? (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input, errors.qualification && styles.inputErrorBorder]}
                                        value={qualification}
                                        onChangeText={(text) => {
                                            setQualification(text);
                                            if (errors.qualification) setErrors({ ...errors, qualification: '' });
                                        }}
                                        placeholder="e.g. Ph.D. in Computer Science"
                                    />
                                    {errors.qualification ? <Text style={styles.errorText}>{errors.qualification}</Text> : null}
                                </View>
                            ) : (
                                <Text style={styles.infoValue}>{qualification}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Specialization</Text>
                            {isEditing ? (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input, errors.specialization && styles.inputErrorBorder]}
                                        value={specialization}
                                        onChangeText={(text) => {
                                            setSpecialization(text);
                                            if (errors.specialization) setErrors({ ...errors, specialization: '' });
                                        }}
                                        placeholder="e.g. Machine Learning"
                                    />
                                    {errors.specialization ? <Text style={styles.errorText}>{errors.specialization}</Text> : null}
                                </View>
                            ) : (
                                <Text style={styles.infoValue}>{specialization}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Teaching Experience</Text>
                            {isEditing ? (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input, errors.experience && styles.inputErrorBorder]}
                                        value={experience}
                                        onChangeText={(text) => {
                                            setExperience(text);
                                            if (errors.experience) setErrors({ ...errors, experience: '' });
                                        }}
                                        placeholder="e.g. 12 Years"
                                    />
                                    {errors.experience ? <Text style={styles.errorText}>{errors.experience}</Text> : null}
                                </View>
                            ) : (
                                <Text style={styles.infoValue}>{experience}</Text>
                            )}
                        </View>
                    </View>

                    {/* Section 4: Portal settings & security (Editable PIN) */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Shield size={18} color="#1A3A6B" strokeWidth={2.5} />
                            <Text style={styles.sectionTitle}>Portal Access Security</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Portal PIN (4 Digits)</Text>
                            {isEditing ? (
                                <View style={styles.inputContainer}>
                                    <View style={styles.pinInputWrapper}>
                                        <TextInput
                                            style={[styles.pinInput, errors.portalPin && styles.inputErrorBorder]}
                                            value={portalPin}
                                            onChangeText={(text) => {
                                                setPortalPin(text.replace(/\D/g, '').slice(0, 4));
                                                if (errors.portalPin) setErrors({ ...errors, portalPin: '' });
                                            }}
                                            keyboardType="number-pad"
                                            secureTextEntry={!showPin}
                                            placeholder="XXXX"
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeBtn}
                                            onPress={() => setShowPin(!showPin)}
                                        >
                                            {showPin ? <EyeOff size={18} color="#718096" /> : <Eye size={18} color="#718096" />}
                                        </TouchableOpacity>
                                    </View>
                                    {errors.portalPin ? <Text style={styles.errorText}>{errors.portalPin}</Text> : null}
                                </View>
                            ) : (
                                <View style={styles.pinDisplayWrapper}>
                                    <Text style={styles.infoValue}>
                                        {showPin ? portalPin : '••••'}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.eyeBtnCompact}
                                        onPress={() => setShowPin(!showPin)}
                                    >
                                        {showPin ? <EyeOff size={16} color="#718096" /> : <Eye size={16} color="#718096" />}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Bottom Buttons for Edit Mode */}
                    {isEditing && (
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={handleCancel}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel edits"
                            >
                                <X size={16} color="#4A5568" />
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleSave}
                                accessibilityRole="button"
                                accessibilityLabel="Save edits"
                            >
                                <Check size={16} color="#FFFFFF" />
                                <Text style={styles.saveBtnText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0F2754',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 12,
        backgroundColor: '#0F2754',
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerSub: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
        marginTop: 1,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#C6A800',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    editBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    avatarCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#C6A800',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#EDF2F7',
        marginBottom: 12,
        elevation: 2,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    facultyName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A3A6B',
        marginBottom: 4,
    },
    designationText: {
        fontSize: 13,
        color: '#4A5568',
        fontWeight: '600',
        marginBottom: 10,
    },
    deptBadge: {
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BEE3F8',
    },
    deptBadgeText: {
        fontSize: 11,
        color: '#2B6CB0',
        fontWeight: '700',
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1A3A6B',
        flex: 1,
    },
    readOnlyLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#718096',
        backgroundColor: '#EDF2F7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#EDF2F7',
        marginBottom: 14,
    },
    infoRow: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D3748',
    },
    infoValueReadonly: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
    },
    emailWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputContainer: {
        width: '100%',
        marginTop: 2,
    },
    input: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#2D3748',
        fontWeight: '600',
    },
    inputErrorBorder: {
        borderColor: '#E53E3E',
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        color: '#E53E3E',
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
        marginLeft: 2,
    },
    pinInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E0',
        borderRadius: 8,
        paddingRight: 8,
    },
    pinInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#2D3748',
        fontWeight: '600',
        letterSpacing: 4,
    },
    pinDisplayWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    eyeBtn: {
        padding: 6,
    },
    eyeBtnCompact: {
        padding: 4,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
        marginBottom: 20,
    },
    cancelBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#EDF2F7',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CBD5E0',
    },
    cancelBtnText: {
        color: '#4A5568',
        fontSize: 14,
        fontWeight: '700',
    },
    saveBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#1A3A6B',
        paddingVertical: 12,
        borderRadius: 10,
        elevation: 2,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default ProfileScreen; // end of ProfileScreen component
