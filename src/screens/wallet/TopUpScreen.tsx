import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { Button } from '../../components/common/Button';
import { paymentService } from '../../services/payment/paymentService';
import { PaymentMethod } from '../../types/payment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '@utils/formatters';

const PRESET_AMOUNTS = [5, 10, 20, 50];

export const TopUpScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedAmount, setSelectedAmount] = useState<number>(10);
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
    const themed = useMemo(
        () =>
            StyleSheet.create({
                amountButtonDefault: {
                    backgroundColor: theme.colors.neutral.surface,
                    borderColor: theme.colors.primary.main,
                },
                amountButtonSelected: {
                    backgroundColor: theme.colors.primary.main,
                    borderColor: theme.colors.primary.main,
                },
                amountTextSelected: { color: '#FFFFFF' },
                amountTextDefault: { color: theme.colors.neutral.textPrimary },
                methodItemBase: { backgroundColor: theme.colors.neutral.surface },
                methodItemSelected: { borderColor: theme.colors.primary.main, borderWidth: 2 },
            }),
        [theme.colors.neutral.surface, theme.colors.neutral.textPrimary, theme.colors.primary.main]
    );

    const fetchMethods = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await paymentService.getPaymentMethods();
            setMethods(data);
            const defaultMethod = data.find(m => m.isDefault) || data[0];
            if (defaultMethod) {
                setSelectedMethodId(defaultMethod.id);
            }
        } catch (error) {
            console.error('Failed to fetch payment methods', error);
            Alert.alert('Error', 'Could not load payment methods.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMethods();
    }, [fetchMethods]);

    const handleTopUp = async () => {
        if (!selectedMethodId || !selectedAmount) {
            Alert.alert('Selection Required', 'Please select an amount and a payment method.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await paymentService.chargePayment(
                selectedAmount,
                'EUR', // Fallback to EUR
                selectedMethodId,
                `Wallet Top-up: ${selectedAmount} EUR`
            );

            if (result.success) {
                Alert.alert(
                    'Success',
                    `Successfully topped up ${formatCurrency(selectedAmount, 'EUR')} to your wallet.`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                throw new Error(result.errorMessage || 'Payment failed');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'There was an issue processing your request.';
            console.error('Top-up failed', error);
            Alert.alert('Top-up Failed', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.neutral.background }]}>
                <ActivityIndicator color={theme.colors.primary.main} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>Top Up Wallet</Text>
                <Text style={[styles.subtitle, { color: theme.colors.neutral.textSecondary }]}>
                    Select an amount to add to your balance
                </Text>

                <View style={styles.amountGrid}>
                    {PRESET_AMOUNTS.map((amount) => (
                        <TouchableOpacity
                            key={amount}
                            style={[
                                styles.amountCard,
                                selectedAmount === amount
                                    ? themed.amountButtonSelected
                                    : themed.amountButtonDefault,
                            ]}
                            onPress={() => setSelectedAmount(amount)}
                        >
                            <Text
                                style={[
                                    styles.amountText,
                                    selectedAmount === amount
                                        ? themed.amountTextSelected
                                        : themed.amountTextDefault,
                                ]}
                            >
                                €{amount}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textPrimary }]}>Payment Method</Text>

                {methods.length === 0 ? (
                    <View style={[styles.emptyMethods, { backgroundColor: theme.colors.neutral.surface }]}>
                        <Icon name="credit-card-plus" size={32} color={theme.colors.neutral.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.colors.neutral.textSecondary }]}>
                            No payment methods found
                        </Text>
                        <Button
                            title="Add Payment Method"
                            variant="primary"
                            onPress={() => navigation.navigate('PaymentMethods' as never)}
                            style={styles.addButton}
                        />
                    </View>
                ) : (
                    methods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.methodItem,
                                themed.methodItemBase,
                                selectedMethodId === method.id ? themed.methodItemSelected : null,
                            ]}
                            onPress={() => setSelectedMethodId(method.id)}
                        >
                            <Icon
                                name={method.type === 'card' ? 'credit-card' : method.type === 'apple_pay' ? 'apple' : 'google'}
                                size={24}
                                color={theme.colors.neutral.textPrimary}
                            />
                            <View style={styles.methodInfo}>
                                <Text style={[styles.methodName, { color: theme.colors.neutral.textPrimary }]}>
                                    {method.type === 'card' ? `${method.brand} •••• ${method.last4}` :
                                        method.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
                                </Text>
                                {method.isDefault && (
                                    <Text style={[styles.defaultLabel, { color: theme.colors.primary.main }]}>Default</Text>
                                )}
                            </View>
                            {selectedMethodId === method.id && (
                                <Icon name="check-circle" size={24} color={theme.colors.primary.main} />
                            )}
                        </TouchableOpacity>
                    ))
                )}

                <Button
                    title={`Pay €${selectedAmount}`}
                    variant="primary"
                    onPress={handleTopUp}
                    loading={isSubmitting}
                    disabled={!selectedMethodId || isSubmitting}
                    style={styles.submitButton}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 32,
        marginBottom: 16,
    },
    amountGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    amountCard: {
        flex: 1,
        minWidth: '45%',
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    amountText: {
        fontSize: 20,
        fontWeight: '700',
    },
    methodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    methodInfo: {
        flex: 1,
        marginLeft: 12,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
    },
    defaultLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 2,
    },
    submitButton: {
        marginTop: 40,
        marginBottom: 20,
    },
    emptyMethods: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    addButton: {
        marginTop: 8,
        alignSelf: 'stretch',
    },
});
