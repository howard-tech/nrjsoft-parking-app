# TASK-013: Garage Detail Bottom Sheet

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-013 |
| **Module** | Home / Smart Map |
| **Priority** | High |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-011, TASK-012 |
| **Status** | 🔴 Not Started |

## Description

Implement the draggable bottom sheet that displays detailed garage information when a user selects a parking location from the map.

## Context from Technical Proposal (Pages 6-8)

### Information Displayed:
- Garage name and address
- Entry method badge (ANPR or QR required)
- Remaining slots count
- Hourly rate and max duration
- EV chargers available
- Security features (ANPR + patrols)
- Policy information
- Overstay penalty

### Action Buttons:
- **Navigate**: Opens external maps app
- **Start Session** (ANPR): Opens session screen
- **Scan QR** (QR-enabled): Opens QR scanner

## Acceptance Criteria

- [ ] Bottom sheet with snap points (45%, 80%)
- [ ] Drag to expand/collapse
- [ ] Pull down to close
- [ ] All garage details displayed
- [ ] Entry method badge styling
- [ ] Navigate button opens maps
- [ ] Start Session / Scan QR buttons
- [ ] Loading state while fetching details
- [ ] Error handling for failed fetch

## Technical Implementation

### 1. Bottom Sheet Component

```typescript
// src/screens/home/components/GarageBottomSheet.tsx
import React, { useCallback, useMemo, useRef, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { Garage, GarageDetail } from '@types';
import { useGarageDetail } from '@hooks/useGarageDetail';

// Components
import { Button } from '@components/common/Button';
import { InfoRow } from './InfoRow';
import { EntryMethodBadge } from './EntryMethodBadge';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

// Icons
import { ParkingIcon, ZapIcon, ShieldIcon, FileIcon, AlertIcon, NavigationIcon } from '@components/icons';

interface GarageBottomSheetProps {
  garage: Garage | null;
  onClose: () => void;
}

export const GarageBottomSheet = forwardRef<BottomSheet, GarageBottomSheetProps>(
  ({ garage, onClose }, ref) => {
    const navigation = useNavigation();
    const theme = useTheme();
    const snapPoints = useMemo(() => ['45%', '80%'], []);
    
    // Fetch detailed garage info
    const { detail, isLoading, error } = useGarageDetail(garage?.id);
    
    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        onClose();
      }
    }, [onClose]);

    const handleNavigate = useCallback(() => {
      if (!garage) return;
      
      const scheme = Platform.select({
        ios: 'maps:',
        android: 'geo:',
      });
      
      const url = Platform.select({
        ios: `maps:?daddr=${garage.latitude},${garage.longitude}&dirflg=d`,
        android: `geo:0,0?q=${garage.latitude},${garage.longitude}(${encodeURIComponent(garage.name)})`,
      });
      
      if (url) {
        Linking.canOpenURL(url).then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            // Fallback to Google Maps web
            Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${garage.latitude},${garage.longitude}`
            );
          }
        });
      }
    }, [garage]);

    const handleStartSession = useCallback(() => {
      if (!garage) return;
      
      if (garage.entryMethod === 'QR') {
        navigation.navigate('QRScannerModal', { 
          garageId: garage.id,
          garageName: garage.name,
        });
      } else {
        // ANPR - just navigate to session tab
        // Actual session will start when ANPR detects vehicle
        navigation.navigate('SessionTab', {
          screen: 'SessionPending',
          params: { garageId: garage.id },
        });
      }
      onClose();
    }, [garage, navigation, onClose]);

    if (!garage) return null;

    const isQREntry = garage.entryMethod === 'QR';

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={{ 
          backgroundColor: theme.colors.neutral.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{ 
          backgroundColor: theme.colors.neutral.border,
          width: 40,
        }}
      >
        <BottomSheetScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <Text style={[styles.name, { color: theme.colors.neutral.textPrimary }]}>
                    {garage.name}
                  </Text>
                  <Text style={[styles.address, { color: theme.colors.neutral.textSecondary }]}>
                    {garage.address}
                  </Text>
                </View>
                
                {isQREntry && (
                  <EntryMethodBadge 
                    type="QR" 
                    label="REQUIRES QR SCAN AT ENTRY" 
                  />
                )}
              </View>

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <InfoRow
                  icon={<ParkingIcon color={theme.colors.neutral.textSecondary} />}
                  label="Remaining slots"
                  value={`${detail?.availableSlots ?? garage.availableSlots} open bays`}
                  valueColor={getAvailabilityColor(detail?.availableSlots ?? 0, theme)}
                />
                
                <InfoRow
                  icon={<ZapIcon color={theme.colors.warning.main} />}
                  label="EV charging"
                  value={`${detail?.evChargers ?? 0} fast chargers`}
                />
                
                <InfoRow
                  icon={<ShieldIcon color={theme.colors.neutral.textSecondary} />}
                  label="Security"
                  value={detail?.securityFeatures?.join(' + ') || 'Standard'}
                />
                
                <InfoRow
                  icon={<FileIcon color={theme.colors.neutral.textSecondary} />}
                  label="Policy"
                  value={detail?.policy || 'Standard parking rules'}
                />
                
                <InfoRow
                  icon={<AlertIcon color={theme.colors.warning.main} />}
                  label="Overstay penalty"
                  value={detail?.overstayPenalty || 'N/A'}
                />
              </View>

              {/* Rate Section */}
              <View style={styles.rateSection}>
                <Text style={[styles.rateLabel, { color: theme.colors.neutral.textSecondary }]}>
                  RATE
                </Text>
                <Text style={[styles.rate, { color: theme.colors.neutral.textPrimary }]}>
                  EUR {detail?.hourlyRate ?? garage.hourlyRate}/hr
                </Text>
                <Text style={[styles.maxTime, { color: theme.colors.neutral.textSecondary }]}>
                  Max {detail?.maxDuration || '4h'}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <Button
                  title="Navigate"
                  variant="secondary"
                  onPress={handleNavigate}
                  style={styles.actionButton}
                  leftIcon={<NavigationIcon color={theme.colors.primary.main} size={18} />}
                />
                <Button
                  title={isQREntry ? 'Scan QR' : 'Start Session'}
                  variant="primary"
                  onPress={handleStartSession}
                  style={styles.actionButton}
                />
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

const getAvailabilityColor = (slots: number, theme: any) => {
  if (slots === 0) return theme.colors.error.main;
  if (slots < 10) return theme.colors.warning.main;
  return theme.colors.success.main;
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
  },
  infoGrid: {
    marginBottom: 24,
  },
  rateSection: {
    marginBottom: 24,
  },
  rateLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  rate: {
    fontSize: 32,
    fontWeight: '700',
  },
  maxTime: {
    fontSize: 14,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
```

### 2. Info Row Component

```typescript
// src/screens/home/components/InfoRow.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  valueColor,
}) => {
  const theme = useTheme();
  
  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>
        {label}
      </Text>
      <Text style={[
        styles.value, 
        { color: valueColor || theme.colors.neutral.textPrimary }
      ]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E6ED',
  },
  iconContainer: {
    width: 24,
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});
```

### 3. Entry Method Badge

```typescript
// src/screens/home/components/EntryMethodBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface EntryMethodBadgeProps {
  type: 'ANPR' | 'QR';
  label: string;
}

export const EntryMethodBadge: React.FC<EntryMethodBadgeProps> = ({ type, label }) => {
  const theme = useTheme();
  
  const backgroundColor = type === 'QR' 
    ? theme.colors.secondary.main 
    : theme.colors.primary.light;
  
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/home/components/GarageBottomSheet.tsx` | Main bottom sheet |
| `src/screens/home/components/InfoRow.tsx` | Info row component |
| `src/screens/home/components/EntryMethodBadge.tsx` | Entry method badge |
| `src/hooks/useGarageDetail.ts` | Fetch garage details |

## Dependencies

```bash
npm install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
```

## Testing Checklist

- [ ] Bottom sheet opens on garage selection
- [ ] Snap points work correctly
- [ ] Pull down closes sheet
- [ ] All info displays correctly
- [ ] Navigate opens external maps
- [ ] Start Session navigates correctly
- [ ] Scan QR opens scanner modal
- [ ] Loading state shows spinner
- [ ] Error state handled gracefully

## Related Tasks

- **Previous**: [TASK-012](task-012.md) - Garage Markers
- **Next**: [TASK-014](task-014.md) - Search & Filters
