import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@theme';
import { subscriptionService, SubscriptionPlan, UserSubscription } from '@services/payment/subscriptionService';
import { paymentService } from '@services/payment/paymentService';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '@components/common/ToastProvider';

export const SubscriptionsScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { showToast } = useToast();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [active, setActive] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activePlan = useMemo(
        () => plans.find((plan) => plan.id === active?.planId),
        [active?.planId, plans]
    );

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [plansData, activeData] = await Promise.all([
                subscriptionService.getPlans(),
                subscriptionService.getActiveSubscription(),
            ]);
            setPlans(plansData);
            setActive(activeData);
        } catch (err) {
            console.warn('Failed to load subscriptions', err);
            setError('Unable to load subscriptions. Pull to retry.');
            showToast('Unable to load subscriptions.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadData();
    }, []);

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        setProcessing(true);
        try {
            const methods = await paymentService.getPaymentMethods();
            const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
            if (!defaultMethod) {
                Alert.alert('Add payment method', 'Please add a payment method to subscribe.', [
                    {
                        text: 'Go to methods',
                        onPress: () => navigation.navigate('PaymentMethods' as never),
                    },
                    { text: 'Cancel', style: 'cancel' },
                ]);
                return;
            }
            const subscription = await subscriptionService.subscribe(plan.id, defaultMethod.id);
            setActive(subscription);
            Alert.alert('Subscribed', `You are now on the ${plan.name} plan.`);
        } catch (err) {
            console.warn('Failed to subscribe', err);
            Alert.alert('Error', 'Could not subscribe. Please try again.');
            showToast('Could not subscribe.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!active) return;
        Alert.alert('Cancel Subscription', 'You will keep access until the period ends.', [
            { text: 'Keep', style: 'cancel' },
            {
                text: 'Cancel',
                style: 'destructive',
                onPress: async () => {
                    setProcessing(true);
                    try {
                        const updated = await subscriptionService.cancel(active.id);
                        setActive(updated ?? null);
                    } catch (err) {
                        console.warn('Failed to cancel subscription', err);
                        Alert.alert('Error', 'Unable to cancel subscription.');
                        showToast('Unable to cancel subscription.', 'error');
                    } finally {
                        setProcessing(false);
                    }
                },
            },
        ]);
    };

    const handleToggleAutoRenew = async (value: boolean) => {
        if (!active) return;
        setProcessing(true);
        try {
            const updated = await subscriptionService.toggleAutoRenew(active.id, value);
            setActive(updated ?? active);
        } catch (err) {
            console.warn('Failed to update auto-renew', err);
            Alert.alert('Error', 'Unable to update auto-renew.');
            showToast('Unable to update auto-renew.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.neutral.background }]}>
                <ActivityIndicator color={theme.colors.primary.main} />
                <Text style={[styles.subtle, { color: theme.colors.neutral.textSecondary }]}>Loading plans…</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>Subscriptions</Text>
                <Text style={[styles.subtitle, { color: theme.colors.neutral.textSecondary }]}>
                    Predictable billing for frequent parkers.
                </Text>
                {error ? (
                    <Text style={[styles.errorText, { color: theme.colors.error.main }]}>{error}</Text>
                ) : null}
            </View>

            {active && activePlan ? (
                <View style={[styles.card, { backgroundColor: theme.colors.neutral.surface, borderColor: theme.colors.neutral.border }]}>
                    <View style={styles.row}>
                        <Text style={[styles.cardTitle, { color: theme.colors.primary.main }]}>Active Plan</Text>
                        <Text style={[styles.badge, { color: theme.colors.success.main }]}>Active</Text>
                    </View>
                    <Text style={[styles.planName, { color: theme.colors.neutral.textPrimary }]}>{activePlan.name}</Text>
                    <Text style={[styles.subtle, { color: theme.colors.neutral.textSecondary }]}>
                        Renews on {new Date(active.endDate).toLocaleDateString()}
                    </Text>
                    <View style={styles.row}>
                        <Text style={[styles.subtle, { color: theme.colors.neutral.textSecondary }]}>Auto-renew</Text>
                        <Switch
                            value={active.autoRenew}
                            onValueChange={handleToggleAutoRenew}
                            trackColor={{ true: theme.colors.primary.light, false: theme.colors.neutral.border }}
                            thumbColor={active.autoRenew ? theme.colors.primary.main : theme.colors.neutral.surface}
                            accessibilityLabel="Toggle auto-renew"
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: theme.colors.error.main }]}
                        onPress={handleCancel}
                        disabled={processing}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel subscription"
                    >
                        <Text style={[styles.secondaryText, { color: theme.colors.error.main }]}>Cancel Subscription</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>Available Plans</Text>
            </View>

            {plans.map((plan) => {
                const isActivePlan = active?.planId === plan.id && active?.status === 'active';
                return (
                    <View
                        key={plan.id}
                        style={[
                            styles.card,
                            { backgroundColor: theme.colors.neutral.surface, borderColor: theme.colors.neutral.border },
                        ]}
                    >
                        <View style={styles.row}>
                            <Text style={[styles.planName, { color: theme.colors.neutral.textPrimary }]}>{plan.name}</Text>
                            {plan.isPopular ? (
                                <Text style={[styles.badge, { color: theme.colors.primary.main }]}>Popular</Text>
                            ) : null}
                        </View>
                        <Text style={[styles.subtle, { color: theme.colors.neutral.textSecondary }]}>{plan.description}</Text>
                        <Text style={[styles.price, { color: theme.colors.neutral.textPrimary }]}>
                            {plan.currency} {plan.price} / {plan.interval}
                        </Text>
                        <View style={styles.benefits}>
                            {plan.benefits.map((benefit) => (
                                <Text key={benefit} style={[styles.benefitItem, { color: theme.colors.neutral.textSecondary }]}>
                                    • {benefit}
                                </Text>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                { backgroundColor: theme.colors.primary.main },
                                isActivePlan && { opacity: 0.5 },
                            ]}
                            onPress={() => handleSubscribe(plan)}
                            disabled={processing || isActivePlan}
                            accessibilityRole="button"
                            accessibilityLabel={`Subscribe to ${plan.name}`}
                        >
                            <Text style={styles.primaryText}>{isActivePlan ? 'Current Plan' : 'Subscribe'}</Text>
                        </TouchableOpacity>
                    </View>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 24 },
    header: { padding: 20 },
    title: { fontSize: 24, fontWeight: '800' },
    subtitle: { marginTop: 6, fontSize: 14 },
    errorText: { marginTop: 8, fontSize: 12, fontWeight: '600' },
    sectionHeader: { paddingHorizontal: 20, paddingBottom: 8 },
    sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    card: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    planName: { fontSize: 16, fontWeight: '700', marginTop: 6 },
    badge: { fontSize: 12, fontWeight: '700' },
    price: { fontSize: 16, fontWeight: '700', marginTop: 8 },
    benefits: { marginTop: 8, gap: 4 },
    benefitItem: { fontSize: 12 },
    primaryButton: {
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    secondaryButton: {
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    secondaryText: { fontSize: 13, fontWeight: '700' },
    subtle: { fontSize: 12, marginTop: 4 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default SubscriptionsScreen;
