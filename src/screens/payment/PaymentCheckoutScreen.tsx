import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';
import { paymentService } from '@services/payment/paymentService';
import { PaymentMethod } from '@types/payment';
import Config from 'react-native-config';

export const PaymentCheckoutScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string | undefined>();
    const [amount, setAmount] = useState<string>('5.00');
    const [loading, setLoading] = useState(false);

    const fetchMethods = async () => {
        try {
            const data = await paymentService.getPaymentMethods();
            setMethods(data);
            const defaultMethod = data.find((m) => m.isDefault) || data[0];
            setSelectedMethodId(defaultMethod?.id);
        } catch (error) {
            console.error('Failed to load payment methods', error);
            Alert.alert('Error', 'Could not load payment methods');
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handlePay = async () => {
        const value = parseFloat(amount);
        if (!selectedMethodId) {
            Alert.alert('Select a method', 'Please choose a payment method.');
            return;
        }
        if (!value || value <= 0) {
            Alert.alert('Invalid amount', 'Please enter an amount greater than 0.');
            return;
        }

        setLoading(true);
        try {
            const currency = (Config.PAYMENT_CURRENCY_CODE || 'EUR').toLowerCase();
            const result = await paymentService.chargePayment(value, currency, selectedMethodId, 'Test payment');
            if (result.success) {
                Alert.alert(
                    'Payment successful',
                    'Your payment was processed.',
                    [
                        {
                            text: 'View history',
                            onPress: () => navigation.navigate('PaymentHistory' as never),
                        },
                        { text: 'OK' },
                    ]
                );
            } else {
                Alert.alert('Payment failed', result.errorMessage || 'Unable to process payment');
            }
        } catch (error) {
            console.error('Charge error', error);
            Alert.alert('Error', 'Failed to process payment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <AppHeader title="Process Payment" showBack />
            <View style={styles.content}>
                <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>Amount</Text>
                <TextInput
                    style={[styles.input, { borderColor: theme.colors.neutral.border, color: theme.colors.neutral.textPrimary }]}
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                />

                <Text style={[styles.label, styles.labelSpacing, { color: theme.colors.neutral.textSecondary }]}>Payment Method</Text>
                {methods.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={[
                            styles.methodCard,
                            {
                                borderColor: selectedMethodId === method.id ? theme.colors.primary.main : theme.colors.neutral.border,
                            },
                        ]}
                        onPress={() => setSelectedMethodId(method.id)}
                    >
                        <Text style={{ color: theme.colors.neutral.textPrimary }}>
                            {method.type === 'card'
                                ? `Card **** ${method.last4 ?? ''}`
                                : method.type === 'apple_pay'
                                    ? 'Apple Pay'
                                    : 'Google Pay'}
                        </Text>
                        {method.isDefault && (
                            <Text style={[styles.defaultBadge, { color: theme.colors.success.main }]}>Default</Text>
                        )}
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={[styles.payButton, { backgroundColor: theme.colors.primary.main }]}
                    onPress={handlePay}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.primary.contrast} />
                    ) : (
                        <Text style={[styles.payText, { color: theme.colors.primary.contrast }]}>Pay Now</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    labelSpacing: {
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    methodCard: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 10,
    },
    defaultBadge: {
        fontSize: 12,
        marginTop: 4,
    },
    payButton: {
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    payText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
