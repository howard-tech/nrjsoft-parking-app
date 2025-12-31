# TASK-018: Session Timer & Cost Calculator

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-018 |
| **Module** | Parking Session |
| **Priority** | High |
| **Estimated Effort** | 4 hours |
| **Dependencies** | TASK-017 |
| **Status** | 🟢 Completed |

## Description

Implement the live session timer component and real-time cost calculation logic that updates every minute on the Active Session screen.

## Acceptance Criteria

- [x] HH:MM:SS timer counting up from session start
- [x] Cost updates every minute
- [x] Handles app backgrounding correctly
- [x] Calculates cost based on pricing rules
- [x] Supports tiered pricing (if applicable)
- [x] Handles timezone differences

## Progress Notes

- Added `useSessionTimer` hook (handles background/foreground) and updated Active Session to use formatted timer + minute callbacks.
- Cost calculator now supports tiered pricing, min/max caps, currency; session service exposes breakdown.
- Updated timer/projection components and format utilities; lint/tests passing.

## Technical Implementation

### 1. Session Timer Hook

```typescript
// src/hooks/useSessionTimer.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseSessionTimerProps {
  startTime: string;
  onMinuteElapsed?: () => void;
}

export const useSessionTimer = ({ startTime, onMinuteElapsed }: UseSessionTimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMinuteRef = useRef(0);
  const appState = useRef(AppState.currentState);

  const calculateElapsed = useCallback(() => {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 1000);
  }, [startTime]);

  useEffect(() => {
    // Initial calculation
    setElapsedSeconds(calculateElapsed());

    // Start interval
    intervalRef.current = setInterval(() => {
      const elapsed = calculateElapsed();
      setElapsedSeconds(elapsed);

      // Check if a new minute has elapsed
      const currentMinute = Math.floor(elapsed / 60);
      if (currentMinute > lastMinuteRef.current) {
        lastMinuteRef.current = currentMinute;
        onMinuteElapsed?.();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, calculateElapsed, onMinuteElapsed]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - recalculate elapsed time
        setElapsedSeconds(calculateElapsed());
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [calculateElapsed]);

  // Format time
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    elapsedSeconds,
    hours,
    minutes,
    seconds,
    formattedTime,
  };
};
```

### 2. Cost Calculator

```typescript
// src/services/session/costCalculator.ts
import { ParkingSession, PricingRule } from '@types';

export interface CostBreakdown {
  baseCost: number;
  totalCost: number;
  currency: string;
  appliedRules: string[];
}

export const calculateSessionCost = (
  session: ParkingSession,
  elapsedSeconds: number
): CostBreakdown => {
  const elapsedHours = elapsedSeconds / 3600;
  const pricingRules = session.pricingRules || [];
  
  let baseCost = 0;
  let appliedRules: string[] = [];
  
  // Check for tiered pricing
  if (pricingRules.length > 0) {
    baseCost = calculateTieredCost(elapsedHours, pricingRules, appliedRules);
  } else {
    // Simple hourly rate
    baseCost = elapsedHours * session.hourlyRate;
    appliedRules.push(`Standard rate: €${session.hourlyRate}/hr`);
  }
  
  // Apply minimum charge
  if (session.minimumCharge && baseCost < session.minimumCharge) {
    baseCost = session.minimumCharge;
    appliedRules.push(`Minimum charge: €${session.minimumCharge}`);
  }
  
  // Apply maximum daily rate
  if (session.maxDailyRate && baseCost > session.maxDailyRate) {
    baseCost = session.maxDailyRate;
    appliedRules.push(`Max daily rate: €${session.maxDailyRate}`);
  }
  
  // Round to 2 decimal places
  const totalCost = Math.round(baseCost * 100) / 100;
  
  return {
    baseCost,
    totalCost,
    currency: session.currency || 'EUR',
    appliedRules,
  };
};

const calculateTieredCost = (
  hours: number,
  rules: PricingRule[],
  appliedRules: string[]
): number => {
  let totalCost = 0;
  let remainingHours = hours;
  
  // Sort rules by start hour
  const sortedRules = [...rules].sort((a, b) => a.startHour - b.startHour);
  
  for (let i = 0; i < sortedRules.length; i++) {
    const rule = sortedRules[i];
    const nextRule = sortedRules[i + 1];
    
    const tierStart = rule.startHour;
    const tierEnd = nextRule?.startHour ?? Infinity;
    
    if (hours > tierStart) {
      const hoursInTier = Math.min(remainingHours, tierEnd - tierStart);
      const tierCost = hoursInTier * rule.rate;
      totalCost += tierCost;
      remainingHours -= hoursInTier;
      
      appliedRules.push(`${rule.name}: ${hoursInTier.toFixed(2)}h × €${rule.rate}/hr`);
    }
    
    if (remainingHours <= 0) break;
  }
  
  return totalCost;
};
```

### 3. Timer Display Component

```typescript
// src/screens/parking/components/SessionTimer.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface SessionTimerProps {
  formattedTime: string;
  size?: 'small' | 'large';
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ 
  formattedTime, 
  size = 'large' 
}) => {
  const theme = useTheme();
  
  const fontSize = size === 'large' ? 48 : 24;
  
  return (
    <View style={styles.container}>
      <Text style={[
        styles.timer, 
        { color: theme.colors.neutral.textPrimary, fontSize }
      ]}>
        {formattedTime}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timer: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useSessionTimer.ts` | Timer logic hook |
| `src/services/session/costCalculator.ts` | Cost calculation |
| `src/screens/parking/components/SessionTimer.tsx` | Timer display |

## Testing Checklist

- [ ] Timer counts up accurately
- [ ] Timer handles app backgrounding
- [ ] Cost calculation is correct
- [ ] Tiered pricing works
- [ ] Minimum charge applied
- [ ] Maximum daily rate applied
- [ ] Currency formatting correct

## Related Tasks

- **Previous**: [TASK-017](task-017.md) - Active Session Screen
- **Next**: [TASK-019](task-019.md) - Session Receipt Screen
