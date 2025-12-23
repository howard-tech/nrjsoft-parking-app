# TASK-036: Error Handling & Edge Cases

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-036 |
| **Module** | Core |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-007 |
| **Status** | 🔴 Not Started |

## Description

Implement comprehensive error handling, offline support, and edge case management throughout the application.

## Context from Technical Proposal (Page 28)

- Error & edge-case handling
- Loading states & micro-interactions
- Policy banners & mandatory notices

## Acceptance Criteria

- [ ] Global error boundary
- [ ] API error handling with user-friendly messages
- [ ] Offline mode detection
- [ ] Retry mechanisms
- [ ] Empty states for lists
- [ ] Loading skeletons
- [ ] Error toast notifications
- [ ] Network connectivity indicator

## Technical Implementation

### Error Boundary

```typescript
// src/components/common/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button title="Try Again" onPress={this.handleRetry} />
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
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
```

### Network Status Hook

```typescript
// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
      setConnectionType(state.type);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, connectionType };
};
```

### Offline Banner

```typescript
// src/components/common/OfflineBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { useTheme } from '@theme';

export const OfflineBanner: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const theme = useTheme();
  const translateY = React.useRef(new Animated.Value(-50)).current;

  React.useEffect(() => {
    Animated.timing(translateY, {
      toValue: isConnected ? -50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected]);

  return (
    <Animated.View
      style={[
        styles.banner,
        { 
          backgroundColor: theme.colors.warning.main,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
```

### Toast Notification System

```typescript
// src/services/toast/toastService.ts
import Toast from 'react-native-toast-message';

export const toast = {
  success: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  error: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },

  info: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Info',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  apiError: (error: any) => {
    const message = error?.message || 'Something went wrong. Please try again.';
    toast.error(message);
  },
};
```

### Empty State Component

```typescript
// src/components/common/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
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
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: theme.colors.neutral.textSecondary }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    minWidth: 150,
  },
});
```

### Loading Skeleton

```typescript
// src/components/common/Skeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/common/ErrorBoundary.tsx` | Error boundary |
| `src/components/common/OfflineBanner.tsx` | Offline indicator |
| `src/components/common/EmptyState.tsx` | Empty state display |
| `src/components/common/Skeleton.tsx` | Loading skeleton |
| `src/hooks/useNetworkStatus.ts` | Network hook |
| `src/services/toast/toastService.ts` | Toast notifications |

## Testing Checklist

- [ ] Error boundary catches crashes
- [ ] Offline banner shows/hides correctly
- [ ] Toast notifications display
- [ ] Empty states render correctly
- [ ] Loading skeletons animate
- [ ] API errors show friendly messages

## Related Tasks

- **Previous**: [TASK-035](task-035.md)
- **Next**: [TASK-037](task-037.md)
