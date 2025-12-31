# TASK-016: Session Service & State Management

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-016 |
| **Module** | Parking Session |
| **Priority** | Critical |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-007, TASK-009 |
| **Status** | 🟢 Completed |

## Description

Implement the session service for managing parking sessions, including session state management, webhook handling for SESSION_START/SESSION_END events, and real-time session updates.

## Context from Technical Proposal (Page 21)

### Session Lifecycle:
1. User selects garage on Smart Map
2. ANPR camera detects car → Create parking session
3. Push SESSION_START to user device
4. App shows Active Session screen (timer + fee)
5. During session: Webhook /session/status (updated fee/time)
6. Car exit detected → Calculate final fee
7. SESSION_END + receipt info sent

## Acceptance Criteria

- [x] Session service with CRUD operations
- [x] Active session state management
- [x] SESSION_START webhook handling
- [x] SESSION_END webhook handling
- [x] Real-time session updates
- [x] Session extension support
- [x] Cost calculation logic
- [x] Session history storage

## Progress Notes

- Added session service (start via QR, extend, fetch active/detail/history) with cost calculator helper and Redux slice for active session + history.
- Implemented `useActiveSession` hook and webhook handler to process SESSION_START/END/UPDATE and navigate to session/history screens.
- Persisted session slice in Redux persist config; lint/tests passing.

## Technical Implementation

### 1. Session Service

```typescript
// src/services/session/sessionService.ts
import { apiClient } from '@services/api/client';
import { store } from '@store';
import { setActiveSession, updateSessionCost, clearSession } from '@store/slices/sessionSlice';
import { ParkingSession, SessionStatus } from '@types';

export const sessionService = {
  /**
   * Fetch active session for current user
   */
  getActiveSession: async (): Promise<ParkingSession | null> => {
    try {
      const response = await apiClient.get<{ data: ParkingSession | null }>('/sessions/active');
      const session = response.data.data;
      
      if (session) {
        store.dispatch(setActiveSession(session));
      }
      
      return session;
    } catch (error) {
      console.error('Failed to fetch active session:', error);
      return null;
    }
  },

  /**
   * Get session by ID
   */
  getSession: async (sessionId: string): Promise<ParkingSession> => {
    const response = await apiClient.get<{ data: ParkingSession }>(`/sessions/${sessionId}`);
    return response.data.data;
  },

  /**
   * Start session with QR code
   */
  startSessionWithQR: async (garageId: string, qrData: string): Promise<ParkingSession> => {
    const response = await apiClient.post<{ data: ParkingSession }>('/sessions/start-qr', {
      garageId,
      qrData,
    });
    
    const session = response.data.data;
    store.dispatch(setActiveSession(session));
    
    return session;
  },

  /**
   * Extend current session
   */
  extendSession: async (sessionId: string, additionalMinutes: number): Promise<ParkingSession> => {
    const response = await apiClient.post<{ data: ParkingSession }>(
      `/sessions/${sessionId}/extend`,
      { minutes: additionalMinutes }
    );
    
    const session = response.data.data;
    store.dispatch(setActiveSession(session));
    
    return session;
  },

  /**
   * Calculate current cost based on elapsed time
   */
  calculateCurrentCost: (session: ParkingSession): number => {
    const startTime = new Date(session.startTime).getTime();
    const now = Date.now();
    const elapsedHours = (now - startTime) / (1000 * 60 * 60);
    
    // Apply pricing rules
    const baseCost = elapsedHours * session.hourlyRate;
    
    // Apply minimum charge
    const minCost = session.minimumCharge || 0;
    
    // Apply maximum daily rate if applicable
    const maxCost = session.maxDailyRate || Infinity;
    
    return Math.min(Math.max(baseCost, minCost), maxCost);
  },

  /**
   * Handle SESSION_START webhook
   */
  handleSessionStart: (payload: SessionStartPayload) => {
    const session: ParkingSession = {
      id: payload.sessionId,
      garageId: payload.garageId,
      zoneName: payload.zoneName,
      address: payload.address,
      startTime: payload.startTime,
      status: 'active',
      hourlyRate: payload.hourlyRate,
      vehiclePlate: payload.vehiclePlate,
      entryMethod: payload.entryMethod,
      currentCost: 0,
    };
    
    store.dispatch(setActiveSession(session));
  },

  /**
   * Handle SESSION_END webhook
   */
  handleSessionEnd: (payload: SessionEndPayload) => {
    // Clear active session
    store.dispatch(clearSession());
    
    // Return receipt data for display
    return {
      sessionId: payload.sessionId,
      finalCost: payload.finalCost,
      duration: payload.duration,
      receiptUrl: payload.receiptUrl,
    };
  },

  /**
   * Handle session status update webhook
   */
  handleSessionUpdate: (payload: SessionUpdatePayload) => {
    store.dispatch(updateSessionCost(payload.currentCost));
  },

  /**
   * Get session history
   */
  getSessionHistory: async (page = 1, limit = 20): Promise<ParkingSession[]> => {
    const response = await apiClient.get<{ data: ParkingSession[] }>('/sessions/history', {
      params: { page, limit },
    });
    return response.data.data;
  },
};

// Types
interface SessionStartPayload {
  sessionId: string;
  garageId: string;
  zoneName: string;
  address: string;
  startTime: string;
  hourlyRate: number;
  vehiclePlate: string;
  entryMethod: 'ANPR' | 'QR';
}

interface SessionEndPayload {
  sessionId: string;
  finalCost: number;
  duration: number;
  receiptUrl: string;
}

interface SessionUpdatePayload {
  sessionId: string;
  currentCost: number;
  elapsedTime: number;
}
```

