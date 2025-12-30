# TASK-012: Parking Garage Pins & Map Markers

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-012 |
| **Module** | Home / Smart Map |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-011 |
| **Status** | 🟢 Completed |

## Description

Implement custom map markers for parking garages and on-street zones with status indicators, clustering for dense areas, and animated selection states.

## Context from Technical Proposal

- Pins represent nearby garages with live status indicators
- Each pin displays approximate walking/driving distance
- Color coding: Green (available), Orange (limited), Red (full)
- Selected pin state with animation

## Acceptance Criteria

- [x] Custom marker design matching mockups
- [x] Status color indicators (green/orange/red)
- [x] Distance label on markers
- [x] Selected/unselected marker states
- [x] Marker clustering for zoomed out view
- [x] On-street zone markers (different style)
- [x] Smooth animation on selection
- [x] Performance optimization for many markers (grid clustering with tracksViewChanges=false)

## Technical Implementation

### 1. Garage Marker Component

```typescript
// src/screens/home/components/GarageMarker.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '@theme';
import { Garage } from '@types';

interface GarageMarkerProps {
  garage: Garage;
  isSelected: boolean;
  onPress: () => void;
}

export const GarageMarker: React.FC<GarageMarkerProps> = memo(({
  garage,
  isSelected,
  onPress,
}) => {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.2 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);
  
  const getStatusColor = (): string => {
    const { availableSlots, totalSlots } = garage;
    const occupancyRate = (totalSlots - availableSlots) / totalSlots;
    
    if (availableSlots === 0) return theme.colors.map.full; // Red
    if (occupancyRate > 0.8) return theme.colors.map.limited; // Orange
    return theme.colors.map.available; // Green
  };
  
  const getEntryIcon = () => {
    return garage.entryMethod === 'QR' ? '📱' : '🚗';
  };

  return (
    <Marker
      coordinate={{
        latitude: garage.latitude,
        longitude: garage.longitude,
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <Animated.View 
        style={[
          styles.markerContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={[
          styles.marker,
          isSelected && styles.markerSelected,
          { 
            backgroundColor: isSelected 
              ? theme.colors.primary.main 
              : theme.colors.neutral.surface,
            borderColor: isSelected
              ? theme.colors.primary.main
              : theme.colors.neutral.border,
          }
        ]}>
          {/* Status Indicator */}
          <View style={[
            styles.statusDot, 
            { backgroundColor: getStatusColor() }
          ]} />
          
          {/* Distance Label */}
          <Text style={[
            styles.distance,
            { 
              color: isSelected 
                ? theme.colors.primary.contrast 
                : theme.colors.neutral.textPrimary 
            }
          ]}>
            {garage.distance}
          </Text>
        </View>
        
        {/* Pointer Triangle */}
        <View style={[
          styles.pointer,
          { 
            borderTopColor: isSelected 
              ? theme.colors.primary.main 
              : theme.colors.neutral.surface 
          }
        ]} />
      </Animated.View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerSelected: {
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  distance: {
    fontSize: 13,
    fontWeight: '600',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
```

### 2. On-Street Zone Marker

```typescript
// src/screens/home/components/OnStreetMarker.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '@theme';
import { OnStreetZone } from '@types';

interface OnStreetMarkerProps {
  zone: OnStreetZone;
  isSelected: boolean;
  onPress: () => void;
}

export const OnStreetMarker: React.FC<OnStreetMarkerProps> = memo(({
  zone,
  isSelected,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Marker
      coordinate={{
        latitude: zone.latitude,
        longitude: zone.longitude,
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[
        styles.marker,
        isSelected && styles.markerSelected,
        { backgroundColor: theme.colors.secondary.main }
      ]}>
        <Text style={styles.icon}>🅿️</Text>
        <Text style={styles.zoneName} numberOfLines={1}>
          {zone.name}
        </Text>
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 120,
  },
  markerSelected: {
    transform: [{ scale: 1.1 }],
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  zoneName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
```

### 3. Marker Clustering

```typescript
// src/screens/home/components/ClusteredMarkers.tsx
import React, { useMemo } from 'react';
import { Marker } from 'react-native-maps';
import Supercluster from 'supercluster';
import { Garage } from '@types';

interface ClusteredMarkersProps {
  garages: Garage[];
  region: Region;
  onGaragePress: (garage: Garage) => void;
  onClusterPress: (cluster: any) => void;
}

export const ClusteredMarkers: React.FC<ClusteredMarkersProps> = ({
  garages,
  region,
  onGaragePress,
  onClusterPress,
}) => {
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 40,
      maxZoom: 16,
    });
    
    const points = garages.map((garage) => ({
      type: 'Feature' as const,
      properties: { garage },
      geometry: {
        type: 'Point' as const,
        coordinates: [garage.longitude, garage.latitude],
      },
    }));
    
    cluster.load(points);
    return cluster;
  }, [garages]);
  
  const clusters = useMemo(() => {
    const bbox = getBoundingBox(region);
    const zoom = getZoomLevel(region);
    return supercluster.getClusters(bbox, zoom);
  }, [supercluster, region]);
  
  return (
    <>
      {clusters.map((cluster, index) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        
        if (cluster.properties.cluster) {
          return (
            <ClusterMarker
              key={`cluster-${index}`}
              coordinate={{ latitude, longitude }}
              pointCount={cluster.properties.point_count}
              onPress={() => onClusterPress(cluster)}
            />
          );
        }
        
        return (
          <GarageMarker
            key={cluster.properties.garage.id}
            garage={cluster.properties.garage}
            isSelected={false}
            onPress={() => onGaragePress(cluster.properties.garage)}
          />
        );
      })}
    </>
  );
};

// Cluster marker component
const ClusterMarker = ({ coordinate, pointCount, onPress }) => (
  <Marker coordinate={coordinate} onPress={onPress}>
    <View style={clusterStyles.cluster}>
      <Text style={clusterStyles.count}>{pointCount}</Text>
    </View>
  </Marker>
);
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/home/components/GarageMarker.tsx` | Garage pin component |
| `src/screens/home/components/OnStreetMarker.tsx` | On-street zone marker |
| `src/screens/home/components/ClusterMarker.tsx` | Cluster indicator |
| `src/screens/home/components/ClusteredMarkers.tsx` | Clustering logic |
| `src/utils/mapUtils.ts` | Map calculation helpers |

## Testing Checklist

- [ ] Markers render at correct coordinates
- [ ] Status colors match availability
- [ ] Selected state animates smoothly
- [ ] Clustering works when zoomed out
- [ ] Tap on cluster zooms in
- [ ] On-street markers distinguish from garages
- [ ] Performance OK with 50+ markers

## Related Tasks

- **Previous**: [TASK-011](task-011.md) - Smart Map Screen
- **Next**: [TASK-013](task-013.md) - Garage Detail Bottom Sheet
