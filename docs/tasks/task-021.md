# TASK-021: Payment Methods Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-021 |
| **Module** | Payment |
| **Priority** | Critical |
| **Estimated Effort** | 10 hours |
| **Dependencies** | TASK-020 |
| **Status** | 🔴 Not Started |

## Description

Implement the Payment Methods screen that allows users to manage their payment options including saved cards, NRJ Wallet, Apple Pay, and Google Pay. Users can set default payment methods and configure auto-payment settings.

## Context from Technical Proposal (Pages 11-13)

### Key Features:
1. **Wallet Balance & Top-Up**: Display balance with quick top-up options (€10, €20, €50, custom)
2. **Auto-Reload**: Optional automatic top-up when balance falls below threshold
3. **Payment Method Selection**: Choose and set default payment method
4. **Manual vs Auto Payment**: Auto-deduct available only with wallet as primary
5. **Secure Card Vaulting**: Cards securely stored via payment provider
6. **Subscription Management**: Optional parking passes (weekly/monthly)

### UI Elements from Mockup:
- Two tabs: "PAYMENT SETTINGS" | "SUBSCRIPTIONS"
- Balance card: "EUR 12.50" with top-up presets
- "Auto-reload wallet when balance drops below EUR 2" toggle
- Payment methods list with radio selection
- Method management modal (Set default, Update, Remove)
- Add new payment method button
- "Enable Auto Payment (Wallet only)" toggle
- Subscription plans with pricing

## Acceptance Criteria

- [ ] Wallet balance displayed with top-up buttons
- [ ] Auto-reload toggle functional
- [ ] List of saved payment methods
- [ ] Set default payment method
- [ ] Add new card via secure flow
- [ ] Apple Pay / Google Pay options shown
- [ ] Auto-payment toggle (wallet only)
- [ ] Subscription tab with plans
- [ ] Active subscription indication
- [ ] Error handling for all operations

## Technical Implementation

### 1. Payment Screen

```typescript
// src/screens/payment/PaymentScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { TabSelector } from '@components/common/TabSelector';
import { PaymentSettingsTab } from './tabs/PaymentSettingsTab';
import { SubscriptionsTab } from './tabs/SubscriptionsTab';

type TabType = 'settings' | 'subscriptions';

export const PaymentScreen: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('settings');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
      <TabSelector
        tabs={[
          { key: 'settings', label: 'PAYMENT SETTINGS' },
          { key: 'subscriptions', label: 'SUBSCRIPTIONS' },
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />
      
      {activeTab === 'settings' ? (
        <PaymentSettingsTab />
      ) : (
        <SubscriptionsTab />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### 2. Payment Settings Tab

```typescript
// src/screens/payment/tabs/PaymentSettingsTab.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useWallet } from '@hooks/useWallet';
import { usePaymentMethods } from '@hooks/usePaymentMethods';
import { formatCurrency } from '@utils/formatters';

// Components
import { WalletCard } from '../components/WalletCard';
import { PaymentMethodList } from '../components/PaymentMethodList';
import { PaymentMethodModal } from '../components/PaymentMethodModal';
import { Button } from '@components/common/Button';

