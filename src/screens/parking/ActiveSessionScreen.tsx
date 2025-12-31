import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useActiveSession, useWallet } from '@hooks';
import { SessionTimer } from './components/SessionTimer';
import { WalletProjectionBar } from './components/WalletProjectionBar';
import { Button } from '@components/common/Button';
import { sessionService } from '@services/session/sessionService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '@utils/formatters';

const SUPPORT_PHONE = '+49 800 223 4455';
const LOW_BALANCE_THRESHOLD = 1;

export const ActiveSessionScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { session, isLoading } = useActiveSession();
    const { balance, currency } = useWallet();

    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [currentCost, setCurrentCost] = useState(0);

    useEffect(() => {
        if (!session) {
            return;
        }
        const start = new Date(session.startTime).getTime();
        const tick = () => {
            const now = Date.now();
            setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
            setCurrentCost(sessionService.calculateCurrentCost(session));
        };
        tick();
        const interval = setInterval(tick, 1000 * 60); // update cost per minute
        const secondInterval = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);

        return () => {
            clearInterval(interval);
            clearInterval(secondInterval);
        };
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
                    <SessionTimer seconds={elapsedSeconds} />
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
