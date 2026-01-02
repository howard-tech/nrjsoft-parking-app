import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useActiveSession, useWallet, useSessionTimer } from '@hooks';
import { SessionTimer } from './components/SessionTimer';
import { WalletProjectionBar } from './components/WalletProjectionBar';
import { Button } from '@components/common/Button';
import { sessionService } from '@services/session/sessionService';
import { paymentService } from '@services/payment/paymentService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '@utils/formatters';
import { setReceipt } from '@store/slices/sessionSlice';
import { useAppDispatch } from '@store';
import { useEffect } from 'react';

const SUPPORT_PHONE = '+49 800 223 4455';
const LOW_BALANCE_THRESHOLD = 1;

export const ActiveSessionScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { session, isLoading, end } = useActiveSession();
    const { balance, currency } = useWallet();
    const [currentCost, setCurrentCost] = useState(0);
    const [isEnding, setIsEnding] = useState(false);

    const { formattedTime } = useSessionTimer({
        startTime: session?.startTime ?? new Date().toISOString(),
        onMinuteElapsed: () => {
            if (session) {
                setCurrentCost(sessionService.calculateCurrentCost(session));
            }
        },
    });

    useEffect(() => {
        if (session) {
            setCurrentCost(sessionService.calculateCurrentCost(session));
        }
    }, [session]);

    const status = useMemo(() => {
        if (balance <= 0) {
            return 'critical' as const;
        }
        const remaining = balance - currentCost;
        if (remaining <= 0) {
            return 'critical' as const;
        }
        if (remaining <= LOW_BALANCE_THRESHOLD) {
            return 'warning' as const;
        }
        return 'normal' as const;
    }, [balance, currentCost]);

    const handleTopUp = () => {
        navigation.navigate('WalletTab' as never, { screen: 'TopUp' } as never);
    };

    const handleEndSession = async () => {
        if (!session) { return; }

        Alert.alert(
            'End Session',
            'Are you sure you want to end your parking session? The total cost will be charged to your default payment method.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End & Pay',
                    style: 'destructive',
                    onPress: async () => {
                        setIsEnding(true);
                        try {
                            // 1. End session to get final fee
                            const completedSession = await end();
                            if (!completedSession) {
                                throw new Error('Failed to end session');
                            }

                            const totalFee = completedSession.totalFee ?? currentCost;

                            // 2. Fetch default payment method
                            const methods = await paymentService.getPaymentMethods();
                            const defaultMethod = methods.find((m) => m.isDefault) || methods[0];

                            if (!defaultMethod) {
                                // No payment method found - handle accordingly (maybe show a warning or fallback to wallet)
                                Alert.alert(
                                    'Notice',
                                    'Session ended, but no saved payment method was found. Please pay at the counter or add a card.'
                                );
                                navigation.navigate('HomeTab' as never);
                                return;
                            }

                            // 3. Charge the default method
                            const chargeResult = await paymentService.chargePayment(
                                totalFee,
                                completedSession.currency || currency || 'EUR',
                                defaultMethod.id,
                                `Parking at ${completedSession.garageName || 'NRJSoft Garage'}`
                            );

                            if (chargeResult.success) {
                                // 4. Set receipt and navigate
                                const transaction = chargeResult.transaction;
                                dispatch(
                                    setReceipt({
                                        sessionId: completedSession.id,
                                        finalCost: totalFee,
                                        durationMinutes: completedSession.elapsedMinutes || 0,
                                        receiptUrl: transaction?.receiptUrl || completedSession.receiptUrl,
                                        transactionId: transaction?.id,
                                        paymentMethod: defaultMethod.type === 'card'
                                            ? `${defaultMethod.brand} •••• ${defaultMethod.last4}`
                                            : defaultMethod.type,
                                    })
                                );
                                navigation.navigate('WalletTab' as never, { screen: 'SessionReceipt' } as never);
                            } else {
                                throw new Error(chargeResult.errorMessage || 'Payment failed');
                            }
                        } catch (error: unknown) {
                            const message = error instanceof Error ? error.message : 'There was an issue processing your payment.';
                            console.error('Failed to process final payment', error);
                            Alert.alert('Payment Error', message);
                        } finally {
                            setIsEnding(false);
                        }
                    },
                },
            ]
        );
    };

    const handleCallSupport = () => Linking.openURL(`tel:${SUPPORT_PHONE}`);

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.neutral.background }]}>
                <ActivityIndicator color={theme.colors.primary.main} />
            </View>
        );
    }

    if (!session) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
                <View style={styles.emptyCard}>
                    <Icon name="clock-alert" size={48} color={theme.colors.neutral.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.neutral.textPrimary }]}>
                        No active parking session
                    </Text>
                    <Text style={[styles.emptyText, { color: theme.colors.neutral.textSecondary }]}>
                        Start a session from the Smart Map or scan a garage QR code.
                    </Text>
                    <Button title="Find parking" onPress={() => navigation.navigate('HomeTab' as never)} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.primary.main }]}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerLabel}>Parking in progress</Text>
                    <TouchableOpacity style={styles.supportBadge} onPress={handleCallSupport}>
                        <Icon name="phone" size={16} color={theme.colors.primary.main} />
                        <Text style={styles.supportText}>Support</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.balanceLabel}>Wallet balance</Text>
                <Text style={styles.balanceValue}>
                    {currency} {formatCurrency(balance, currency)}
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.neutral.surface }]}>
                <Text style={[styles.cardLabel, { color: theme.colors.primary.main }]}>ACTIVE SESSION</Text>
                <Text style={[styles.garageName, { color: theme.colors.neutral.textPrimary }]}>
                    {session.zoneName || session.garageName || 'Parking zone'}
                </Text>
                {session.address ? (
                    <Text style={[styles.address, { color: theme.colors.neutral.textSecondary }]}>
                        {session.address}
                    </Text>
                ) : null}

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: theme.colors.neutral.textSecondary }]}>
                        Live timer
                    </Text>
                    <SessionTimer formattedTime={formattedTime} />
                    <Text style={[styles.caption, { color: theme.colors.neutral.textSecondary }]}>
                        Started {new Date(session.startTime).toLocaleTimeString()}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: theme.colors.neutral.textSecondary }]}>
                        Current fee
                    </Text>
                    <Text style={[styles.fee, { color: theme.colors.neutral.textPrimary }]}>
                        {currency} {formatCurrency(currentCost, currency)}
                    </Text>
                    <Text style={[styles.caption, { color: theme.colors.neutral.textSecondary }]}>
                        Updates every minute
                    </Text>
                </View>

                <WalletProjectionBar
                    currentCost={currentCost}
                    balance={balance}
                    status={status}
                    currency={currency}
                />

                <Button
                    title="Top up now"
                    variant={status === 'normal' ? 'secondary' : 'primary'}
                    onPress={handleTopUp}
                    style={styles.topUpButton}
                />

                <Button
                    title="End Session"
                    variant="primary"
                    onPress={handleEndSession}
                    loading={isEnding}
                    style={styles.endSessionButton}
                />
            </View>
        </View>
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
    header: {
        paddingTop: 56,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLabel: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    supportBadge: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },
    supportText: {
        color: '#1E3A5F',
        fontWeight: '700',
    },
    balanceLabel: {
        marginTop: 16,
        color: '#E3ECF9',
        fontSize: 12,
        letterSpacing: 1,
    },
    balanceValue: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: '800',
        marginTop: 4,
    },
    card: {
        marginHorizontal: 20,
        marginTop: -20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    garageName: {
        fontSize: 22,
        fontWeight: '800',
    },
    address: {
        fontSize: 14,
        marginTop: 2,
        marginBottom: 12,
    },
    section: {
        marginTop: 16,
        alignItems: 'center',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
    },
    caption: {
        fontSize: 12,
        marginTop: 4,
    },
    fee: {
        fontSize: 32,
        fontWeight: '800',
    },
    topUpButton: {
        marginTop: 16,
    },
    endSessionButton: {
        marginTop: 12,
    },
    emptyCard: {
        margin: 20,
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
