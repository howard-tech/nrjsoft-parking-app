# TASK-026: On-Street Parking Service

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-026 |
| **Module** | On-Street Parking |
| **Priority** | Critical |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-007 |
| **Status** | 🟢 Completed |

## Description

Implement the on-street parking service layer for zone management, pricing quotes, and pre-paid session creation.

## Context from Technical Proposal (Page 25)

### APIs:
- GET /onstreet/zones - Nearby zones by location
- GET /onstreet/zone-detail - Zone rules and pricing
- POST /onstreet/quote - Calculate price for duration
- POST /onstreet/sessions - Start pre-paid session

## Acceptance Criteria

- [ ] Fetch nearby on-street zones
- [ ] Get zone details and pricing
- [ ] Calculate price quotes
- [ ] Start on-street sessions
- [ ] Handle zone rules/restrictions

## Technical Implementation

### On-Street Service

```typescript
// src/services/api/onStreetService.ts
import { apiClient } from './client';
import { OnStreetZone, OnStreetQuote, OnStreetSession } from '@types';

export const onStreetService = {
  getNearbyZones: async (lat: number, lng: number): Promise<OnStreetZone[]> => {
    const response = await apiClient.get('/onstreet/zones', {
      params: { lat, lng },
    });
    return response.data.data;
  },

  getZoneDetail: async (zoneId: string): Promise<OnStreetZone> => {
    const response = await apiClient.get('/onstreet/zone-detail', {
      params: { zoneId },
    });
    return response.data.data;
  },

  getQuote: async (zoneId: string, durationMinutes: number): Promise<OnStreetQuote> => {
    const response = await apiClient.post('/onstreet/quote', {
      zoneId,
      duration: durationMinutes,
    });
    return response.data.data;
  },

  startSession: async (
    zoneId: string,
    durationMinutes: number,
    paymentIntentId: string,
    vehiclePlate: string
  ): Promise<OnStreetSession> => {
    const response = await apiClient.post('/onstreet/sessions', {
      zoneId,
      duration: durationMinutes,
      paymentIntentId,
      vehiclePlate,
    });
    return response.data.data;
  },

  extendSession: async (
    sessionId: string,
    additionalMinutes: number,
    paymentIntentId: string
  ): Promise<OnStreetSession> => {
    const response = await apiClient.post(`/onstreet/sessions/${sessionId}/extend`, {
      additionalMinutes,
      paymentIntentId,
    });
    return response.data.data;
  },

  stopSession: async (sessionId: string): Promise<void> => {
    await apiClient.post(`/onstreet/sessions/${sessionId}/stop`);
  },
};
```

### Types

```typescript
// src/types/onstreet.ts
export interface OnStreetZone {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  minDuration: number;
  maxDuration: number;
  durationOptions: number[];
  operatingHours: {
    start: string;
    end: string;
  };
  restrictions?: string[];
}

export interface OnStreetQuote {
  zoneId: string;
  duration: number;
  amount: number;
  currency: string;
  validUntil: string;
}

export interface OnStreetSession {
  id: string;
  zoneId: string;
  zoneName: string;
  startTime: string;
  endTime: string;
  duration: number;
  amount: number;
  status: 'active' | 'expired' | 'stopped';
  vehiclePlate: string;
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/api/onStreetService.ts` | API operations |
| `src/types/onstreet.ts` | TypeScript types |
| `src/hooks/useOnStreetZones.ts` | Zones hook |

## Testing Checklist

- [ ] Zones fetch by location
- [ ] Zone details load correctly
- [ ] Price quotes calculate
- [ ] Sessions start successfully
- [ ] Extend and stop work

## Related Tasks

- **Previous**: [TASK-007](task-007.md)
- **Next**: [TASK-027](task-027.md)
