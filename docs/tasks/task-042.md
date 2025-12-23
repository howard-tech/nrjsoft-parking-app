# TASK-042: Subscriptions & Packages Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-042 |
| **Module** | Payment |
| **Priority** | Medium |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-021 |
| **Status** | 🔴 Not Started |

## Description

Implement subscription and parking package management for frequent parkers and fleet users.

## Context from Technical Proposal (Page 3, 12-13)

- Support optional subscription or package plans
- Special pricing or entitlements for eligible users
- Weekly fleet pass, monthly commuter pass
- Auto-renewal and cancel functionality

## Acceptance Criteria

- [ ] Subscriptions tab in Payment screen
- [ ] Available plans list with pricing
- [ ] Active subscription indicator
- [ ] Purchase subscription flow
- [ ] Cancel subscription flow
- [ ] Benefits display per plan
- [ ] Auto-renewal information

## Technical Implementation

### Subscription Service

```typescript
// src/services/subscription/subscriptionService.ts
import { apiClient } from '@services/api/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'week' | 'month' | 'year';
  benefits: string[];
  vehicleLimit: number;
  isPopular?: boolean;
}

export interface UserSubscription {
  id: string;
  planId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  nextBillingDate?: string;
}

export const subscriptionService = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get('/subscriptions/plans');
    return response.data.data;
  },

  getActiveSubscription: async (): Promise<UserSubscription | null> => {
    const response = await apiClient.get('/subscriptions/active');
    return response.data.data;
  },

  subscribe: async (planId: string, paymentMethodId: string): Promise<UserSubscription> => {
    const response = await apiClient.post('/subscriptions', {
      planId,
      paymentMethodId,
    });
    return response.data.data;
  },

  cancel: async (subscriptionId: string): Promise<void> => {
    await apiClient.post(`/subscriptions/${subscriptionId}/cancel`);
  },

  toggleAutoRenew: async (subscriptionId: string, autoRenew: boolean): Promise<void> => {
    await apiClient.patch(`/subscriptions/${subscriptionId}`, { autoRenew });
  },
};
```

### Subscriptions Screen

```typescript
// src/screens/payment/SubscriptionsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@theme';
import { subscriptionService, SubscriptionPlan, UserSubscription } from '@services/subscription';
import { SubscriptionCard } from '@components/payment/SubscriptionCard';
import { ActiveSubscriptionCard } from '@components/payment/ActiveSubscriptionCard';
import { LoadingSpinner } from '@components/common';

export const SubscriptionsScreen: React.FC = () => {
  const theme = useTheme();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, activeData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getActiveSubscription(),
      ]);
      setPlans(plansData);
      setActiveSubscription(activeData);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    // Navigate to payment selection
    navigation.navigate('SubscriptionCheckout', { plan });
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure? You will lose access at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            if (activeSubscription) {
              await subscriptionService.cancel(activeSubscription.id);
              loadData();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>
        Subscriptions
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.neutral.textSecondary }]}>
        Predictable billing for heavy parkers.
      </Text>

      {activeSubscription && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary.main }]}>
            ACTIVE
          </Text>
          <ActiveSubscriptionCard
            subscription={activeSubscription}
            onCancel={handleCancel}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>
          AVAILABLE PLANS
        </Text>
        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            isActive={activeSubscription?.planId === plan.id}
            onSubscribe={() => handleSubscribe(plan)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
});
```

### Subscription Card Component

```typescript
// src/components/payment/SubscriptionCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme';
import { SubscriptionPlan } from '@services/subscription';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isActive: boolean;
  onSubscribe: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  isActive,
  onSubscribe,
}) => {
  const theme = useTheme();

  const intervalLabel = {
    week: 'per week',
    month: 'per month',
    year: 'per year',
  };

  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: theme.colors.neutral.surface,
        borderColor: isActive ? theme.colors.primary.main : theme.colors.neutral.border,
        borderWidth: isActive ? 2 : 1,
      }
    ]}>
      {plan.isPopular && (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary.main }]}>
          <Text style={styles.badgeText}>POPULAR</Text>
        </View>
      )}

      <Text style={[styles.name, { color: theme.colors.neutral.textPrimary }]}>
        {plan.name}
      </Text>

      <View style={styles.priceRow}>
        <Text style={[styles.currency, { color: theme.colors.primary.main }]}>EUR</Text>
        <Text style={[styles.price, { color: theme.colors.primary.main }]}>
          {plan.price}
        </Text>
        <Text style={[styles.interval, { color: theme.colors.neutral.textSecondary }]}>
          {intervalLabel[plan.interval]}
        </Text>
      </View>

      <Text style={[styles.description, { color: theme.colors.neutral.textSecondary }]}>
        {plan.description}
      </Text>

      <View style={styles.benefits}>
        {plan.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <Icon name="check-circle" size={16} color={theme.colors.success.main} />
            <Text style={[styles.benefitText, { color: theme.colors.neutral.textPrimary }]}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>

      {isActive ? (
        <View style={[styles.activeButton, { backgroundColor: theme.colors.success.light }]}>
          <Text style={[styles.activeButtonText, { color: theme.colors.success.main }]}>
            Subscription active
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: theme.colors.primary.main }]}
          onPress={onSubscribe}
        >
          <Text style={styles.subscribeButtonText}>Subscribe</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.renewInfo, { color: theme.colors.neutral.textSecondary }]}>
        Renews automatically; cancel anytime from billing.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currency: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
  },
  interval: {
    fontSize: 14,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  benefits: {
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
  },
  subscribeButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activeButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  renewInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
```

## Sample Subscription Plans

```json
[
  {
    "id": "weekly-fleet",
    "name": "Weekly fleet pass",
    "description": "Unlimited in-zone exits for light usage fleets.",
    "price": 19,
    "currency": "EUR",
    "interval": "week",
    "vehicleLimit": 2,
    "benefits": [
      "Covers 2 vehicles",
      "Auto-fiscal receipts",
      "Priority support"
    ],
    "isPopular": true
  },
  {
    "id": "monthly-commuter",
    "name": "Monthly commuter pass",
    "description": "Best value for daily parkers.",
    "price": 65,
    "currency": "EUR",
    "interval": "month",
    "vehicleLimit": 1,
    "benefits": [
      "Unlimited parking",
      "All NRJ zones",
      "No overstay fees"
    ]
  }
]
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/subscription/subscriptionService.ts` | API service |
| `src/screens/payment/SubscriptionsScreen.tsx` | Main screen |
| `src/components/payment/SubscriptionCard.tsx` | Plan card |
| `src/components/payment/ActiveSubscriptionCard.tsx` | Active plan |

## Testing Checklist

- [ ] Plans load correctly
- [ ] Active subscription displays
- [ ] Subscribe flow works
- [ ] Cancel flow works with confirmation
- [ ] Benefits display correctly

## Related Tasks

- **Previous**: [TASK-021](task-021.md)
- **Next**: [TASK-043](task-043.md)
