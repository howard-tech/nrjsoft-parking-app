# TASK-035: Deep Linking & QR Code Handling

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-035 |
| **Module** | Core |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-003 |
| **Status** | 🔴 Not Started |

## Description

Implement deep linking to support QR code entry, app-to-app navigation, and universal links for seamless user transitions.

## Context from Technical Proposal (Page 2)

- QR codes support deep linking
- Seamlessly transition users into mobile experience
- Works whether app is installed or accessed via web

## Acceptance Criteria

- [ ] URL scheme configuration (nrjsoft://)
- [ ] Universal links setup (iOS/Android)
- [ ] QR code deep link handling
- [ ] Navigation from deep links
- [ ] Deferred deep linking (app not installed)
- [ ] Analytics tracking for deep links

## Technical Implementation

### Deep Link Configuration

```typescript
// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'nrjsoft://',
    'https://app.nrjsoft.com',
    'https://parking.nrjsoft.com',
  ],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: {
            screens: {
              SmartMap: 'map',
              GarageDetail: 'garage/:garageId',
            },
          },
          SessionTab: {
            screens: {
              ActiveSession: 'session/:sessionId',
              SessionReceipt: 'receipt/:sessionId',
            },
          },
          WalletTab: {
            screens: {
              TopUp: 'wallet/topup',
            },
          },
        },
      },
      QRScannerModal: 'scan/:garageId',
      OnStreetParking: 'onstreet/:zoneId',
      Auth: 'auth',
    },
  },
};
```

### Deep Link Handler

```typescript
// src/services/deepLink/deepLinkHandler.ts
import { Linking } from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { navigationRef } from '@navigation/RootNavigator';

export const deepLinkHandler = {
  initialize: () => {
    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        deepLinkHandler.handleUrl(url);
      }
    });

    // Handle URL when app is already open
    Linking.addEventListener('url', ({ url }) => {
      deepLinkHandler.handleUrl(url);
    });

    // Handle Firebase Dynamic Links
    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        if (link) {
          deepLinkHandler.handleUrl(link.url);
        }
      });

    dynamicLinks().onLink((link) => {
      deepLinkHandler.handleUrl(link.url);
    });
  },

  handleUrl: (url: string) => {
    console.log('Deep link received:', url);
    
    const parsed = deepLinkHandler.parseUrl(url);
    
    switch (parsed.route) {
      case 'garage':
        navigationRef.current?.navigate('HomeTab', {
          screen: 'GarageDetail',
          params: { garageId: parsed.params.garageId },
        });
        break;
        
      case 'scan':
        navigationRef.current?.navigate('QRScannerModal', {
          garageId: parsed.params.garageId,
        });
        break;
        
      case 'session':
        navigationRef.current?.navigate('SessionTab', {
          screen: 'ActiveSession',
          params: { sessionId: parsed.params.sessionId },
        });
        break;
        
      case 'onstreet':
        navigationRef.current?.navigate('OnStreetParking', {
          zoneId: parsed.params.zoneId,
        });
        break;
        
      default:
        console.log('Unknown deep link route:', parsed.route);
    }
  },

  parseUrl: (url: string): { route: string; params: Record<string, string> } => {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Extract route and params
    const route = pathParts[0] || '';
    const params: Record<string, string> = {};
    
    // Parse path params
    if (pathParts[1]) {
      params[`${route}Id`] = pathParts[1];
    }
    
    // Parse query params
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return { route, params };
  },

  createLink: (route: string, params: Record<string, string>): string => {
    const baseUrl = 'https://app.nrjsoft.com';
    const queryString = new URLSearchParams(params).toString();
    return `${baseUrl}/${route}${queryString ? `?${queryString}` : ''}`;
  },
};
```

### QR Code Deep Link Format

```typescript
// Expected QR code formats:
// nrjsoft://scan/GARAGE_ID
// nrjsoft://garage/GARAGE_ID
// https://app.nrjsoft.com/scan/GARAGE_ID?entry=qr

// src/utils/qrCodeParser.ts
export const parseQRCode = (data: string): QRCodeData | null => {
  try {
    // Check if it's a URL
    if (data.startsWith('http') || data.startsWith('nrjsoft://')) {
      const parsed = deepLinkHandler.parseUrl(data);
      return {
        type: 'deeplink',
        route: parsed.route,
        params: parsed.params,
      };
    }
    
    // Check if it's JSON data
    if (data.startsWith('{')) {
      const json = JSON.parse(data);
      return {
        type: 'json',
        garageId: json.garageId,
        entryToken: json.token,
      };
    }
    
    // Plain garage ID
    return {
      type: 'plain',
      garageId: data,
    };
  } catch {
    return null;
  }
};
```

### iOS Configuration

```xml
<!-- ios/App/Info.plist -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>nrjsoft</string>
    </array>
  </dict>
</array>

<!-- Universal Links -->
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:app.nrjsoft.com</string>
  <string>applinks:parking.nrjsoft.com</string>
</array>
```

### Android Configuration

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="nrjsoft" />
</intent-filter>

<!-- App Links -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="app.nrjsoft.com" />
</intent-filter>
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/navigation/linking.ts` | Link configuration |
| `src/services/deepLink/deepLinkHandler.ts` | URL handling |
| `src/utils/qrCodeParser.ts` | QR code parsing |
| iOS/Android config files | Platform setup |

## Testing Checklist

- [ ] URL scheme opens app
- [ ] Universal links work
- [ ] QR code deep links navigate correctly
- [ ] Handles app not running
- [ ] Handles app in background
- [ ] Deferred deep linking works

## Related Tasks

- **Previous**: [TASK-034](task-034.md)
- **Next**: [TASK-036](task-036.md)
