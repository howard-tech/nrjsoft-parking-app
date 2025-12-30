# TASK-011: Smart Map Home Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-011 |
| **Module** | Home / Smart Map |
| **Priority** | Critical |
| **Estimated Effort** | 12 hours |
| **Dependencies** | TASK-010, TASK-003, TASK-007 |
| **Status** | 🟡 In Progress |

## Description

Implement the Smart Map home screen - the main landing screen that provides users with instant location awareness and shows nearby parking garages with real-time availability, distance, and pricing.

## Context from Technical Proposal (Pages 6-8)

### Key Features:
1. **Real-Time User Location**: GPS dot showing user's current position, dynamically updating
2. **Parking Garage Pins**: Pins on map representing nearby garages with live status indicators
3. **Parking Cards Carousel**: Horizontal list of nearby garages with quick-glance info
4. **Garage Detail Bottom Sheet**: Draggable sheet with detailed garage information
5. **Action Buttons**: Contextual buttons (Start Session for ANPR, Scan QR for QR-enabled)
6. **Search Bar**: Search for streets, destinations, or specific garages

### UI Elements from Mockup:
- Header: "NRJSOFT Mobility OS" with notification bell
- Full-screen map with user location dot
- Garage pins with distance labels (e.g., "1.8 km")
- Horizontal scroll of garage cards at bottom
- Bottom sheet showing: name, address, remaining slots, rate, EV chargers, security, policies
- "Navigate" and "Start Session" / "Scan QR" buttons

## Acceptance Criteria

- [x] Full-screen Google Map displays
- [x] User location shown with GPS dot
- [x] Nearby garages fetched and displayed as pins
- [x] Pins show availability status (green/orange/red)
- [x] Parking cards carousel at bottom
- [ ] Tapping pin/card shows garage detail bottom sheet
- [ ] Navigate button opens external maps app
- [ ] Start Session / Scan QR buttons functional
- [ ] Search bar with autocomplete
- [ ] Pull-to-refresh for garage data
- [x] Loading and error states

## Progress Notes

- Map view shows user location, nearby garage pins (colored by status), and a horizontal carousel with cards linked to marker selection plus manual refresh/recenter controls.
- Bottom sheet actions, external navigation, and search/filter flows remain open for follow-up tasks (TASK-012/013/014).

## Technical Implementation

### 1. Smart Map Screen

```typescript
// src/screens/home/SmartMapScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';

// Components
import { AppHeader } from '@components/common/AppHeader';
import { SearchBar } from './components/SearchBar';
import { GarageMarker } from './components/GarageMarker';
import { ParkingCarousel } from './components/ParkingCarousel';
import { GarageBottomSheet } from './components/GarageBottomSheet';
import { LoadingOverlay } from '@components/common/LoadingOverlay';

// Hooks & Services
import { useLocation } from '@hooks/useLocation';
import { useNearbyGarages } from '@hooks/useNearbyGarages';

// Types
import { Garage } from '@types';

const INITIAL_REGION = {
  latitude: 43.8356,  // Ruse, Bulgaria (from mockup)
  longitude: 25.9657,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const SmartMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  
  // Location hook
  const { location, error: locationError, requestPermission } = useLocation();
  
  // State
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  
  // Fetch nearby garages
  const { 
    garages, 
    isLoading, 
    error, 
    refetch 
  } = useNearbyGarages(
    location?.latitude ?? region.latitude,
    location?.longitude ?? region.longitude
  );

  // Update region when user location changes
  useEffect(() => {
    if (location) {
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  }, [location]);

  const handleMarkerPress = useCallback((garage: Garage) => {
    setSelectedGarage(garage);
    setBottomSheetVisible(true);
    
    // Center map on selected garage
    mapRef.current?.animateToRegion({
      latitude: garage.latitude,
      longitude: garage.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  }, []);

  const handleCardPress = useCallback((garage: Garage) => {
    handleMarkerPress(garage);
  }, [handleMarkerPress]);

  const handleNavigate = useCallback((garage: Garage) => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `maps:?daddr=${garage.latitude},${garage.longitude}`,
      android: `geo:0,0?q=${garage.latitude},${garage.longitude}(${encodeURIComponent(garage.name)})`,
    });
    
    if (url) {
      Linking.openURL(url);
    }
  }, []);

  const handleStartSession = useCallback((garage: Garage) => {
    if (garage.entryMethod === 'QR') {
      navigation.navigate('QRScannerModal', { garageId: garage.id });
    } else {
      // ANPR - navigate to session screen
      navigation.navigate('SessionTab', { 
        screen: 'ActiveSession',
        params: { garageId: garage.id }
      });
    }
    setBottomSheetVisible(false);
  }, [navigation]);

  const handleSearch = useCallback((query: string) => {
    navigation.navigate('Search', { query });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <AppHeader title="Mobility OS" showNotificationBadge />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search garages, streets..."
          onSearch={handleSearch}
        />
      </View>
      
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        region={region}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={setRegion}
      >
        {/* Garage Markers */}
        {garages.map((garage) => (
          <GarageMarker
            key={garage.id}
            garage={garage}
            isSelected={selectedGarage?.id === garage.id}
            onPress={() => handleMarkerPress(garage)}
          />
        ))}
      </MapView>
      
      {/* Parking Cards Carousel */}
      <ParkingCarousel
        garages={garages}
        selectedGarageId={selectedGarage?.id}
        onCardPress={handleCardPress}
      />
      
      {/* Garage Detail Bottom Sheet */}
      <GarageBottomSheet
        garage={selectedGarage}
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onNavigate={() => selectedGarage && handleNavigate(selectedGarage)}
        onStartSession={() => selectedGarage && handleStartSession(selectedGarage)}
      />
      
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  map: {
    flex: 1,
  },
});
```

