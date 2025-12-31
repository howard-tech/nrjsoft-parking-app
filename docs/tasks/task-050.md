# TASK-050: Analytics & Crash Reporting

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-050 |
| **Module** | Core |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🟢 Completed |

## Description

Implement analytics tracking and crash reporting for monitoring app usage and stability.

## Acceptance Criteria

- [x] Firebase Analytics integration
- [x] Firebase Crashlytics integration
- [x] Screen view tracking
- [x] Custom event tracking
- [x] User property tracking
- [x] Crash and error logging
- [x] Performance monitoring

## Progress Notes

- Added analytics/crash/perf services with safe defaults (collection disabled in `__DEV__`), plus screen hook for view tracking.
- App initializes analytics + crash reporting on bootstrap and syncs user identifiers from auth state.
- Navigation container sends screen view events; error boundary reports caught errors to Crashlytics.
- Jest setup mocks Firebase native modules for unit tests.

## Technical Implementation

### Dependencies

```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/analytics
npm install @react-native-firebase/crashlytics
npm install @react-native-firebase/perf
```

### iOS Setup

```bash
cd ios && pod install
```

Add `GoogleService-Info.plist` to iOS project.

### Android Setup

Add `google-services.json` to `android/app/`.

Update `android/build.gradle`:
```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
    classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.9'
  }
}
```

Update `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
apply plugin: 'com.google.firebase.crashlytics'
```

### Analytics Service

```typescript
// src/services/analytics/analyticsService.ts
import analytics from '@react-native-firebase/analytics';

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean>;
}

export const analyticsService = {
  /**
   * Initialize analytics (call on app start)
   */
  initialize: async () => {
    await analytics().setAnalyticsCollectionEnabled(!__DEV__);
  },

  /**
   * Log screen view
   */
  logScreenView: async (screenName: string, screenClass?: string) => {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  },

  /**
   * Log custom event
   */
  logEvent: async (eventName: string, params?: Record<string, any>) => {
    await analytics().logEvent(eventName, params);
  },

  /**
   * Set user ID (after login)
   */
  setUserId: async (userId: string | null) => {
    await analytics().setUserId(userId);
  },

  /**
   * Set user properties
   */
  setUserProperty: async (name: string, value: string) => {
    await analytics().setUserProperty(name, value);
  },

  /**
   * Set multiple user properties
   */
  setUserProperties: async (properties: Record<string, string>) => {
    await analytics().setUserProperties(properties);
  },

  // Pre-defined events
  events: {
    // Auth events
    login: (method: string) =>
      analyticsService.logEvent('login', { method }),
    signUp: (method: string) =>
      analyticsService.logEvent('sign_up', { method }),
    logout: () =>
      analyticsService.logEvent('logout'),

    // Parking events
    sessionStart: (garageId: string, garageName: string) =>
      analyticsService.logEvent('parking_session_start', { garage_id: garageId, garage_name: garageName }),
    sessionEnd: (garageId: string, duration: number, amount: number) =>
      analyticsService.logEvent('parking_session_end', { garage_id: garageId, duration_minutes: duration, amount }),
    sessionExtend: (garageId: string, additionalMinutes: number) =>
      analyticsService.logEvent('parking_session_extend', { garage_id: garageId, additional_minutes: additionalMinutes }),

    // Payment events
    walletTopUp: (amount: number, method: string) =>
      analyticsService.logEvent('wallet_top_up', { amount, method }),
    paymentSuccess: (amount: number, method: string) =>
      analyticsService.logEvent('payment_success', { amount, method }),
    paymentFailed: (amount: number, method: string, error: string) =>
      analyticsService.logEvent('payment_failed', { amount, method, error }),

    // Navigation events
    garageView: (garageId: string, garageName: string) =>
      analyticsService.logEvent('garage_view', { garage_id: garageId, garage_name: garageName }),
    searchPerformed: (query: string, resultsCount: number) =>
      analyticsService.logEvent('search', { query, results_count: resultsCount }),
    navigationStarted: (garageId: string, app: string) =>
      analyticsService.logEvent('navigation_started', { garage_id: garageId, app }),

    // Feature usage
    qrScanUsed: (success: boolean) =>
      analyticsService.logEvent('qr_scan', { success }),
    plateOcrUsed: (success: boolean) =>
      analyticsService.logEvent('plate_ocr', { success }),
  },
};
```

