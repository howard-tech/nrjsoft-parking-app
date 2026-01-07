# TASK-028: On-Street Countdown Timer & Notifications

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-028 |
| **Module** | On-Street Parking |
| **Priority** | High |
| **Estimated Effort** | 4 hours |
| **Dependencies** | TASK-027 |
| **Status** | 🟢 Completed |

## Description

Implement the countdown timer for pre-paid on-street parking with expiry notifications and extend prompts.

## Acceptance Criteria

- [ ] Countdown timer from end time
- [ ] Timer updates every second
- [ ] Handles app backgrounding
- [ ] Expiry reminder notification (5 min before)
- [ ] Extend time prompt before expiry

## Technical Implementation

### Countdown Timer Hook

```typescript
// src/hooks/useCountdownTimer.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { localNotifications } from '@services/notifications/localNotifications';

export const useCountdownTimer = (endTime: string | null) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationScheduledRef = useRef(false);

  const calculateRemaining = useCallback(() => {
    if (!endTime) return 0;
    const end = new Date(endTime).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((end - now) / 1000));
  }, [endTime]);

  useEffect(() => {
    if (!endTime) return;

    setRemainingSeconds(calculateRemaining());

    // Schedule 5-minute warning notification
    if (!notificationScheduledRef.current) {
      const warningTime = new Date(new Date(endTime).getTime() - 5 * 60 * 1000);
      if (warningTime > new Date()) {
        localNotifications.scheduleExpiryReminder('onstreet', new Date(endTime), 'On-Street Parking');
        notificationScheduledRef.current = true;
      }
    }

    intervalRef.current = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);
      
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endTime, calculateRemaining]);

  // Handle app state
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setRemainingSeconds(calculateRemaining());
      }
    });
    return () => subscription.remove();
  }, [calculateRemaining]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime = hours > 0
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isExpired = remainingSeconds <= 0;
  const isWarning = remainingSeconds > 0 && remainingSeconds <= 5 * 60;

  return {
    remainingSeconds,
    hours,
    minutes,
    seconds,
    formattedTime,
    isExpired,
    isWarning,
  };
};
```

### Countdown Display Component

```typescript
// src/screens/onstreet/components/CountdownDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface CountdownDisplayProps {
  formattedTime: string;
  isWarning: boolean;
  isExpired: boolean;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  formattedTime,
  isWarning,
  isExpired,
}) => {
  const theme = useTheme();

  const getColor = () => {
    if (isExpired) return theme.colors.error.main;
    if (isWarning) return theme.colors.warning.main;
    return theme.colors.neutral.textPrimary;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.timer, { color: getColor() }]}>
        {isExpired ? 'EXPIRED' : formattedTime}
      </Text>
      <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>
        {isExpired
          ? 'Your parking session has expired'
          : 'Countdown until prepaid time expires.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 14,
    marginTop: 8,
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useCountdownTimer.ts` | Countdown logic |
| `src/screens/onstreet/components/CountdownDisplay.tsx` | Timer display |

## Testing Checklist

- [ ] Countdown accurate
- [ ] Handles backgrounding
- [ ] Warning color at 5 min
- [ ] Notification fires at 5 min
- [ ] Expired state shows correctly

## Related Tasks

- **Previous**: [TASK-027](task-027.md)
- **Next**: [TASK-029](task-029.md)