### 2. Garage Marker Component

```typescript
// src/screens/home/components/GarageMarker.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '@theme';
import { Garage } from '@types';

interface GarageMarkerProps {
  garage: Garage;
  isSelected: boolean;
  onPress: () => void;
}

export const GarageMarker: React.FC<GarageMarkerProps> = ({
  garage,
  isSelected,
  onPress,
}) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    if (garage.availableSlots === 0) return theme.colors.map.full;
    if (garage.availableSlots < 10) return theme.colors.map.limited;
    return theme.colors.map.available;
  };

  return (
    <Marker
      coordinate={{
        latitude: garage.latitude,
        longitude: garage.longitude,
      }}
      onPress={onPress}
    >
      <View style={[
        styles.marker,
        isSelected && styles.markerSelected,
        { backgroundColor: isSelected ? theme.colors.primary.main : theme.colors.neutral.surface }
      ]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={[
          styles.distance,
          { color: isSelected ? theme.colors.primary.contrast : theme.colors.neutral.textPrimary }
        ]}>
          {garage.distance}
        </Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerSelected: {
    transform: [{ scale: 1.1 }],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  distance: {
    fontSize: 12,
    fontWeight: '600',
  },
});
```

### 3. Parking Cards Carousel

```typescript
// src/screens/home/components/ParkingCarousel.tsx
import React, { useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Garage } from '@types';
import { ParkingCard } from './ParkingCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.35;
const CARD_SPACING = 12;

interface ParkingCarouselProps {
  garages: Garage[];
  selectedGarageId?: string;
  onCardPress: (garage: Garage) => void;
}

export const ParkingCarousel: React.FC<ParkingCarouselProps> = ({
  garages,
  selectedGarageId,
  onCardPress,
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Scroll to selected garage
  useEffect(() => {
    if (selectedGarageId) {
      const index = garages.findIndex(g => g.id === selectedGarageId);
      if (index >= 0) {
        flatListRef.current?.scrollToIndex({ 
          index, 
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  }, [selectedGarageId, garages]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={garages}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParkingCard
            garage={item}
            isSelected={item.id === selectedGarageId}
            onPress={() => onCardPress(item)}
            style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}
          />
        )}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + CARD_SPACING,
          offset: (CARD_WIDTH + CARD_SPACING) * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  content: {
    paddingHorizontal: 16,
  },
});
```

### 4. Parking Card

```typescript
// src/screens/home/components/ParkingCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@theme';
import { Garage } from '@types';

interface ParkingCardProps {
  garage: Garage;
  isSelected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({
  garage,
  isSelected,
  onPress,
  style,
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: isSelected 
            ? theme.colors.primary.main 
            : theme.colors.neutral.surface,
          borderColor: isSelected 
            ? theme.colors.primary.main 
            : theme.colors.neutral.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text 
        style={[
          styles.name,
          { color: isSelected ? theme.colors.primary.contrast : theme.colors.neutral.textPrimary }
        ]}
        numberOfLines={1}
      >
        {garage.name}
      </Text>
      <Text 
        style={[
          styles.distance,
          { color: isSelected ? theme.colors.primary.contrast : theme.colors.neutral.textSecondary }
        ]}
      >
        {garage.distance}
      </Text>
      <View style={styles.badge}>
        <Text style={[styles.badgeText, { color: theme.colors.neutral.textSecondary }]}>
          {garage.type}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
```

### 5. Garage Bottom Sheet

