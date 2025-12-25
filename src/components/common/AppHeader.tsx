import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useNotifications } from '@hooks/useNotifications';
import Icon from 'react-native-vector-icons/Feather';

interface AppHeaderProps {
    title?: string;
    showLogo?: boolean;
    showNotificationBadge?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title = 'NRJSoft',
    showLogo = true,
    showNotificationBadge = true,
}) => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const { unreadCount } = useNotifications();

    const handleNotificationPress = () => {
        navigation.navigate('Notifications');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.primary.main }]}>
            <View style={styles.leftSection}>
                {showLogo && (
                    <View style={styles.logoPlaceholder}>
                        <Icon name="activity" color="white" size={24} />
                    </View>
                )}
                <Text style={[styles.title, { color: theme.colors.primary.contrast }]}>
                    {title}
                </Text>
            </View>

            {showNotificationBadge && (
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={handleNotificationPress}
                >
                    <Icon name="bell" color={theme.colors.primary.contrast} size={24} />
                    {unreadCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.secondary.main }]}>
                            <Text style={styles.badgeText}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 48, // Account for status bar
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoPlaceholder: {
        width: 32,
        height: 32,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    notificationButton: {
        position: 'relative',
        padding: 8,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1E3A5F', // matches primary.main
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
});
