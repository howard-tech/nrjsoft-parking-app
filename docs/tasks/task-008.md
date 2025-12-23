# TASK-008: Push Notification Service (FCM)

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-008 |
| **Module** | Services |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🔴 Not Started |

## Description

Set up Firebase Cloud Messaging (FCM) for push notifications on both iOS and Android platforms. Handle notification permissions, token registration, and notification handling in foreground/background states.

## Context from Technical Proposal

- **Notification Service**: Firebase Cloud Messaging (FCM) for high-priority delivery
- Session start/end notifications
- Low balance warnings
- Parking expiry reminders (5 minutes before)
- Payment confirmations

## Acceptance Criteria

- [ ] FCM configured for iOS and Android
- [ ] Push notification permission request flow
- [ ] Device token registration with backend
- [ ] Foreground notification handling
- [ ] Background notification handling
- [ ] Deep linking from notifications
- [ ] Local notifications for timers

## Technical Implementation

### 1. FCM Setup

```typescript
// src/services/notifications/pushService.ts
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { apiClient } from '@services/api/client';

export const pushService = {
  initialize: async () => {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await pushService.registerToken();
    }
    
    return enabled;
  },

  registerToken: async () => {
    const token = await messaging().getToken();
    await apiClient.post('/devices/register', { 
      token, 
      platform: Platform.OS 
    });
    
    // Listen for token refresh
    messaging().onTokenRefresh(async (newToken) => {
      await apiClient.post('/devices/register', { 
        token: newToken, 
        platform: Platform.OS 
      });
    });
  },

  setupHandlers: () => {
    // Foreground messages
    messaging().onMessage(async (remoteMessage) => {
      await pushService.displayNotification(remoteMessage);
    });

    // Background message handler (must be set outside React lifecycle)
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
    });
  },

  displayNotification: async (message: FirebaseMessagingTypes.RemoteMessage) => {
    const channelId = await notifee.createChannel({
      id: 'parking',
      name: 'Parking Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.displayNotification({
      title: message.notification?.title,
      body: message.notification?.body,
      android: {
        channelId,
        pressAction: { id: 'default' },
      },
      data: message.data,
    });
  },
};
```

### 2. Local Notifications for Timers

```typescript
// src/services/notifications/localNotifications.ts
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';

export const localNotifications = {
  scheduleExpiryReminder: async (sessionId: string, expiryTime: Date, zoneName: string) => {
    // Schedule 5 minutes before expiry
    const reminderTime = new Date(expiryTime.getTime() - 5 * 60 * 1000);
    
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTime.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id: `expiry-${sessionId}`,
        title: 'Parking Expiring Soon',
        body: `Your parking at ${zoneName} expires in 5 minutes. Extend now?`,
        android: {
          channelId: 'parking',
          pressAction: { id: 'extend', launchActivity: 'default' },
          actions: [
            { title: 'Extend', pressAction: { id: 'extend' } },
            { title: 'Dismiss', pressAction: { id: 'dismiss' } },
          ],
        },
        ios: {
          categoryId: 'parking-expiry',
        },
        data: { sessionId, action: 'expiry-warning' },
      },
      trigger,
    );
  },

  scheduleLowBalanceWarning: async (currentCost: number, balance: number) => {
    await notifee.displayNotification({
      title: 'Low Balance Warning',
      body: `Your wallet balance (€${balance.toFixed(2)}) is running low. Top up to continue parking.`,
      android: {
        channelId: 'parking',
        importance: AndroidImportance.HIGH,
      },
      data: { action: 'low-balance' },
    });
  },

  cancelExpiryReminder: async (sessionId: string) => {
    await notifee.cancelNotification(`expiry-${sessionId}`);
  },
};
```

### 3. Notification Handler Hook

```typescript
// src/hooks/useNotificationHandler.ts
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

export const useNotificationHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle notification tap when app is in background/quit
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          handleNotificationNavigation(remoteMessage.data);
        }
      });

    // Handle notification tap when app is in background
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      handleNotificationNavigation(remoteMessage.data);
    });

    // Handle notifee events
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        handleNotificationNavigation(detail.notification?.data);
      }
      if (type === EventType.ACTION_PRESS) {
        handleNotificationAction(detail.pressAction?.id, detail.notification?.data);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeNotifee();
    };
  }, []);

  const handleNotificationNavigation = (data?: Record<string, string>) => {
    if (!data) return;

    switch (data.action) {
      case 'session-start':
      case 'session-end':
        navigation.navigate('SessionTab', { screen: 'ActiveSession' });
        break;
      case 'low-balance':
      case 'top-up':
        navigation.navigate('WalletTab', { screen: 'TopUp' });
        break;
      case 'expiry-warning':
        navigation.navigate('SessionTab', { 
          screen: 'ActiveSession',
          params: { sessionId: data.sessionId }
        });
        break;
      default:
        navigation.navigate('NotificationsScreen');
    }
  };

  const handleNotificationAction = (actionId?: string, data?: Record<string, string>) => {
    if (actionId === 'extend' && data?.sessionId) {
      navigation.navigate('SessionTab', {
        screen: 'ExtendSession',
        params: { sessionId: data.sessionId },
      });
    }
  };
};
```

### 4. iOS Configuration

```swift
// ios/AppDelegate.swift additions
import Firebase
import UserNotifications

// In didFinishLaunchingWithOptions:
FirebaseApp.configure()
UNUserNotificationCenter.current().delegate = self
```

### 5. Android Configuration

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

<service
  android:name="io.invertase.firebase.messaging.RNFirebaseMessagingService"
  android:exported="false">
  <intent-filter>
    <action android:name="com.google.firebase.MESSAGING_EVENT" />
  </intent-filter>
</service>
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/notifications/pushService.ts` | FCM setup and handling |
| `src/services/notifications/localNotifications.ts` | Local notification scheduling |
| `src/services/notifications/index.ts` | Barrel export |
| `src/hooks/useNotificationHandler.ts` | Navigation from notifications |
| `src/hooks/useNotificationPermission.ts` | Permission request hook |
| iOS/Android config files | Platform-specific setup |

## Dependencies to Install

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native
cd ios && pod install
```

## Testing Checklist

- [ ] FCM token generated successfully
- [ ] Token registered with backend
- [ ] Foreground notifications display
- [ ] Background notifications received
- [ ] Notification tap navigates correctly
- [ ] Local notifications scheduled correctly
- [ ] Expiry reminders fire at correct time
- [ ] Action buttons work on notifications
- [ ] Permission request flow works
- [ ] Token refresh handled

## Related Tasks

- **Previous**: [TASK-007](task-007.md) - API Client
- **Required by**: [TASK-017](task-017.md), [TASK-027](task-027.md), [TASK-034](task-034.md)
