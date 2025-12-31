# TASK-048: External Navigation Integration

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-048 |
| **Module** | Maps |
| **Priority** | Medium |
| **Estimated Effort** | 4 hours |
| **Dependencies** | TASK-013 |
| **Status** | 🟢 Completed |

## Description

Implement deep links to external navigation apps (Google Maps, Apple Maps, Waze) for directions to parking garages.

## Context from Technical Proposal (Page 7-8)

- "Navigate" button in garage detail bottom sheet
- External navigation deep links

## Acceptance Criteria

- [x] "Navigate" button on garage details
- [x] Support Google Maps navigation
- [x] Support Apple Maps navigation (iOS)
- [x] Support Waze navigation
- [x] App chooser dialog
- [x] Fallback to web browser

## Progress Notes

- Added `externalNavigationService` with app availability checks, chooser (ActionSheet iOS / Alert Android), and Google/Apple/Waze/Web fallbacks.
- Garage bottom sheet now uses `NavigateButton` to open chooser with destination label/address.

## Technical Implementation

### Navigation Service

```typescript
// src/services/navigation/externalNavigation.ts
import { Linking, Platform, Alert, ActionSheetIOS } from 'react-native';

export interface NavigationDestination {
  latitude: number;
  longitude: number;
  label?: string;
  address?: string;
}

export type NavigationApp = 'google' | 'apple' | 'waze' | 'default';

const buildGoogleMapsUrl = (dest: NavigationDestination): string => {
  const baseUrl = Platform.select({
    ios: 'comgooglemaps://',
    android: 'google.navigation:',
  });
  
  if (Platform.OS === 'ios') {
    return `${baseUrl}?daddr=${dest.latitude},${dest.longitude}&directionsmode=driving`;
  }
  return `${baseUrl}q=${dest.latitude},${dest.longitude}`;
};

const buildAppleMapsUrl = (dest: NavigationDestination): string => {
  const params = new URLSearchParams({
    daddr: `${dest.latitude},${dest.longitude}`,
    dirflg: 'd', // driving
  });
  if (dest.label) {
    params.append('t', dest.label);
  }
  return `maps://?${params.toString()}`;
};

const buildWazeUrl = (dest: NavigationDestination): string => {
  return `waze://?ll=${dest.latitude},${dest.longitude}&navigate=yes`;
};

const buildWebGoogleMapsUrl = (dest: NavigationDestination): string => {
  return `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`;
};

