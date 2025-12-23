# TASK-049: Offline Mode & Error States

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-049 |
| **Module** | Core |
| **Priority** | High |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-007, TASK-009 |
| **Status** | 🔴 Not Started |

## Description

Implement offline mode handling, network state detection, and comprehensive error states throughout the app.

## Acceptance Criteria

- [ ] Network state detection
- [ ] Offline banner when disconnected
- [ ] Cached data display when offline
- [ ] Queue actions for when back online
- [ ] Retry mechanisms
- [ ] Empty states for all screens
- [ ] Error boundaries for crashes
- [ ] Loading states consistency

## Technical Implementation

### Network State Hook

```typescript
// src/hooks/useNetworkState.ts
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
}

export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
      });
    });

    return () => unsubscribe();
  }, []);

  return networkState;
};
```

### Offline Banner Component

```typescript
// src/components/common/OfflineBanner.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkState } from '@hooks/useNetworkState';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const OfflineBanner: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetworkState();
  const translateY = React.useRef(new Animated.Value(-50)).current;

  const isOffline = !isConnected || isInternetReachable === false;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOffline ? 0 : -50,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
    >
      <Icon name="wifi-off" size={16} color="#FFFFFF" />
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingTop: 50, // Safe area
    zIndex: 1000,
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
```

### Offline Queue Manager

```typescript
// src/services/offline/offlineQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = '@offline_queue';
const MAX_RETRIES = 3;

export const offlineQueue = {
  add: async (type: string, payload: any): Promise<string> => {
    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const queue = await offlineQueue.getAll();
    queue.push(action);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    return action.id;
  },

  getAll: async (): Promise<QueuedAction[]> => {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  },

  remove: async (id: string): Promise<void> => {
    const queue = await offlineQueue.getAll();
    const filtered = queue.filter(action => action.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },

  processQueue: async (
    handlers: Record<string, (payload: any) => Promise<void>>
  ): Promise<{ success: number; failed: number }> => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      return { success: 0, failed: 0 };
    }

    const queue = await offlineQueue.getAll();
    let success = 0;
    let failed = 0;

    for (const action of queue) {
      const handler = handlers[action.type];
      if (!handler) {
        await offlineQueue.remove(action.id);
        continue;
      }

      try {
        await handler(action.payload);
        await offlineQueue.remove(action.id);
        success++;
      } catch (error) {
        action.retryCount++;
        if (action.retryCount >= MAX_RETRIES) {
          await offlineQueue.remove(action.id);
          failed++;
        }
      }
    }

    return { success, failed };
  },
};
```

### Error Boundary Component

```typescript
// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { crashReportingService } from '@services/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    crashReportingService.recordError(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Icon name="alert-circle-outline" size={64} color="#E53935" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#1A1A1A',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#E31E24',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Empty State Component

```typescript
// src/components/common/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: theme.colors.neutral.textSecondary }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary.main }]}
          onPress={onAction}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Loading State Component

```typescript
// src/components/common/LoadingState.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={theme.colors.primary.main} />
      {message && (
        <Text style={[styles.message, { color: theme.colors.neutral.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useNetworkState.ts` | Network detection hook |
| `src/components/common/OfflineBanner.tsx` | Offline indicator |
| `src/components/common/ErrorBoundary.tsx` | Error boundary |
| `src/components/common/EmptyState.tsx` | Empty state component |
| `src/components/common/LoadingState.tsx` | Loading component |
| `src/services/offline/offlineQueue.ts` | Offline queue manager |

## Dependencies

```bash
npm install @react-native-community/netinfo
```

## Testing Checklist

- [ ] Offline banner shows when disconnected
- [ ] Offline banner hides when reconnected
- [ ] Cached data displays offline
- [ ] Actions queue when offline
- [ ] Queue processes when back online
- [ ] Error boundary catches crashes
- [ ] Empty states display correctly
- [ ] Loading states are consistent

## Related Tasks

- **Previous**: [TASK-007](task-007.md), [TASK-009](task-009.md)
- **Next**: [TASK-050](task-050.md)
