import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';
import { EmptyState } from '@components/common/EmptyState';
import { paymentService } from '@services/payment/paymentService';
import { Transaction } from '@types/payment';

export const PaymentHistoryScreen: React.FC = () => {
    const theme = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTransactions = async () => {
        try {
            const data = await paymentService.getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Failed to load transactions', error);
            Alert.alert('Error', 'Could not load transactions. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.neutral.surface }]}>
            <View style={styles.row}>
                <Text style={[styles.amount, { color: theme.colors.neutral.textPrimary }]}>
                    {item.amount} {item.currency.toUpperCase()}
                </Text>
                <Text style={[styles.status, { color: theme.colors.success.main }]}>{item.status}</Text>
            </View>
            <Text style={[styles.description, { color: theme.colors.neutral.textSecondary }]} numberOfLines={1}>
                {item.description || 'Payment'}
            </Text>
            <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: theme.colors.neutral.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleString()}
                </Text>
                {item.paymentMethodType && (
                    <Text style={[styles.meta, { color: theme.colors.neutral.textSecondary }]}>
                        {item.paymentMethodType}
                    </Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <AppHeader title="Transactions" showBack />
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTransactions(); }} />
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.loading}>
                            <ActivityIndicator color={theme.colors.primary.main} />
                        </View>
                    ) : (
                        <EmptyState
                            title="No Transactions"
                            description="Complete a payment to see it here."
                        />
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    card: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    status: {
        fontSize: 12,
        textTransform: 'capitalize',
    },
    description: {
        marginTop: 4,
        fontSize: 14,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    meta: {
        fontSize: 12,
    },
    loading: {
        padding: 32,
        alignItems: 'center',
    },
});
