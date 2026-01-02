import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';

type Shortcut = {
    key: string;
    title: string;
    icon: string;
    target: { screen: string };
};

const shortcuts: Shortcut[] = [
    { key: 'profile', title: 'Profile', icon: 'user', target: { screen: 'Profile' } },
    { key: 'vehicles', title: 'Vehicles', icon: 'truck', target: { screen: 'Vehicles' } },
    { key: 'payments', title: 'Payment Preferences', icon: 'credit-card', target: { screen: 'PaymentPreferences' } },
    { key: 'notifications', title: 'Notifications', icon: 'bell', target: { screen: 'NotificationSettings' } },
    { key: 'history', title: 'History', icon: 'clock', target: { screen: 'History' } },
    { key: 'help', title: 'Help', icon: 'help-circle', target: { screen: 'Help' } },
];

export const AccountHomeScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const themedStyles = useMemo(
        () =>
            StyleSheet.create({
                container: { backgroundColor: theme.colors.neutral.background },
                title: { color: theme.colors.neutral.textPrimary },
                card: {
                    backgroundColor: theme.colors.neutral.surface,
                    borderColor: theme.colors.neutral.border,
                },
                cardTitle: { color: theme.colors.neutral.textPrimary },
            }),
        [theme.colors]
    );

    return (
        <View style={[styles.container, themedStyles.container]}>
            <Text style={[styles.title, themedStyles.title]}>Account</Text>
            <FlatList
                data={shortcuts}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.card,
                            themedStyles.card,
                            theme.shadows.sm,
                        ]}
                        onPress={() =>
                            navigation.navigate(item.target.screen as never)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={item.title}
                    >
                        <View style={styles.cardLeft}>
                            <Icon name={item.icon} size={20} color={theme.colors.primary.main} />
                            <Text style={[styles.cardTitle, themedStyles.cardTitle]}>
                                {item.title}
                            </Text>
                        </View>
                        <Icon name="chevron-right" size={18} color={theme.colors.neutral.textSecondary} />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    list: {
        gap: 10,
    },
    card: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
});
