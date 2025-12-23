# TASK-010: Google Maps Integration & Setup

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-010 |
| **Module** | Maps |
| **Priority** | Critical |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🔴 Not Started |

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

## Related Tasks

- **Next**: [TASK-011](task-011.md) - Smart Map Home Screen
