# TASK-003: Navigation Shell & Tab Structure

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-003 |
| **Module** | Navigation |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-001, TASK-002 |
| **Status** | 🔴 Not Started |

## Description

Implement the main navigation structure including bottom tab navigation, stack navigators for each tab, and the overall navigation flow. This establishes the app shell that all screens will plug into.

## Context from Technical Proposal

From the mockups (page 6), the bottom navigation has 5 tabs:
- **Home** - Smart Map view
- **Session** - Active parking session
- **Wallet** - Payment/Wallet management
- **History** - Parking history
- **Account** - User account settings

Additional navigation flows:
- Authentication stack (shown before main tabs)
- Modal stacks for payment flows, QR scanner, etc.
- Notification badge on top-right header

## Acceptance Criteria

- [ ] Bottom tab navigator with 5 tabs implemented
- [ ] Stack navigator for each tab section
- [ ] Auth stack for login/onboarding flow
- [ ] Modal presentation for overlays (payment, QR scanner)
- [ ] Navigation types properly defined (TypeScript)
- [ ] Deep linking configuration ready
- [ ] Tab icons with NRJ Soft styling
- [ ] Notification badge indicator on header

## Technical Requirements

### 1. Navigation Types

```typescript
// src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Tutorial: undefined;
  Login: undefined;
  OTPVerification: { phone: string; email?: string };
};

// Home Stack (Smart Map)
export type HomeStackParamList = {
  SmartMap: undefined;
  GarageDetail: { garageId: string };
  QRScanner: { garageId: string };
  Search: undefined;
};

// Session Stack
export type SessionStackParamList = {
  ActiveSession: undefined;
  SessionHistory: undefined;
  SessionDetail: { sessionId: string };
};

// Wallet/Payment Stack
export type WalletStackParamList = {
  WalletHome: undefined;
  TopUp: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  Subscriptions: undefined;
};

// History Stack
export type HistoryStackParamList = {
  HistoryList: undefined;
  HistoryDetail: { sessionId: string };
  Receipt: { transactionId: string };
};

// Account Stack
export type AccountStackParamList = {
  AccountHome: undefined;
  Profile: undefined;
  Vehicles: undefined;
  AddVehicle: undefined;
  NotificationSettings: undefined;
  PaymentPreferences: undefined;
  Help: undefined;
  DeleteAccount: undefined;
};

// On-Street Stack (accessible from Home)
export type OnStreetStackParamList = {
  OnStreetParking: undefined;
  ZoneSelection: undefined;
  DurationSelection: { zoneId: string };
  OnStreetPayment: { zoneId: string; duration: number };
  OnStreetSession: { sessionId: string };
};

// Main Tab Navigator
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SessionTab: NavigatorScreenParams<SessionStackParamList>;
  WalletTab: NavigatorScreenParams<WalletStackParamList>;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  AccountTab: NavigatorScreenParams<AccountStackParamList>;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  OnStreet: NavigatorScreenParams<OnStreetStackParamList>;
  Notifications: undefined;
  // Modals
  PaymentModal: { amount: number; sessionId?: string };
  QRScannerModal: { garageId: string };
};

// For useNavigation hook typing
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

### 2. Tab Navigator Implementation

```typescript
// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { useTheme } from '@theme';

// Import stack navigators (to be created)
import HomeStack from './stacks/HomeStack';
import SessionStack from './stacks/SessionStack';
import WalletStack from './stacks/WalletStack';
import HistoryStack from './stacks/HistoryStack';
import AccountStack from './stacks/AccountStack';

// Import icons (placeholder - use actual icons)
import { TabBarIcon } from '@components/common';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.neutral.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.neutral.surface,
          borderTopColor: theme.colors.neutral.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SessionTab"
        component={SessionStack}
        options={{
          tabBarLabel: 'Session',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="clock" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletStack}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="download" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountStack}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
```

### 3. Root Navigator

```typescript
// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@theme';