```typescript
// src/screens/home/components/GarageBottomSheet.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTheme } from '@theme';
import { Garage } from '@types';
import { Button } from '@components/common/Button';

interface GarageBottomSheetProps {
  garage: Garage | null;
  visible: boolean;
  onClose: () => void;
  onNavigate: () => void;
  onStartSession: () => void;
}

export const GarageBottomSheet: React.FC<GarageBottomSheetProps> = ({
  garage,
  visible,
  onClose,
  onNavigate,
  onStartSession,
}) => {
  const theme = useTheme();
  const snapPoints = React.useMemo(() => ['45%', '80%'], []);

  if (!garage) return null;

  const isQREntry = garage.entryMethod === 'QR';

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.colors.neutral.surface }}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.name, { color: theme.colors.neutral.textPrimary }]}>
              {garage.name}
            </Text>
            <Text style={[styles.address, { color: theme.colors.neutral.textSecondary }]}>
              {garage.address}
            </Text>
          </View>
          {isQREntry && (
            <View style={[styles.entryBadge, { backgroundColor: theme.colors.secondary.main }]}>
              <Text style={styles.entryBadgeText}>REQUIRES QR SCAN AT ENTRY</Text>
            </View>
          )}
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <InfoRow 
            icon="parking" 
            label="Remaining slots" 
            value={`${garage.availableSlots} open bays`} 
            theme={theme}
          />
          <InfoRow 
            icon="zap" 
            label="EV charging" 
            value={`${garage.evChargers} fast chargers`} 
            theme={theme}
          />
          <InfoRow 
            icon="shield" 
            label="Security" 
            value={garage.securityFeatures.join(' + ')} 
            theme={theme}
          />
          <InfoRow 
            icon="file" 
            label="Policy" 
            value={garage.policy} 
            theme={theme}
          />
          <InfoRow 
            icon="alert" 
            label="Overstay penalty" 
            value={garage.overstayPenalty} 
            theme={theme}
          />
        </View>

        {/* Rate */}
        <View style={styles.rateSection}>
          <Text style={[styles.rateLabel, { color: theme.colors.neutral.textSecondary }]}>
            RATE
          </Text>
          <Text style={[styles.rate, { color: theme.colors.neutral.textPrimary }]}>
            EUR {garage.hourlyRate}/hr
          </Text>
          <Text style={[styles.maxTime, { color: theme.colors.neutral.textSecondary }]}>
            Max {garage.maxDuration}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Navigate"
            variant="secondary"
            onPress={onNavigate}
            style={styles.actionButton}
            icon="navigation"
          />
          <Button
            title={isQREntry ? 'Scan QR' : 'Start Session'}
            variant="primary"
            onPress={onStartSession}
            style={styles.actionButton}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const InfoRow = ({ icon, label, value, theme }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} size={16} color={theme.colors.neutral.textSecondary} />
    <Text style={[styles.infoLabel, { color: theme.colors.neutral.textSecondary }]}>
      {label}
    </Text>
    <Text style={[styles.infoValue, { color: theme.colors.neutral.textPrimary }]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
  },
  entryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  entryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  infoGrid: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  rateSection: {
    marginBottom: 20,
  },
  rateLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  rate: {
    fontSize: 28,
    fontWeight: '700',
  },
  maxTime: {
    fontSize: 14,
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

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/home/SmartMapScreen.tsx` | Main map screen |
| `src/screens/home/components/GarageMarker.tsx` | Custom map marker |
| `src/screens/home/components/ParkingCarousel.tsx` | Horizontal card list |
| `src/screens/home/components/ParkingCard.tsx` | Individual garage card |
| `src/screens/home/components/GarageBottomSheet.tsx` | Detail bottom sheet |
| `src/screens/home/components/SearchBar.tsx` | Search input |
| `src/hooks/useLocation.ts` | Location permission & tracking |
| `src/hooks/useNearbyGarages.ts` | Fetch nearby garages |

## Testing Checklist

- [ ] Map renders with Google Maps provider
- [ ] User location dot displays correctly
- [ ] Garage pins load from API
- [ ] Pin colors reflect availability
- [ ] Tapping pin opens bottom sheet
- [ ] Card carousel scrolls horizontally
- [ ] Tapping card selects garage
- [ ] Bottom sheet shows correct info
- [ ] Navigate opens external maps
- [ ] Start Session / Scan QR triggers correct action
- [ ] Search bar opens search screen
- [ ] Error handling for location permission
- [ ] Loading state while fetching garages

## Related Tasks

- **Previous**: [TASK-010](task-010.md) - Google Maps Integration
- **Next**: [TASK-012](task-012.md) - Parking Garage Pins & Carousel
- **Depends on**: [TASK-007](task-007.md) - API Client
