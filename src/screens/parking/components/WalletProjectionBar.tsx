import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { formatCurrency } from '@utils/formatters';

interface WalletProjectionBarProps {
    currentCost: number;
    balance: number;
    status: 'normal' | 'warning' | 'critical';
    currency?: string;
}

export const WalletProjectionBar: React.FC<WalletProjectionBarProps> = ({
    currentCost,
    balance,
    status,
    currency = 'EUR',
}) => {
    const theme = useTheme();
    const percentage = balance > 0 ? Math.min((currentCost / balance) * 100, 100) : 100;

    const barColor =
        status === 'critical'
            ? theme.colors.error.main
            : status === 'warning'
            ? theme.colors.warning.main
            : theme.colors.primary.main;

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={[styles.label, { color: theme.colors.neutral.textPrimary }]}>Wallet projection</Text>
                <Text style={[styles.value, { color: theme.colors.neutral.textSecondary }]}>
                    Balance: {currency} {formatCurrency(balance, currency)}
                </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.colors.neutral.border }]}>
                <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
            </View>
            {status !== 'normal' && (
                <Text style={[styles.warning, { color: barColor }]}>
                    {status === 'critical'
                        ? 'Balance depleted. Top up now.'
                        : 'Balance running low. Consider topping up.'}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    value: {
        fontSize: 14,
    },
    barTrack: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    warning: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
    },
});