import AuthStack from './stacks/AuthStack';
import { MainTabNavigator } from './MainTabNavigator';
import OnStreetStack from './stacks/OnStreetStack';
import NotificationsScreen from '@screens/notifications/NotificationsScreen';

// Modals
import PaymentModal from '@screens/payment/PaymentModal';
import QRScannerModal from '@screens/home/QRScannerModal';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    // Return splash/loading screen
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.neutral.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="OnStreet" 
              component={OnStreetStack}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ 
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Notifications',
              }}
            />
            {/* Modal screens */}
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen name="PaymentModal" component={PaymentModal} />
              <Stack.Screen name="QRScannerModal" component={QRScannerModal} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 4. Header with Notification Badge

```typescript
// src/components/common/AppHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useNotifications } from '@hooks/useNotifications';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  showNotificationBadge?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'NRJSoft',
  showLogo = true,
  showNotificationBadge = true,
}) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { unreadCount } = useNotifications();

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary.main }]}>
      <View style={styles.leftSection}>
        {showLogo && (
          <Image
            source={require('@assets/images/nrj-logo-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.title, { color: theme.colors.primary.contrast }]}>
          {title}
        </Text>
      </View>
      
      {showNotificationBadge && (
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={handleNotificationPress}
        >
          <NotificationIcon color={theme.colors.primary.contrast} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.secondary.main }]}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48, // Account for status bar
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
```

### 5. Deep Linking Configuration

```typescript
// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['nrjsoft://', 'https://app.nrjsoft.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
        },
      },
      Main: {
        screens: {
          HomeTab: {
            screens: {
              SmartMap: 'home',
              GarageDetail: 'garage/:garageId',
            },
          },
          SessionTab: {
            screens: {
              ActiveSession: 'session',
              SessionDetail: 'session/:sessionId',
            },
          },
          WalletTab: {
            screens: {
              WalletHome: 'wallet',
            },
          },
        },
      },
      OnStreet: {
        screens: {
          OnStreetParking: 'onstreet',
          OnStreetSession: 'onstreet/session/:sessionId',
        },
      },
      Notifications: 'notifications',
      QRScannerModal: 'qr/:garageId',
    },
  },
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/navigation/types.ts` | Navigation type definitions |
| `src/navigation/RootNavigator.tsx` | Root navigator component |
| `src/navigation/MainTabNavigator.tsx` | Bottom tab navigator |
| `src/navigation/stacks/AuthStack.tsx` | Authentication stack |
| `src/navigation/stacks/HomeStack.tsx` | Home/Map stack |
| `src/navigation/stacks/SessionStack.tsx` | Session stack |
| `src/navigation/stacks/WalletStack.tsx` | Wallet/Payment stack |
| `src/navigation/stacks/HistoryStack.tsx` | History stack |
| `src/navigation/stacks/AccountStack.tsx` | Account stack |
| `src/navigation/stacks/OnStreetStack.tsx` | On-street parking stack |
| `src/navigation/linking.ts` | Deep linking configuration |
| `src/navigation/index.ts` | Barrel export |
| `src/components/common/AppHeader.tsx` | App header with notification badge |
| `src/components/common/TabBarIcon.tsx` | Tab bar icon component |

## Placeholder Screens

Create placeholder screens for each route to test navigation:

```typescript
// src/screens/PlaceholderScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlaceholderScreenProps {
  name: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ name }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{name}</Text>
    <Text style={styles.subtext}>Screen coming soon</Text>
  </View>
);
```

## Testing Checklist

- [ ] All 5 tabs render correctly
- [ ] Tab icons display with correct colors (active/inactive)
- [ ] Stack navigation within each tab works
- [ ] Modal presentations work correctly
- [ ] Auth flow blocks main tabs when not authenticated
- [ ] Deep links navigate to correct screens
- [ ] Notification badge displays count
- [ ] Header renders on all screens
- [ ] Back navigation works correctly

## Related Tasks

- **Previous**: [TASK-002](task-002.md) - Design System
- **Next**: [TASK-004](task-004.md) - Tutorial & Onboarding Screens
- **Required by**: All screen tasks
