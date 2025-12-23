# TASK-029: Subscriptions & Packages Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-029 |
| **Module** | Payment |
| **Priority** | Medium |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-021 |
| **Status** | 🔴 Not Started |

## Description

Implement the subscriptions tab for managing parking passes and packages with recurring billing.

## Context from Technical Proposal (Page 12)

- Weekly fleet pass: EUR 19/week
- Monthly commuter pass: EUR 65/month
- Benefits: Unlimited in-zone exits, auto-fiscal receipts, priority support

## Acceptance Criteria

- [ ] Available subscriptions list
- [ ] Subscription details view
- [ ] Purchase subscription flow
- [ ] Active subscription indicator
- [ ] Cancel subscription option
- [ ] Renewal information

## Technical Implementation

### Subscriptions Tab

```typescript
// src/screens/payment/tabs/SubscriptionsTab.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { useSubscriptions } from '@hooks/useSubscriptions';
import { SubscriptionCard } from '../components/SubscriptionCard';

export const SubscriptionsTab: React.FC = () => {
  const theme = useTheme();
  const { subscriptions, activeSubscription, isLoading } = useSubscriptions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.neutral.textSecondary }]}>
          SUBSCRIPTIONS
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.neutral.textSecondary }]}>
          Predictable billing for heavy parkers.
        </Text>
      </View>

      {activeSubscription && (
        <View style={[styles.activeBadge, { backgroundColor: theme.colors.success.light }]}>
          <Text style={[styles.activeText, { color: theme.colors.success.main }]}>
            ACTIVE
          </Text>
        </View>
      )}

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            isActive={activeSubscription?.id === item.id}
            onPress={() => handleSubscriptionPress(item)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};
```

### Subscription Card

```typescript
// src/screens/payment/components/SubscriptionCard.tsx
export const SubscriptionCard: React.FC<Props> = ({ subscription, isActive, onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isActive && { borderColor: theme.colors.primary.main },
      ]}
      onPress={onPress}
    >
      <Text style={styles.name}>{subscription.name}</Text>
      <Text style={styles.price}>
        EUR {subscription.price} per {subscription.period}
      </Text>
      <Text style={styles.description}>{subscription.description}</Text>
      
      <View style={styles.benefits}>
        {subscription.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <CheckIcon color={theme.colors.success.main} size={16} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {isActive ? (
        <View style={styles.activeIndicator}>
          <Text style={styles.activeLabel}>Subscription active</Text>
          <Text style={styles.renewalInfo}>
            Renews automatically; cancel anytime from billing.
          </Text>
        </View>
      ) : (
        <Button title="Subscribe" onPress={onPress} />
      )}
    </TouchableOpacity>
  );
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/payment/tabs/SubscriptionsTab.tsx` | Subscriptions list |
| `src/screens/payment/components/SubscriptionCard.tsx` | Plan card |
| `src/screens/payment/SubscriptionDetailScreen.tsx` | Plan details |
| `src/hooks/useSubscriptions.ts` | Subscriptions hook |

## Testing Checklist

- [ ] Plans display correctly
- [ ] Active subscription highlighted
- [ ] Purchase flow works
- [ ] Cancel subscription works
- [ ] Renewal info accurate

## Related Tasks

- **Previous**: [TASK-021](task-021.md)
- **Next**: [TASK-030](task-030.md)
