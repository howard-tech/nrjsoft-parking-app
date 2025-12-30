# TASK-010: Google Maps Integration & Setup

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-010 |
| **Module** | Maps |
| **Priority** | Critical |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🟢 Completed |

## Description

Set up Google Maps SDK for React Native with proper API key configuration, location permissions, and custom styling.

## Acceptance Criteria

- [ ] react-native-maps installed and configured
- [ ] Google Maps API key configured for iOS/Android
- [ ] Location permission requests implemented
- [ ] Custom map styling matching NRJ Soft brand
- [ ] Map renders on both platforms

## Technical Implementation

### Installation

```bash
npm install react-native-maps
cd ios && pod install
```

### Android Configuration

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="${GOOGLE_MAPS_API_KEY}"/>
```

### iOS Configuration

```ruby
# ios/Podfile
pod 'GoogleMaps'
pod 'Google-Maps-iOS-Utils'
```

### Location Hook

```typescript
// src/hooks/useLocation.ts
export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const requestPermission = async () => {
    const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    // ... handle permission
  };
  
  return { location, error, requestPermission };
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useLocation.ts` | Location permission & tracking |
| `src/theme/mapStyle.ts` | Custom map styling |
| Android/iOS config files | API key setup |

## Runbook / Config Notes

- Android/iOS keys: set `GOOGLE_MAPS_API_KEY` in your shell/CI before `npm run android`/`npm run ios` (Gradle manifest placeholder + AppDelegate reads env). For iOS you can also supply `GMSServicesApiKey` in Info.plist via xcconfig/CI secret (do **not** commit real keys).
- Permissions: `NSLocationWhenInUseUsageDescription` (and Always) added; Android manifest includes fine/coarse location. Uses `react-native-permissions`, so ensure `cd ios && pod install` after install.
- Networking: cleartext enabled only for debug (emulator/localhost) via `network_security_config`; release builds remain HTTPS-only.
- CI: pass `GOOGLE_MAPS_API_KEY` env into Gradle/Xcode steps; build will fail if placeholder is missing.

## Related Tasks

- **Next**: [TASK-011](task-011.md) - Smart Map Home Screen
