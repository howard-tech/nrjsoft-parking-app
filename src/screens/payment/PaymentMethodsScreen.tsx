import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { paymentService } from '@services/payment/paymentService';
import { PaymentMethod } from '@types/payment';

export const PaymentMethodsScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMethods = async () => {
        try {
            const data = await paymentService.getPaymentMethods();
            setMethods(data);
        } catch (error) {
            console.error('Failed to load payment methods', error);
            Alert.alert('Error', 'Could not load payment methods. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMethods();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddMethod = () => {
        navigation.navigate('AddPaymentMethod' as never);
    };

    const handleDeleteMethod = (id: string) => {
        Alert.alert(
            'Remove Payment Method',
            'Are you sure you want to remove this payment method?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await paymentService.detachPaymentMethod(id);
                            setMethods(prev => prev.filter(m => m.id !== id));
                        } catch (error) {
                            console.error('Failed to remove payment method', error);
                            Alert.alert('Error', 'Could not remove payment method. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: PaymentMethod }) => {
        const iconName = item.type === 'card' ? 'credit-card' : item.type === 'apple_pay' ? 'apple' : 'google';
        const title = item.type === 'card' ? `**** **** **** ${item.last4 ?? ''}` : item.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay';

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.neutral.surface }]}>
                <View style={styles.cardLeft}>
                    <Icon name={iconName} size={24} color={theme.colors.primary.main} style={styles.icon} />
                    <View>
                        <Text style={[styles.cardTitle, { color: theme.colors.neutral.textPrimary }]}>{title}</Text>
                        {item.type === 'card' && item.brand && (
                            <Text style={[styles.cardSubtitle, { color: theme.colors.neutral.textSecondary }]}>{item.brand}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.cardRight}>
                    {item.isDefault && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.success.light }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.success.main }]}>Default</Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteMethod(item.id)} style={styles.deleteBtn}>
                        <Icon name="trash-can-outline" size={20} color={theme.colors.error.main} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const listEmpty = useMemo(() => {
        if (loading) {
            return (
                <View style={styles.loadingState}>
                    <ActivityIndicator color={theme.colors.primary.main} />
                </View>
            );
        }

        return (
            <EmptyState
                title="No Payment Methods"
                description="Add a payment method to pay for parking easily."
                icon={<Icon name="credit-card-off-outline" size={48} color={theme.colors.neutral.textSecondary} />}
            />
        );
    }, [loading, theme.colors]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <AppHeader title="Payment Methods" showBack onBack={() => navigation.goBack()} />

            <View style={styles.content}>
                <FlatList
                    data={methods}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchMethods();
                            }}
                        />
                    }
                    ListEmptyComponent={listEmpty}
                />
            </View>

            <View style={[styles.footer, { backgroundColor: theme.colors.neutral.surface, borderColor: theme.colors.neutral.border }]}>
                <Button title="Add Payment Method" onPress={handleAddMethod} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    cardSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    cardRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    deleteBtn: {
        padding: 4,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        paddingBottom: 32, // For safe area
    },
    loadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
});
