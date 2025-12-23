# TASK-017: Active Parking Session Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-017 |
| **Module** | Parking Session |
| **Priority** | Critical |
| **Estimated Effort** | 10 hours |
| **Dependencies** | TASK-016, TASK-008 |
| **Status** | 🔴 Not Started |

## Description

Implement the Active Parking Session screen that displays real-time parking session information including live timer, current cost, wallet projection, and session management actions.

## Context from Technical Proposal (Pages 14-15)

### Key Features:
1. **Trigger**: Screen automatically appears when API sends SESSION_START webhook
2. **Status Header**: "Parking in Progress - [Zone Name]"
3. **Live Timer**: HH:MM:SS counting up since entry
4. **Live Cost**: "Current Fee: €4.50" (updates every minute)
5. **Wallet Projection**: Visual bar showing current cost vs wallet balance
6. **Warning UI**: Bar turns orange/red when cost is within €1.00 of balance
7. **Top-Up Now Button**: Emergency button to add funds
8. **Notifications**: 5 minutes before prepaid balance runs out, app triggers notification

### UI Elements from Mockup:
- Header with NRJ Soft branding and "Wallet" badge
- Balance display: "EUR 12.50"
- Support info: "5 min SLA - +49 800 223 4455"
- Card showing:
  - "PARKING IN PROGRESS" label
  - "NRJ Downtown Hub" - zone name
  - "23 Marina Blvd" - address
  - Live timer: "00:18:15"
  - "Started on SESSION_START webhook" subtitle
  - Current fee: "EUR 1.37" with "Updates every minute"
  - Wallet projection bar with "Balance: EUR 12.50"
  - "Top-up now" button

## Acceptance Criteria

- [ ] Session screen displays when session starts
- [ ] Live timer counts up from session start time
- [ ] Current fee updates every minute based on rate
- [ ] Wallet balance displayed prominently
- [ ] Wallet projection bar shows cost vs balance
- [ ] Warning colors when balance is low
- [ ] Top-up button navigates to wallet
- [ ] Support hotline tap-to-call
- [ ] Push notification before balance runs out
- [ ] Session ends properly on exit (webhook)
- [ ] Error handling for session failures

## Technical Implementation

### 1. Active Session Screen

```typescript
// src/screens/parking/ActiveSessionScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useActiveSession } from '@hooks/useActiveSession';
import { useWallet } from '@hooks/useWallet';
import { formatDuration, formatCurrency } from '@utils/formatters';

// Components
import { SessionTimer } from './components/SessionTimer';
import { WalletProjectionBar } from './components/WalletProjectionBar';
import { Button } from '@components/common/Button';

const SUPPORT_PHONE = '+49 800 223 4455';
const LOW_BALANCE_THRESHOLD = 1.00;

export const ActiveSessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  
  // Hooks
  const { session, isLoading, error, refetch } = useActiveSession();
  const { balance, refetch: refetchWallet } = useWallet();
  
  // Calculate current cost projection
  const [currentCost, setCurrentCost] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Calculate elapsed time and cost
  useEffect(() => {
    if (!session) return;
    
    const startTime = new Date(session.startTime).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);
      
      // Calculate cost based on hourly rate
      const hours = elapsed / 3600;
      const cost = hours * session.hourlyRate;
      setCurrentCost(Math.round(cost * 100) / 100);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [session]);
  
  // Check for low balance warning
  useEffect(() => {
    if (balance !== null && currentCost > 0) {
      const remaining = balance - currentCost;
      if (remaining <= LOW_BALANCE_THRESHOLD && remaining > 0) {
        // Show warning notification
        Alert.alert(
          'Low Balance Warning',
          `Your wallet balance is running low. Top up now to avoid session interruption.`,
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Top Up', onPress: handleTopUp },
          ]
        );
      }
    }
  }, [currentCost, balance]);
  
  const handleTopUp = useCallback(() => {
    navigation.navigate('WalletTab', { screen: 'TopUp' });
  }, [navigation]);
  
  const handleCallSupport = useCallback(() => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  }, []);
  
  const getBalanceStatus = () => {
    if (balance === null) return 'normal';
    const remaining = balance - currentCost;
    if (remaining <= 0) return 'critical';
    if (remaining <= LOW_BALANCE_THRESHOLD) return 'warning';
    return 'normal';
  };
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
        <Text style={[styles.noSession, { color: theme.colors.neutral.textSecondary }]}>
          No active parking session
        </Text>
        <Button 
          title="Find Parking" 
          onPress={() => navigation.navigate('HomeTab')} 
        />
      </View>
    );
  }
  
  const balanceStatus = getBalanceStatus();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
      {/* Header with Balance */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary.main }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <Image source={require('@assets/images/nrj-logo-white.png')} style={styles.logo} />
            <View>
              <Text style={styles.brandName}>NRJSOFT</Text>
              <Text style={styles.brandSubtitle}>Mobility OS</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.walletBadge}
            onPress={() => navigation.navigate('WalletTab')}
          >
            <Text style={styles.walletBadgeText}>Wallet</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>BALANCE</Text>
          <Text style={styles.balanceAmount}>EUR {formatCurrency(balance ?? 0)}</Text>
        </View>
        
        {/* Support Info */}
        <TouchableOpacity style={styles.supportRow} onPress={handleCallSupport}>
          <Text style={styles.supportLabel}>SUPPORT</Text>
          <Text style={styles.supportText}>5 min SLA - {SUPPORT_PHONE}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Session Card */}
      <View style={[styles.sessionCard, { backgroundColor: theme.colors.neutral.surface }]}>
        <Text style={[styles.sessionLabel, { color: theme.colors.primary.main }]}>
          PARKING IN PROGRESS
        </Text>
        
        <Text style={[styles.zoneName, { color: theme.colors.neutral.textPrimary }]}>
          {session.zoneName}
        </Text>
        <Text style={[styles.address, { color: theme.colors.neutral.textSecondary }]}>
          {session.address}
        </Text>
        
        {/* Live Timer */}
        <View style={styles.timerSection}>
          <Text style={[styles.timerLabel, { color: theme.colors.neutral.textSecondary }]}>
            LIVE TIMER
          </Text>
          <SessionTimer seconds={elapsedSeconds} />
          <Text style={[styles.timerSubtext, { color: theme.colors.neutral.textSecondary }]}>
            Started on SESSION_START webhook.
          </Text>
        </View>
        
        {/* Current Fee */}
        <View style={styles.feeSection}>
          <Text style={[styles.feeLabel, { color: theme.colors.neutral.textSecondary }]}>
            CURRENT FEE
          </Text>
          <Text style={[styles.feeAmount, { color: theme.colors.neutral.textPrimary }]}>
            EUR {formatCurrency(currentCost)}
          </Text>
          <Text style={[styles.feeSubtext, { color: theme.colors.neutral.textSecondary }]}>
            Updates every minute.
          </Text>
        </View>
        
        {/* Wallet Projection */}
        <WalletProjectionBar
          currentCost={currentCost}
          balance={balance ?? 0}
          status={balanceStatus}
        />
        
        {/* Top-Up Button */}
        <Button
          title="Top-up now"
          variant={balanceStatus === 'normal' ? 'secondary' : 'primary'}
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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  brandSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  walletBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  walletBadgeText: {
    color: '#1E3A5F',
    fontWeight: '600',
    fontSize: 14,
  },
  balanceSection: {
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.8,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.8,
    marginRight: 8,
  },
  supportText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  sessionCard: {
    flex: 1,
    margin: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sessionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  zoneName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    marginBottom: 24,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  timerSubtext: {
    fontSize: 12,
    marginTop: 8,
  },
  feeSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
  },
  feeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  feeAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  feeSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  topUpButton: {
    marginTop: 16,
  },
  noSession: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
});
```

