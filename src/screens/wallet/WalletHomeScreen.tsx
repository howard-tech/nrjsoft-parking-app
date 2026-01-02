import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useWallet } from '@hooks';
import { formatCurrency } from '@utils/formatters';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const WalletHomeScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { balance, currency, isLoading, refresh } = useWallet();

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleTopUp = () => navigation.navigate('TopUp' as never);
    const handlePaymentMethods = () => navigation.navigate('PaymentMethods' as never);
    const handleHistory = () => navigation.navigate('PaymentHistory' as never);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[theme.colors.primary.main]} />
            }
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>Wallet</Text>
            </View>

            <View style={[styles.balanceCard, { backgroundColor: theme.colors.primary.main }]}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(balance, currency)}</Text>

                <TouchableOpacity
                    style={[styles.topUpButton, { backgroundColor: theme.colors.neutral.white }]}
                    onPress={handleTopUp}
                >
                    <Icon name="plus" size={20} color={theme.colors.primary.main} />
                    <Text style={[styles.topUpButtonText, { color: theme.colors.primary.main }]}>Top Up</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.menuSection}>
                <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.colors.neutral.surface }]}
                    onPress={handlePaymentMethods}
                >
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.primary.background }]}>
                        <Icon name="credit-card-outline" size={24} color={theme.colors.primary.main} />
                    </View>
                    <View style={styles.menuInfo}>
                        <Text style={[styles.menuTitle, { color: theme.colors.neutral.textPrimary }]}>Payment Methods</Text>
                        <Text style={[styles.menuSubtitle, { color: theme.colors.neutral.textSecondary }]}>
                            Manage your cards and platform pay
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={theme.colors.neutral.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.colors.neutral.surface }]}
                    onPress={handleHistory}
                >
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.secondary.background }]}>
                        <Icon name="history" size={24} color={theme.colors.secondary.main} />
                    </View>
                    <View style={styles.menuInfo}>
                        <Text style={[styles.menuTitle, { color: theme.colors.neutral.textPrimary }]}>Transaction History</Text>
                        <Text style={[styles.menuSubtitle, { color: theme.colors.neutral.textSecondary }]}>
                            View your past payments and top-ups
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={theme.colors.neutral.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.colors.neutral.surface }]}
                    onPress={() => navigation.navigate('Subscriptions' as never)}
                >
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.success.background }]}>
                        <Icon name="shield-check-outline" size={24} color={theme.colors.success.main} />
                    </View>
                    <View style={styles.menuInfo}>
                        <Text style={[styles.menuTitle, { color: theme.colors.neutral.textPrimary }]}>Subscriptions</Text>
                        <Text style={[styles.menuSubtitle, { color: theme.colors.neutral.textSecondary }]}>
                            Manage your parking passes
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={theme.colors.neutral.textSecondary} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    balanceCard: {
        margin: 20,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
    },
    balanceLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceAmount: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '800',
        marginVertical: 12,
    },
    topUpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 100,
        marginTop: 8,
    },
    topUpButtonText: {
        fontWeight: '700',
        marginLeft: 6,
    },
    menuSection: {
        paddingHorizontal: 20,
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuInfo: {
        flex: 1,
        marginLeft: 16,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    menuSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
});
