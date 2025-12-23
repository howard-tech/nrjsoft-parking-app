# TASK-041: App Icon, Splash Screen & Assets

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-041 |
| **Module** | Core |
| **Priority** | Medium |
| **Estimated Effort** | 4 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🔴 Not Started |

## Description

Set up app icons for all required sizes, splash screen with NRJ Soft branding, and organize asset structure for fonts and images.

## Acceptance Criteria

- [ ] App icons for iOS (all sizes)
- [ ] App icons for Android (all densities)
- [ ] Splash screen with NRJ logo
- [ ] Splash screen animation (optional)
- [ ] Custom fonts installed
- [ ] Asset organization structure

## Technical Implementation

### iOS App Icons

Required sizes for iOS:
```
ios/NRJSoftParking/Images.xcassets/AppIcon.appiconset/
├── Icon-20@2x.png      (40x40)
├── Icon-20@3x.png      (60x60)
├── Icon-29@2x.png      (58x58)
├── Icon-29@3x.png      (87x87)
├── Icon-40@2x.png      (80x80)
├── Icon-40@3x.png      (120x120)
├── Icon-60@2x.png      (120x120)
├── Icon-60@3x.png      (180x180)
├── Icon-76.png         (76x76)
├── Icon-76@2x.png      (152x152)
├── Icon-83.5@2x.png    (167x167)
└── Icon-1024.png       (1024x1024) - App Store
```

### Android App Icons

Required densities:
```
android/app/src/main/res/
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   └── ic_launcher_round.png
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   └── ic_launcher_round.png
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   └── ic_launcher_round.png
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   └── ic_launcher_round.png
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    └── ic_launcher_round.png
```

### Splash Screen Setup

```bash
npm install react-native-bootsplash
```

Generate splash screen assets:
```bash
npx react-native generate-bootsplash assets/images/logo.png \
  --background-color=FFFFFF \
  --logo-width=200 \
  --assets-path=assets \
  --flavor=main
```

### Hide Splash in App

```typescript
// App.tsx
import React, { useEffect } from 'react';
import RNBootSplash from 'react-native-bootsplash';

export const App: React.FC = () => {
  useEffect(() => {
    const init = async () => {
      // Load initial data
      await loadInitialData();
      // Hide splash
      await RNBootSplash.hide({ fade: true, duration: 300 });
    };
    init();
  }, []);

  return <AppNavigator />;
};
```

### Custom Fonts Setup

```typescript
// react-native.config.js
module.exports = {
  assets: ['./assets/fonts/'],
};
```

Link fonts:
```bash
npx react-native-asset
```

## Files to Create

| File | Purpose |
|------|---------|
| `assets/images/logo.png` | App logo (1024x1024) |
| `assets/fonts/*.ttf` | Custom fonts |
| iOS icon assets | All required sizes |
| Android icon assets | All densities |

## Dependencies

```bash
npm install react-native-bootsplash
```

## Testing Checklist

- [ ] App icon displays correctly on iOS
- [ ] App icon displays correctly on Android
- [ ] Splash screen shows on cold start
- [ ] Splash hides after app loads
- [ ] Custom fonts render correctly

## Related Tasks

- **Previous**: [TASK-001](task-001.md)
- **Next**: [TASK-042](task-042.md)
