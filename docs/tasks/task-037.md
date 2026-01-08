# TASK-037: Performance Optimization

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-037 |
| **Module** | Core |
| **Priority** | Medium |
| **Estimated Effort** | 6 hours |
| **Dependencies** | All feature tasks |
| **Status** | 🟢 Completed |

## Description

Optimize app performance including map rendering, list virtualization, image caching, and memory management.

## Context from Technical Proposal (Page 28)

- Map & session performance optimization
- Loading states & micro-interactions

## Acceptance Criteria

- [ ] Map marker performance (50+ markers)
- [ ] List virtualization for long lists
- [ ] Image caching and lazy loading
- [ ] Memory leak prevention
- [ ] Bundle size optimization
- [ ] Startup time improvement
- [ ] Animation performance (60fps)

## Technical Implementation

### Map Performance

```typescript
// src/screens/home/hooks/useOptimizedMarkers.ts
import { useMemo, useCallback } from 'react';
import { Garage } from '@types';

export const useOptimizedMarkers = (garages: Garage[], region: Region) => {
  // Filter garages visible in current region
  const visibleGarages = useMemo(() => {
    return garages.filter((garage) => {
      const latDelta = region.latitudeDelta / 2;
      const lngDelta = region.longitudeDelta / 2;
      
      return (
        garage.latitude >= region.latitude - latDelta &&
        garage.latitude <= region.latitude + latDelta &&
        garage.longitude >= region.longitude - lngDelta &&
        garage.longitude <= region.longitude + lngDelta
      );
    });
  }, [garages, region]);

  // Cluster markers when zoomed out
  const shouldCluster = region.latitudeDelta > 0.1;

  return { visibleGarages, shouldCluster };
};
```

### Optimized FlatList

```typescript
// src/components/common/OptimizedList.tsx
import React, { useCallback } from 'react';
import { FlatList, FlatListProps } from 'react-native';

interface OptimizedListProps<T> extends FlatListProps<T> {}

export function OptimizedList<T>({ ...props }: OptimizedListProps<T>) {
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 80, // Item height
      offset: 80 * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      {...props}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      getItemLayout={props.getItemLayout || getItemLayout}
      keyExtractor={(item: any, index) => item.id || index.toString()}
    />
  );
}
```

### Image Caching

```typescript
// src/components/common/CachedImage.tsx
import React from 'react';
import FastImage, { FastImageProps } from 'react-native-fast-image';

interface CachedImageProps extends FastImageProps {
  priority?: 'low' | 'normal' | 'high';
}

export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  priority = 'normal',
  ...props
}) => {
  const priorityMap = {
    low: FastImage.priority.low,
    normal: FastImage.priority.normal,
    high: FastImage.priority.high,
  };

  return (
    <FastImage
      {...props}
      source={{
        ...(typeof source === 'object' ? source : {}),
        priority: priorityMap[priority],
        cache: FastImage.cacheControl.immutable,
      }}
    />
  );
};
```

### Memory Management

```typescript
// src/hooks/useCleanup.ts
import { useEffect, useRef } from 'react';

export const useCleanup = (cleanupFn: () => void) => {
  const cleanupRef = useRef(cleanupFn);
  cleanupRef.current = cleanupFn;

  useEffect(() => {
    return () => {
      cleanupRef.current();
    };
  }, []);
};

// Usage in components that create subscriptions
export const SomeComponent = () => {
  const subscription = useRef<Subscription | null>(null);

  useCleanup(() => {
    subscription.current?.unsubscribe();
  });

  // ...
};
```

### Bundle Size Optimization

```javascript
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Tree shaking for lodash
    'lodash',
    // Remove console logs in production
    ['transform-remove-console', { exclude: ['error', 'warn'] }],
  ],
};
```

### Hermes Engine Configuration

```gradle
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,
]
```

## Performance Metrics Targets

| Metric | Target |
|--------|--------|
| App startup (cold) | < 2s |
| App startup (warm) | < 1s |
| Map initial render | < 500ms |
| List scroll FPS | 60fps |
| Memory usage | < 150MB |
| Bundle size (iOS) | < 20MB |
| Bundle size (Android) | < 15MB |

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useOptimizedMarkers.ts` | Map marker optimization |
| `src/components/common/OptimizedList.tsx` | Virtualized list |
| `src/components/common/CachedImage.tsx` | Image caching |
| `src/hooks/useCleanup.ts` | Memory cleanup |

## Testing Checklist

- [ ] Map handles 50+ markers smoothly
- [ ] List scroll is 60fps
- [ ] Images load and cache correctly
- [ ] No memory leaks on navigation
- [ ] Bundle size within targets
- [ ] Startup time within targets

## Related Tasks

- **Previous**: [TASK-036](task-036.md)
- **Next**: [TASK-038](task-038.md)
