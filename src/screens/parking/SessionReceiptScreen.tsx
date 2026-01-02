import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking, Share } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { useTheme } from '@theme';
import { formatDuration, formatCurrency } from '@utils/formatters';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '@components/common/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentModal'> & {
    route: {
        params: {
            sessionId: string;
            finalCost: number;
            durationMinutes: number;
            receiptUrl?: string;
            transactionId?: string;
            paymentMethod?: string;
            zoneName?: string;
            address?: string;
            currency?: string;
        };
    };
};

export const SessionReceiptScreen: React.FC<Props> = ({ route, navigation }) => {
    const {
        sessionId,
        finalCost,
        durationMinutes,
        receiptUrl,
        transactionId,
        paymentMethod,
        zoneName,
        address,
        currency = 'EUR',
    } = route.params;
    const theme = useTheme();

    const handleDownload = () => {
        if (receiptUrl) {
            Linking.openURL(receiptUrl);
        }
    };

    const handleShare = () => {
        if (receiptUrl) {
            Share.share({ message: `Parking receipt: ${receiptUrl}` });
        }
    };

    const durationLabel = useMemo(() => formatDuration(durationMinutes * 60), [durationMinutes]);

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <View style={[styles.card, { backgroundColor: theme.colors.neutral.surface }]}>
                <View style={styles.iconContainer}>
                    <Icon name="check-circle" size={64} color={theme.colors.success.main} />
                    <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>Parking Complete</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.neutral.textSecondary }]}>
                        Session ID: {sessionId}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>Location</Text>
                    <Text style={[styles.value, { color: theme.colors.neutral.textPrimary }]}>
                        {zoneName || address || 'Parking location'}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>Duration</Text>
                    <Text style={[styles.value, { color: theme.colors.neutral.textPrimary }]}>{durationLabel}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>Total</Text>
                    <Text style={[styles.total, { color: theme.colors.neutral.textPrimary }]}>
                        {currency} {formatCurrency(finalCost, currency)}
                    </Text>
                </View>

                {transactionId ? (
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>Transaction ID</Text>
                        <Text style={[styles.value, { color: theme.colors.neutral.textPrimary }]}>{transactionId}</Text>
                    </View>
                ) : null}

                {paymentMethod ? (
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>Payment Method</Text>
                        <Text style={[styles.value, { color: theme.colors.neutral.textPrimary }]}>{paymentMethod}</Text>
                    </View>
                ) : null}

                <View style={styles.actions}>
                    <Button title="Done" onPress={() => navigation.goBack()} />
                    {receiptUrl ? (
                        <>
                            <TouchableOpacity style={styles.textButton} onPress={handleDownload}>
                                <Text style={[styles.textButtonLabel, { color: theme.colors.primary.main }]}>
                                    Download receipt
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.textButton} onPress={handleShare}>
                                <Text style={[styles.textButtonLabel, { color: theme.colors.primary.main }]}>
                                    Share receipt
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 8,
    },
    subtitle: {
        marginTop: 4,
        fontSize: 12,
    },
    row: {
        marginTop: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    value: {
        marginTop: 4,
        fontSize: 15,
        fontWeight: '600',
    },
    total: {
        marginTop: 4,
        fontSize: 24,
        fontWeight: '800',
    },
    actions: {
        marginTop: 24,
        gap: 12,
    },
    textButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    textButtonLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
});