export const PaymentSettingsTab: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  
  const { balance, autoReload, updateAutoReload } = useWallet();
  const { 
    methods, 
    defaultMethodId, 
    setDefaultMethod, 
    removeMethod,
    autoPaymentEnabled,
    setAutoPayment,
  } = usePaymentMethods();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const handleMethodPress = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setModalVisible(true);
  };
  
  const handleSetDefault = async () => {
    if (selectedMethod) {
      await setDefaultMethod(selectedMethod.id);
      setModalVisible(false);
    }
  };
  
  const handleRemove = async () => {
    if (selectedMethod) {
      await removeMethod(selectedMethod.id);
      setModalVisible(false);
    }
  };
  
  const handleAddMethod = () => {
    navigation.navigate('AddPaymentMethod');
  };
  
  const handleAutoPaymentToggle = (enabled: boolean) => {
    // Auto-payment only works with wallet
    if (enabled && defaultMethodId !== 'wallet') {
      Alert.alert(
        'Wallet Required',
        'Switch to NRJ Wallet to enable auto payment.',
        [{ text: 'OK' }]
      );
      return;
    }
    setAutoPayment(enabled);
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Wallet Balance Card */}
      <WalletCard
        balance={balance}
        onTopUp={(amount) => navigation.navigate('TopUp', { amount })}
      />
      
      {/* Auto-Reload Toggle */}
      <View style={[styles.settingRow, { backgroundColor: theme.colors.neutral.surface }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: theme.colors.neutral.textPrimary }]}>
            Auto-reload wallet
          </Text>
          <Text style={[styles.settingDesc, { color: theme.colors.neutral.textSecondary }]}>
            When balance drops below EUR 2
          </Text>
        </View>
        <Switch
          value={autoReload.enabled}
          onValueChange={(enabled) => updateAutoReload({ enabled })}
          trackColor={{ 
            false: theme.colors.neutral.border, 
            true: theme.colors.primary.light 
          }}
          thumbColor={autoReload.enabled ? theme.colors.primary.main : '#FFFFFF'}
        />
      </View>
      
      {/* Payment Methods Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: theme.colors.neutral.textSecondary }]}>
          PAYMENT SETTINGS
        </Text>
        <Text style={[styles.sectionDesc, { color: theme.colors.neutral.textSecondary }]}>
          Choose Wallet, Card, Apple Pay, or Google Pay.
        </Text>
      </View>
      
      {/* Manual Label */}
      <Text style={[styles.methodsLabel, { color: theme.colors.neutral.textSecondary }]}>
        MANUAL
      </Text>
      
      {/* Payment Methods List */}
      <PaymentMethodList
        methods={methods}
        defaultMethodId={defaultMethodId}
        onMethodPress={handleMethodPress}
      />
      
      {/* Add Payment Method */}
      <TouchableOpacity 
        style={[styles.addButton, { borderColor: theme.colors.neutral.border }]}
        onPress={handleAddMethod}
      >
        <PlusIcon color={theme.colors.primary.main} />
        <Text style={[styles.addButtonText, { color: theme.colors.primary.main }]}>
          Add new payment method
        </Text>
      </TouchableOpacity>
      
      {/* Auto Payment Toggle */}
      <View style={[styles.settingRow, { backgroundColor: theme.colors.neutral.surface }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: theme.colors.neutral.textPrimary }]}>
            Enable Auto Payment (Wallet only)
          </Text>
          <Text style={[styles.settingDesc, { color: theme.colors.neutral.textSecondary }]}>
            Auto-deduct on exit whenever wallet is primary.
          </Text>
          {defaultMethodId !== 'wallet' && (
            <Text style={[styles.settingNote, { color: theme.colors.warning.main }]}>
              Switch to NRJ Wallet to enable auto payment.
            </Text>
          )}
        </View>
        <Switch
          value={autoPaymentEnabled}
          onValueChange={handleAutoPaymentToggle}
          disabled={defaultMethodId !== 'wallet'}
          trackColor={{ 
            false: theme.colors.neutral.border, 
            true: theme.colors.primary.light 
          }}
          thumbColor={autoPaymentEnabled ? theme.colors.primary.main : '#FFFFFF'}
        />
      </View>
      
      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={modalVisible}
        method={selectedMethod}
        isDefault={selectedMethod?.id === defaultMethodId}
        onClose={() => setModalVisible(false)}
        onSetDefault={handleSetDefault}
        onUpdate={() => {
          setModalVisible(false);
          navigation.navigate('AddPaymentMethod', { methodId: selectedMethod?.id });
        }}
        onRemove={handleRemove}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
  },
  settingNote: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
  },
  methodsLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
```

### 3. Payment Method List Item

```typescript
// src/screens/payment/components/PaymentMethodItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { PaymentMethod } from '@types';

interface PaymentMethodItemProps {
  method: PaymentMethod;
  isDefault: boolean;
  onPress: () => void;
}

export const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({
  method,
  isDefault,
  onPress,
}) => {
  const theme = useTheme();
  
  const getIcon = () => {
    switch (method.type) {
      case 'card':
        return <CardIcon brand={method.brand} />;
      case 'wallet':
        return <WalletIcon color={theme.colors.primary.main} />;
      case 'apple_pay':
        return <ApplePayIcon />;
      case 'google_pay':
        return <GooglePayIcon />;
      default:
        return null;
    }
  };
  
  const getLabel = () => {
    switch (method.type) {
      case 'card':
        return `${method.brand} •••• ${method.last4}`;
      case 'wallet':
        return 'NRJ Wallet';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return method.type;
    }
  };
  
  const getSubtitle = () => {
    if (isDefault) return 'Default';
    if (method.type === 'wallet') return 'Use prepaid balance';
    if (method.type === 'apple_pay') return 'Face ID / Touch ID';
    if (method.type === 'google_pay') return 'Android tap to pay';
    return 'Tap to set default';
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.neutral.surface,
          borderColor: isDefault ? theme.colors.primary.main : theme.colors.neutral.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.info}>
        <Text style={[styles.label, { color: theme.colors.neutral.textPrimary }]}>
          {getLabel()}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.neutral.textSecondary }]}>
          {getSubtitle()}
        </Text>
      </View>
      <View style={[
        styles.radio,
        { borderColor: isDefault ? theme.colors.primary.main : theme.colors.neutral.border },
      ]}>
        {isDefault && (
          <View style={[styles.radioInner, { backgroundColor: theme.colors.primary.main }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/payment/PaymentScreen.tsx` | Main payment screen |
| `src/screens/payment/tabs/PaymentSettingsTab.tsx` | Settings tab |
| `src/screens/payment/tabs/SubscriptionsTab.tsx` | Subscriptions tab |
| `src/screens/payment/components/WalletCard.tsx` | Wallet balance display |
| `src/screens/payment/components/PaymentMethodList.tsx` | Method list |
| `src/screens/payment/components/PaymentMethodItem.tsx` | Method item |
| `src/screens/payment/components/PaymentMethodModal.tsx` | Method actions |
| `src/hooks/usePaymentMethods.ts` | Payment methods hook |

## Testing Checklist

- [ ] Wallet balance displays correctly
- [ ] Top-up presets work
- [ ] Auto-reload toggle functional
- [ ] Payment methods list renders
- [ ] Default method indicated
- [ ] Method selection modal opens
- [ ] Set default method works
- [ ] Add new method navigates correctly
- [ ] Auto-payment toggle respects wallet requirement
- [ ] Subscriptions tab renders

## Related Tasks

- **Previous**: [TASK-020](task-020.md) - Payment Service
- **Next**: [TASK-022](task-022.md) - Card Payment Integration
- **Used by**: TASK-024, TASK-027
