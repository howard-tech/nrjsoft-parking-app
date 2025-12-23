# TASK-025: Wallet Top-Up Flow

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-025 |
| **Module** | Wallet |
| **Priority** | High |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-020, TASK-021 |
| **Status** | 🔴 Not Started |

## Description

Implement the wallet top-up flow with preset amounts, custom amount input, and payment processing for adding funds to the NRJ Wallet.

## Context from Technical Proposal (Page 11)

- Wallet balance display with quick top-up options
- Preset amounts: €10, €20, €50, custom
- Auto-reload when balance drops below threshold

## Acceptance Criteria

- [ ] Current balance display
- [ ] Preset top-up amounts
- [ ] Custom amount input
- [ ] Payment method selection
- [ ] Top-up processing
- [ ] Auto-reload configuration
- [ ] Transaction confirmation

## Technical Implementation

### Top-Up Screen

```typescript
// src/screens/wallet/TopUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { useWallet } from '@hooks/useWallet';
import { walletService } from '@services/api/walletService';

const PRESET_AMOUNTS = [10, 20, 50];

export const TopUpScreen: React.FC = () => {
  const theme = useTheme();
  const { balance } = useWallet();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePresetSelect = (preset: number) => {
    setAmount(preset);
    setCustomAmount('');
  };

  const handleCustomChange = (text: string) => {
    setCustomAmount(text);
    const num = parseFloat(text);
    setAmount(isNaN(num) ? null : num);
  };

  const handleTopUp = async () => {
    if (!amount) return;
    
    setIsLoading(true);
    try {
      const intent = await walletService.createTopUpIntent(amount);
      // Navigate to payment confirmation
      navigation.navigate('PaymentConfirm', { intent });
    } catch (error) {
      Alert.alert('Error', 'Failed to create top-up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Current Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>BALANCE</Text>
        <Text style={styles.balanceAmount}>EUR {balance.toFixed(2)}</Text>
      </View>

      {/* Preset Amounts */}
      <View style={styles.presets}>
        {PRESET_AMOUNTS.map((preset) => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.presetButton,
              amount === preset && styles.presetSelected,
            ]}
            onPress={() => handlePresetSelect(preset)}
          >
            <Text style={styles.presetText}>+EUR {preset}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Amount */}
      <TextInput
        style={styles.customInput}
        placeholder="Custom amount"
        keyboardType="numeric"
        value={customAmount}
        onChangeText={handleCustomChange}
      />

      {/* Top Up Button */}
      <Button
        title={`Top up EUR ${amount || 0}`}
        onPress={handleTopUp}
        disabled={!amount || isLoading}
        loading={isLoading}
      />
    </View>
  );
};
```

### Auto-Reload Settings

```typescript
// src/screens/wallet/AutoReloadSettings.tsx
export const AutoReloadSettings: React.FC = () => {
  const { autoReload, updateAutoReload } = useWallet();

  return (
    <View>
      <Switch
        value={autoReload.enabled}
        onValueChange={(enabled) => updateAutoReload({ enabled })}
      />
      <Text>Auto-reload when balance drops below</Text>
      <Picker
        selectedValue={autoReload.threshold}
        onValueChange={(threshold) => updateAutoReload({ threshold })}
      >
        <Picker.Item label="EUR 2" value={2} />
        <Picker.Item label="EUR 5" value={5} />
        <Picker.Item label="EUR 10" value={10} />
      </Picker>
      <Picker
        selectedValue={autoReload.amount}
        onValueChange={(amount) => updateAutoReload({ amount })}
      >
        <Picker.Item label="EUR 10" value={10} />
        <Picker.Item label="EUR 20" value={20} />
        <Picker.Item label="EUR 50" value={50} />
      </Picker>
    </View>
  );
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/wallet/TopUpScreen.tsx` | Top-up flow |
| `src/screens/wallet/AutoReloadSettings.tsx` | Auto-reload config |
| `src/hooks/useWallet.ts` | Wallet state hook |

## Testing Checklist

- [ ] Balance displays correctly
- [ ] Preset amounts work
- [ ] Custom amount validates
- [ ] Top-up processes successfully
- [ ] Auto-reload saves settings

## Related Tasks

- **Previous**: [TASK-024](task-024.md)
- **Next**: [TASK-026](task-026.md)
