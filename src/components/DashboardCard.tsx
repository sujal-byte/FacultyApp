// src/components/DashboardCard.tsx
import React from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    GestureResponderEvent,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface DashboardCardProps {
    title: string;
    Icon: LucideIcon;
    iconColor: string;
    iconBg: string;
    badgeCount?: number;
    subtitle?: string;
    onPress: (event: GestureResponderEvent) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    Icon,
    iconColor,
    iconBg,
    badgeCount,
    subtitle,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={title}
        >
            {/* Badge */}
            {badgeCount !== undefined && badgeCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
                </View>
            )}

            {/* Icon container */}
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Icon size={28} color={iconColor} strokeWidth={1.8} />
            </View>

            <Text style={styles.title} numberOfLines={2}>
                {title}
            </Text>

            {!!subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                </Text>
            )}

            {/* Arrow indicator */}
            <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 130,
        elevation: 3,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        position: 'relative',
        overflow: 'hidden',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#E53E3E',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        zIndex: 1,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1A3A6B',
        textAlign: 'center',
        letterSpacing: 0.2,
        lineHeight: 17,
    },
    subtitle: {
        fontSize: 10,
        color: '#718096',
        marginTop: 2,
        textAlign: 'center',
    },
    arrow: {
        position: 'absolute',
        bottom: 8,
        right: 12,
        fontSize: 18,
        color: '#CBD5E0',
        fontWeight: '300',
    },
});

export default DashboardCard;