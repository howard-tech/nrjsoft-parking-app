import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme'; // Assuming alias exists
import { AppHeader } from '@components/common/AppHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
// You might need an icon component
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { paymentService } from '@services/payment/paymentService';
import { LoadingState } from '@components/common/LoadingState';
import { PaymentMethod } from '@types/payment';

export const PaymentMethodsScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMethods = async () => {
        try {
            setLoading(true);
            const data = await paymentService.getPaymentMethods();
            setMethods(data);
        } catch (error) {
            console.error('Failed to load payment methods', error);
            Alert.alert('Error', 'Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadMethods();
        });
        return unsubscribe;
    }, [navigation]);

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
                    onPress: () => setMethods(prev => prev.filter(m => m.id !== id)),
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: PaymentMethod }) => {
        const iconName = item.type === 'card' ? 'credit-card' : item.type === 'apple_pay' ? 'apple' : 'google';
        const title = item.type === 'card' ? `**** **** **** ${item.last4 ?? '****'}` : item.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay';

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.neutral.surface }]}>
                <View style={styles.cardLeft}>
                    <Icon name={iconName} size={24} color={theme.colors.primary.main} style={styles.icon} />
                    <View>
                        <Text style={[styles.cardTitle, { color: theme.colors.neutral.textPrimary }]}>{title}</Text>
                        {item.type === 'card' && <Text style={[styles.cardSubtitle, { color: theme.colors.neutral.textSecondary }]}>{item.brand ?? 'Card'}</Text>}
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

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
                <AppHeader title="Payment Methods" showBack onBack={() => navigation.goBack()} />
                <LoadingState message="Loading payment methods..." />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <AppHeader title="Payment Methods" showBack onBack={() => navigation.goBack()} />

            <View style={styles.content}>
                <FlatList
                    data={methods}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            title="No Payment Methods"
                            description="Add a payment method to pay for parking easily."
                            icon={<Icon name="credit-card-off-outline" size={48} color={theme.colors.neutral.textSecondary} />}
                        />
                    }
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
});