### Crash Reporting Service

```typescript
// src/services/analytics/crashReportingService.ts
import crashlytics from '@react-native-firebase/crashlytics';

export const crashReportingService = {
  /**
   * Initialize crashlytics
   */
  initialize: async () => {
    await crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
  },

  /**
   * Set user identifier for crash reports
   */
  setUserId: async (userId: string) => {
    await crashlytics().setUserId(userId);
  },

  /**
   * Set custom attributes
   */
  setAttribute: async (key: string, value: string) => {
    await crashlytics().setAttribute(key, value);
  },

  /**
   * Set multiple attributes
   */
  setAttributes: async (attributes: Record<string, string>) => {
    await crashlytics().setAttributes(attributes);
  },

  /**
   * Log a message (will appear in crash reports)
   */
  log: (message: string) => {
    crashlytics().log(message);
  },

  /**
   * Record a non-fatal error
   */
  recordError: (error: Error, context?: Record<string, string>) => {
    if (context) {
      crashlytics().setAttributes(context);
    }
    crashlytics().recordError(error);
  },

  /**
   * Force a crash (for testing)
   */
  crash: () => {
    crashlytics().crash();
  },
};
```

### Performance Monitoring

```typescript
// src/services/analytics/performanceService.ts
import perf from '@react-native-firebase/perf';

export const performanceService = {
  /**
   * Start a custom trace
   */
  startTrace: async (traceName: string) => {
    const trace = await perf().startTrace(traceName);
    return trace;
  },

  /**
   * Measure async operation
   */
  measureAsync: async <T>(
    traceName: string,
    operation: () => Promise<T>,
    attributes?: Record<string, string>
  ): Promise<T> => {
    const trace = await perf().startTrace(traceName);
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        trace.putAttribute(key, value);
      });
    }

    try {
      const result = await operation();
      trace.putMetric('success', 1);
      return result;
    } catch (error) {
      trace.putMetric('success', 0);
      throw error;
    } finally {
      await trace.stop();
    }
  },

  /**
   * Create HTTP metric
   */
  newHttpMetric: (url: string, method: string) => {
    return perf().newHttpMetric(url, method as any);
  },
};
```

### Navigation Analytics Hook

```typescript
// src/hooks/useAnalyticsScreen.ts
import { useEffect, useRef } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { analyticsService } from '@services/analytics';

export const useAnalyticsScreen = (screenName?: string) => {
  const isFocused = useIsFocused();
  const route = useRoute();
  const hasLogged = useRef(false);

  const name = screenName || route.name;

  useEffect(() => {
    if (isFocused && !hasLogged.current) {
      analyticsService.logScreenView(name);
      hasLogged.current = true;
    }

    if (!isFocused) {
      hasLogged.current = false;
    }
  }, [isFocused, name]);
};
```

### Usage Example

```typescript
// In App.tsx
import { analyticsService, crashReportingService } from '@services/analytics';

useEffect(() => {
  analyticsService.initialize();
  crashReportingService.initialize();
}, []);

// In a screen
const GarageDetailScreen: React.FC = () => {
  useAnalyticsScreen('GarageDetail');

  const handleStartSession = () => {
    analyticsService.events.sessionStart(garage.id, garage.name);
    // ... start session logic
  };

  return (/* ... */);
};

// Error handling
try {
  await paymentService.charge(amount);
  analyticsService.events.paymentSuccess(amount, 'card');
} catch (error) {
  analyticsService.events.paymentFailed(amount, 'card', error.message);
  crashReportingService.recordError(error, { screen: 'Payment' });
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/analytics/analyticsService.ts` | Analytics tracking |
| `src/services/analytics/crashReportingService.ts` | Crash reporting |
| `src/services/analytics/performanceService.ts` | Performance monitoring |
| `src/hooks/useAnalyticsScreen.ts` | Screen tracking hook |
| `ios/GoogleService-Info.plist` | Firebase iOS config |
| `android/app/google-services.json` | Firebase Android config |

## Testing Checklist

- [ ] Analytics events fire correctly
- [ ] Screen views tracked
- [ ] User ID set after login
- [ ] Crashes reported to Firebase
- [ ] Non-fatal errors logged
- [ ] Performance traces work
- [ ] Debug mode disabled in production

## Related Tasks

- **Previous**: [TASK-001](task-001.md)
- **Next**: [TASK-051](task-051.md)
