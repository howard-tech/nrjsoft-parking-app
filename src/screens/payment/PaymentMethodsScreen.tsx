import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { paymentService } from '@services/payment/paymentService';
import { googlePayService } from '@services/payment/googlePayService';
import { applePayService } from '@services/payment/applePayService';
import { PaymentMethod } from '@types/payment';
import { PlatformPay, usePlatformPay } from '@stripe/stripe-react-native';
import Config from 'react-native-config';

export const PaymentMethodsScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [platformPayLoading, setPlatformPayLoading] = useState(false);
    const [defaultUpdating, setDefaultUpdating] = useState<string | null>(null);
    const { isPlatformPaySupported, confirmPlatformPayPayment } = usePlatformPay();
    const countryCode = Config.PAYMENT_COUNTRY_CODE || 'DE';
    const currencyCode = Config.PAYMENT_CURRENCY_CODE || 'EUR';

    const fetchMethods = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchMethods();
    }, [fetchMethods]);

    const handleAddMethod = () => {
        navigation.navigate('AddPaymentMethod' as never);
    };

    const handleSetDefault = async (id: string) => {
        setDefaultUpdating(id);
        try {
            await paymentService.setDefaultPaymentMethod(id);
            fetchMethods();
        } catch (error) {
            console.error('Failed to set default payment method', error);
            Alert.alert('Error', 'Could not set default payment method. Please try again.');
        } finally {
            setDefaultUpdating(null);
        }
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

    const extractPlatformPayResult = (
        result: PlatformPay.ConfirmPaymentResult | PlatformPay.ConfirmSetupIntentResult
    ) => {
        if ('paymentIntent' in result && result.paymentIntent) {
            return {
                paymentMethodId: result.paymentIntent.paymentMethodId,
                status: result.paymentIntent.status,
                paymentMethod: result.paymentIntent.paymentMethod,
            };
        }

        if ('setupIntent' in result && result.setupIntent) {
            return {
                paymentMethodId: result.setupIntent.paymentMethodId,
                status: result.setupIntent.status,
                paymentMethod: result.setupIntent.paymentMethod,
            };
        }

        return { paymentMethodId: undefined, status: undefined, paymentMethod: undefined };
    };

    const handleAddGooglePay = async () => {
        if (!googlePayService.isSupported()) {
            Alert.alert('Not Available', 'Google Pay is not available on this device.');
            return;
        }

        setPlatformPayLoading(true);
        try {
            // Check if Platform Pay is supported and initialized
            const supported = await isPlatformPaySupported();
            if (!supported) {
                throw new Error('Google Pay is not supported on this device');
            }

            // Create a setup intent for saving payment method (amount=0, type='setup')
            const intent = await paymentService.createPaymentIntent(0, currencyCode.toLowerCase(), {
                type: 'setup',
                metadata: { source: 'google_pay' },
            });

            if (!intent.clientSecret) {
                throw new Error('Failed to create setup intent');
            }

            // Confirm with Platform Pay (Google Pay on Android)
            const result = await confirmPlatformPayPayment(intent.clientSecret, {
                googlePay: {
                    ...googlePayService.getInitConfig({
                        countryCode,
                        currencyCode,
                    }),
                    currencyCode,
                },
            });

            if (result.error) {
                if (result.error.code === 'Canceled') {
                    // User cancelled - no error alert
                    return;
                }
                throw new Error(result.error.message || 'Google Pay failed');
            }

            // Inspect result status. Platform Pay can return paymentIntent or setupIntent.
            const { paymentMethodId, status } = extractPlatformPayResult(result);
            const normalizedStatus = status ?? 'Succeeded';

            if (normalizedStatus !== 'Succeeded' && normalizedStatus !== 'RequiresCapture') {
                throw new Error('Google Pay confirmation failed with status: ' + normalizedStatus);
            }

            if (paymentMethodId) {
                await paymentService.attachPaymentMethod(paymentMethodId, 'google_pay');
                Alert.alert('Success', 'Google Pay added successfully');
                fetchMethods();
            } else {
                throw new Error('No payment method retrieved from Google Pay');
            }
        } catch (error) {
            console.error('Google Pay error', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process Google Pay');
        } finally {
            setPlatformPayLoading(false);
        }
    };

    const handleAddApplePay = async () => {
        if (!applePayService.isSupported()) {
            Alert.alert('Not Available', 'Apple Pay is not available on this device.');
            return;
        }

        setPlatformPayLoading(true);
        try {
            const supported = await isPlatformPaySupported();
            if (!supported) {
                throw new Error('Apple Pay is not supported on this device');
            }

            // Create a setup intent for saving payment method
            const intent = await paymentService.createPaymentIntent(0, currencyCode.toLowerCase(), {
                type: 'setup',
                metadata: { source: 'apple_pay' },
            });

            if (!intent.clientSecret) {
                throw new Error('Failed to create setup intent');
            }

            // Confirm with Platform Pay (Apple Pay on iOS)
            const result = await confirmPlatformPayPayment(intent.clientSecret, {
                applePay: applePayService.getInitConfig(),
            });

            if (result.error) {
                if (result.error.code === 'Canceled') {
                    return;
                }
                throw new Error(result.error.message || 'Apple Pay failed');
            }

            const { paymentMethodId, status } = extractPlatformPayResult(result);
            const normalizedStatus = status ?? 'Succeeded';

            if (normalizedStatus !== 'Succeeded' && normalizedStatus !== 'RequiresCapture') {
                throw new Error('Apple Pay confirmation failed with status: ' + normalizedStatus);
            }

            if (paymentMethodId) {
                await paymentService.attachPaymentMethod(paymentMethodId, 'apple_pay');
                Alert.alert('Success', 'Apple Pay added successfully');
                fetchMethods();
            } else {
                throw new Error('No payment method retrieved from Apple Pay');
            }
        } catch (error) {
            console.error('Apple Pay error', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process Apple Pay');
        } finally {
            setPlatformPayLoading(false);
        }
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
                    {!item.isDefault && (
                        <TouchableOpacity
                            onPress={() => handleSetDefault(item.id)}
                            style={styles.setDefaultBtn}
                            disabled={defaultUpdating === item.id}
                        >
                            {defaultUpdating === item.id ? (
                                <ActivityIndicator color={theme.colors.primary.main} size="small" />
                            ) : (
                                <Text style={[styles.setDefaultText, { color: theme.colors.primary.main }]}>Set Default</Text>
                            )}
                        </TouchableOpacity>
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
                {Platform.OS === 'android' && (
                    <TouchableOpacity
                        style={[styles.platformButton, styles.platformButtonDark]}
                        onPress={handleAddGooglePay}
                        disabled={platformPayLoading}
                    >
                        {platformPayLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Icon name="google" size={20} color="#fff" style={styles.platformIcon} />
                                <Text style={styles.platformText}>Add Google Pay</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
                {Platform.OS === 'ios' && (
                    <TouchableOpacity
                        style={[styles.platformButton, styles.platformButtonDark]}
                        onPress={handleAddApplePay}
                        disabled={platformPayLoading}
                    >
                        {platformPayLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Icon name="apple" size={20} color="#fff" style={styles.platformIcon} />
                                <Text style={styles.platformText}>Add Apple Pay</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
                <Button title="Add Card" onPress={handleAddMethod} />
                <Button title="Process Payment" onPress={() => navigation.navigate('PaymentCheckout' as never)} />
                <Button title="Transaction History" onPress={() => navigation.navigate('PaymentHistory' as never)} />
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
    setDefaultBtn: {
        marginRight: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    setDefaultText: {
        fontSize: 12,
        fontWeight: '600',
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
    googlePayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 12,
    },
    platformButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 12,
    },
    platformButtonDark: {
        backgroundColor: '#000',
    },
    platformIcon: {
        marginRight: 8,
    },
    platformText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