export const externalNavigationService = {
  /**
   * Check if a navigation app is installed
   */
  isAppInstalled: async (app: NavigationApp): Promise<boolean> => {
    const testUrls: Record<NavigationApp, string> = {
      google: Platform.OS === 'ios' ? 'comgooglemaps://' : 'google.navigation:',
      apple: 'maps://',
      waze: 'waze://',
      default: '',
    };

    if (app === 'default' || !testUrls[app]) return true;

    try {
      return await Linking.canOpenURL(testUrls[app]);
    } catch {
      return false;
    }
  },

  /**
   * Get list of available navigation apps
   */
  getAvailableApps: async (): Promise<NavigationApp[]> => {
    const apps: NavigationApp[] = [];

    if (await externalNavigationService.isAppInstalled('google')) {
      apps.push('google');
    }

    if (Platform.OS === 'ios' && await externalNavigationService.isAppInstalled('apple')) {
      apps.push('apple');
    }

    if (await externalNavigationService.isAppInstalled('waze')) {
      apps.push('waze');
    }

    // Always add default (web browser)
    apps.push('default');

    return apps;
  },

  /**
   * Navigate to destination using specified app
   */
  navigateTo: async (dest: NavigationDestination, app: NavigationApp): Promise<boolean> => {
    let url: string;

    switch (app) {
      case 'google':
        url = buildGoogleMapsUrl(dest);
        break;
      case 'apple':
        url = buildAppleMapsUrl(dest);
        break;
      case 'waze':
        url = buildWazeUrl(dest);
        break;
      case 'default':
      default:
        url = buildWebGoogleMapsUrl(dest);
        break;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        // Fallback to web
        await Linking.openURL(buildWebGoogleMapsUrl(dest));
        return true;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      return false;
    }
  },

  /**
   * Show app chooser and navigate
   */
  showNavigationOptions: async (dest: NavigationDestination): Promise<void> => {
    const availableApps = await externalNavigationService.getAvailableApps();

    const appLabels: Record<NavigationApp, string> = {
      google: 'Google Maps',
      apple: 'Apple Maps',
      waze: 'Waze',
      default: 'Open in Browser',
    };

    if (Platform.OS === 'ios') {
      const options = availableApps.map(app => appLabels[app]);
      options.push('Cancel');

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Open directions in...',
          options,
          cancelButtonIndex: options.length - 1,
        },
        async (buttonIndex) => {
          if (buttonIndex < availableApps.length) {
            await externalNavigationService.navigateTo(dest, availableApps[buttonIndex]);
          }
        }
      );
    } else {
      // Android - show Alert with options
      const buttons = availableApps.map(app => ({
        text: appLabels[app],
        onPress: () => externalNavigationService.navigateTo(dest, app),
      }));
      buttons.push({ text: 'Cancel', style: 'cancel' as const });

      Alert.alert('Open directions in...', undefined, buttons);
    }
  },
};
```

### Navigate Button Component

```typescript
// src/components/maps/NavigateButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@theme';
import { externalNavigationService, NavigationDestination } from '@services/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface NavigateButtonProps {
  destination: NavigationDestination;
  variant?: 'primary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const NavigateButton: React.FC<NavigateButtonProps> = ({
  destination,
  variant = 'outline',
  size = 'medium',
}) => {
  const theme = useTheme();

  const handlePress = () => {
    externalNavigationService.showNavigationOptions(destination);
  };

  const sizeStyles = {
    small: { paddingVertical: 6, paddingHorizontal: 12 },
    medium: { paddingVertical: 10, paddingHorizontal: 16 },
    large: { paddingVertical: 14, paddingHorizontal: 20 },
  };

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const textSize = {
    small: 12,
    medium: 14,
    large: 16,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyles[size],
        variant === 'primary' && { backgroundColor: theme.colors.primary.main },
        variant === 'outline' && {
          borderWidth: 1,
          borderColor: theme.colors.neutral.border,
          backgroundColor: 'transparent',
        },
      ]}
      onPress={handlePress}
      accessibilityLabel={`Navigate to ${destination.label || 'parking'}`}
      accessibilityRole="button"
    >
      <Icon
        name="navigation-variant"
        size={iconSize[size]}
        color={variant === 'primary' ? '#FFFFFF' : theme.colors.neutral.textPrimary}
      />
      <Text
        style={[
          styles.text,
          { fontSize: textSize[size] },
          { color: variant === 'primary' ? '#FFFFFF' : theme.colors.neutral.textPrimary },
        ]}
      >
        Navigate
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 6,
  },
  text: {
    fontWeight: '500',
  },
});
```

### Usage in Garage Detail

```typescript
// In GarageDetailBottomSheet.tsx
import { NavigateButton } from '@components/maps/NavigateButton';

// Inside component
<View style={styles.actions}>
  <NavigateButton
    destination={{
      latitude: garage.coordinates.lat,
      longitude: garage.coordinates.lng,
      label: garage.name,
      address: garage.address,
    }}
    variant="outline"
  />
  <TouchableOpacity
    style={[styles.startButton, { backgroundColor: theme.colors.primary.main }]}
    onPress={handleStartSession}
  >
    <Text style={styles.startButtonText}>Start session</Text>
  </TouchableOpacity>
</View>
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/navigation/externalNavigation.ts` | Navigation service |
| `src/components/maps/NavigateButton.tsx` | Button component |
| Update `src/screens/home/GarageDetailBottomSheet.tsx` | Add navigate button |

## Testing Checklist

- [ ] Navigate button appears on garage details
- [ ] App chooser shows available apps
- [ ] Google Maps opens correctly
- [ ] Apple Maps opens correctly (iOS)
- [ ] Waze opens correctly
- [ ] Web fallback works
- [ ] Correct destination coordinates passed

## Related Tasks

- **Previous**: [TASK-013](task-013.md)
- **Next**: [TASK-049](task-049.md)