### 2. Session Timer Component

```typescript
// src/screens/parking/components/SessionTimer.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface SessionTimerProps {
  seconds: number;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ seconds }) => {
  const theme = useTheme();
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const format = (num: number) => num.toString().padStart(2, '0');
  
  return (
    <Text style={[styles.timer, { color: theme.colors.neutral.textPrimary }]}>
      {format(hours)}:{format(minutes)}:{format(secs)}
    </Text>
  );
};

const styles = StyleSheet.create({
  timer: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
```

### 3. Wallet Projection Bar

```typescript
// src/screens/parking/components/WalletProjectionBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { formatCurrency } from '@utils/formatters';

interface WalletProjectionBarProps {
  currentCost: number;
  balance: number;
  status: 'normal' | 'warning' | 'critical';
}

export const WalletProjectionBar: React.FC<WalletProjectionBarProps> = ({
  currentCost,
  balance,
  status,
}) => {
  const theme = useTheme();
  
  const percentage = balance > 0 ? Math.min((currentCost / balance) * 100, 100) : 100;
  
  const getBarColor = () => {
    switch (status) {
      case 'critical': return theme.colors.error.main;
      case 'warning': return theme.colors.warning.main;
      default: return theme.colors.primary.main;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.neutral.textPrimary }]}>
          Wallet projection
        </Text>
        <Text style={[styles.balance, { color: theme.colors.neutral.textSecondary }]}>
          Balance: EUR {formatCurrency(balance)}
        </Text>
      </View>
      
      <View style={[styles.barContainer, { backgroundColor: theme.colors.neutral.border }]}>
        <View 
          style={[
            styles.barFill,
            { 
              width: `${percentage}%`,
              backgroundColor: getBarColor(),
            }
          ]} 
        />
      </View>
      
      {status !== 'normal' && (
        <Text style={[styles.warning, { color: getBarColor() }]}>
          {status === 'critical' 
            ? 'Balance depleted! Top up immediately.'
            : 'Balance running low. Consider topping up.'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  balance: {
    fontSize: 14,
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  warning: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/parking/ActiveSessionScreen.tsx` | Main session screen |
| `src/screens/parking/components/SessionTimer.tsx` | Live timer display |
| `src/screens/parking/components/WalletProjectionBar.tsx` | Balance projection |
| `src/hooks/useActiveSession.ts` | Session data hook |
| `src/hooks/useWallet.ts` | Wallet data hook |
| `src/utils/formatters.ts` | Format utilities |

## Testing Checklist

- [ ] Screen displays active session correctly
- [ ] Timer counts up accurately
- [ ] Cost calculation is correct based on rate
- [ ] Wallet balance displays correctly
- [ ] Projection bar shows correct percentage
- [ ] Warning colors appear at low balance
- [ ] Top-up button navigates to wallet
- [ ] Support phone opens dialer
- [ ] No session state displays correctly
- [ ] Session end handled properly

## Related Tasks

- **Previous**: [TASK-016](task-016.md) - Session Service
- **Next**: [TASK-018](task-018.md) - Session Timer & Cost Calculator
- **Depends on**: [TASK-008](task-008.md) - Push Notifications