### 2. Session Hook

```typescript
// src/hooks/useActiveSession.ts
import { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { fetchActiveSession } from '@store/slices/sessionSlice';
import { sessionService } from '@services/session/sessionService';

export const useActiveSession = () => {
  const dispatch = useAppDispatch();
  const { activeSession, isLoading, error } = useAppSelector((state) => state.session);

  useEffect(() => {
    // Fetch active session on mount
    dispatch(fetchActiveSession());
  }, [dispatch]);

  // Refresh session data
  const refresh = useCallback(async () => {
    await sessionService.getActiveSession();
  }, []);

  // Extend session
  const extend = useCallback(async (minutes: number) => {
    if (activeSession) {
      return sessionService.extendSession(activeSession.id, minutes);
    }
  }, [activeSession]);

  // Calculate current cost
  const currentCost = activeSession
    ? sessionService.calculateCurrentCost(activeSession)
    : 0;

  return {
    session: activeSession,
    isLoading,
    error,
    currentCost,
    refresh,
    extend,
  };
};
```

### 3. Webhook Handler Integration

```typescript
// src/services/notifications/webhookHandler.ts
import { sessionService } from '@services/session/sessionService';
import { navigationRef } from '@navigation/RootNavigator';

export const handleWebhookMessage = (message: RemoteMessage) => {
  const { type, payload } = message.data as { type: string; payload: any };

  switch (type) {
    case 'SESSION_START':
      sessionService.handleSessionStart(JSON.parse(payload));
      // Navigate to active session screen
      navigationRef.current?.navigate('SessionTab', {
        screen: 'ActiveSession',
      });
      break;

    case 'SESSION_END':
      const receipt = sessionService.handleSessionEnd(JSON.parse(payload));
      // Navigate to receipt screen
      navigationRef.current?.navigate('SessionTab', {
        screen: 'SessionReceipt',
        params: receipt,
      });
      break;

    case 'SESSION_UPDATE':
      sessionService.handleSessionUpdate(JSON.parse(payload));
      break;

    default:
      console.log('Unknown webhook type:', type);
  }
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/session/sessionService.ts` | Session operations |
| `src/services/session/costCalculator.ts` | Cost calculation logic |
| `src/hooks/useActiveSession.ts` | Active session hook |
| `src/hooks/useSessionHistory.ts` | History hook |
| `src/services/notifications/webhookHandler.ts` | Webhook processing |

## Testing Checklist

- [ ] Active session fetches correctly
- [ ] SESSION_START creates session in state
- [ ] SESSION_END clears session
- [ ] Cost calculation is accurate
- [ ] Session extension works
- [ ] History fetches correctly
- [ ] Webhooks navigate to correct screens

## Related Tasks

- **Previous**: [TASK-015](task-015.md) - QR Scanner
- **Next**: [TASK-017](task-017.md) - Active Session Screen
