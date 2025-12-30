# TASK-007: API Client & Service Layer Setup

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-007 |
| **Module** | Services |
| **Priority** | Critical |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🟢 Completed |

## Description

Set up the core API client infrastructure using Axios, including request/response interceptors, authentication token handling, error handling, and the service layer pattern for all backend integrations.

## Context from Technical Proposal

The app integrates with NRJsoft APIs for:
- Authentication (OTP request/verify)
- Parking data (garages, sessions)
- Payments (intents, confirmations)
- Wallet (balance, top-ups)
- On-street parking zones

## Acceptance Criteria

- [ ] Axios client configured with base URL from environment
- [ ] Request interceptor adds auth token to headers
- [ ] Response interceptor handles token refresh
- [ ] Error handling with typed error responses
- [ ] Service layer for each API domain
- [ ] TypeScript types for all API requests/responses
- [ ] Retry logic for failed requests
- [ ] Request/response logging in development

## Technical Implementation

### 1. API Client Configuration

```typescript
// src/services/api/client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Config from 'react-native-config';
import { tokenStorage } from '@services/auth/tokenStorage';

const BASE_URL = Config.API_BASE_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Development logging
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API] Response:`, response.status, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 - Token expired
    if (error.response?.status === 401 && originalRequest) {
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        await tokenStorage.clearTokens();
        // Emit logout event
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(handleApiError(error));
  }
);

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');
  
  const response = await axios.post(`${BASE_URL}/auth/refresh`, {
    refreshToken,
  });
  
  const { accessToken } = response.data;
  await tokenStorage.setAccessToken(accessToken);
  return accessToken;
}
```

### 2. Error Handling

```typescript
// src/services/api/errors.ts
export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export class ApiException extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.message);
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }
}

export function handleApiError(error: AxiosError): ApiException {
  if (error.response) {
    const data = error.response.data as Record<string, unknown>;
    return new ApiException({
      code: (data.code as string) || 'UNKNOWN_ERROR',
      message: (data.message as string) || 'An unexpected error occurred',
      status: error.response.status,
      details: data.details as Record<string, unknown>,
    });
  }
  
  if (error.request) {
    return new ApiException({
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server',
      status: 0,
    });
  }
  
  return new ApiException({
    code: 'REQUEST_ERROR',
    message: error.message,
    status: 0,
  });
}
```

### 3. Service Layer Pattern

```typescript
// src/services/api/parkingService.ts
import { apiClient } from './client';
import { Garage, ParkingSession, SessionStatus } from '@types';

export interface NearbyGaragesParams {
  lat: number;
  lng: number;
  radius?: number;
}

export interface GarageDetail extends Garage {
  remainingSlots: number;
  evChargers: number;
  securityFeatures: string[];
  pricingRules: PricingRule[];
}

export const parkingService = {
  getNearbyGarages: async (params: NearbyGaragesParams): Promise<Garage[]> => {
    const response = await apiClient.get<{ data: Garage[] }>('/parking/nearby', {
      params,
    });
    return response.data.data;
  },

  getGarageDetail: async (garageId: string): Promise<GarageDetail> => {
    const response = await apiClient.get<{ data: GarageDetail }>(
      `/parking/${garageId}`
    );
    return response.data.data;
  },

  getActiveSession: async (): Promise<ParkingSession | null> => {
    const response = await apiClient.get<{ data: ParkingSession | null }>(
      '/sessions/active'
    );
    return response.data.data;
  },

  getSessionDetail: async (sessionId: string): Promise<ParkingSession> => {
    const response = await apiClient.get<{ data: ParkingSession }>(
      `/sessions/${sessionId}`
    );
    return response.data.data;
  },

  extendSession: async (sessionId: string, minutes: number): Promise<ParkingSession> => {
    const response = await apiClient.post<{ data: ParkingSession }>(
      `/sessions/${sessionId}/extend`,
      { minutes }
    );
    return response.data.data;
  },
};
```

### 4. Wallet Service

```typescript
// src/services/api/walletService.ts
import { apiClient } from './client';
import { Wallet, Transaction, TopUpIntent } from '@types';

export const walletService = {
  getWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get<{ data: Wallet }>('/wallet');
    return response.data.data;
  },

  getTransactions: async (page = 1, limit = 20): Promise<Transaction[]> => {
    const response = await apiClient.get<{ data: Transaction[] }>(
      '/wallet/transactions',
      { params: { page, limit } }
    );
    return response.data.data;
  },

  createTopUpIntent: async (amount: number): Promise<TopUpIntent> => {
    const response = await apiClient.post<{ data: TopUpIntent }>(
      '/wallet/topup-intent',
      { amount }
    );
    return response.data.data;
  },

  getTopUpStatus: async (intentId: string): Promise<{ status: string }> => {
    const response = await apiClient.get<{ data: { status: string } }>(
      '/wallet/topup-status',
      { params: { intentId } }
    );
    return response.data.data;
  },
};
```

### 5. Payment Service

```typescript
// src/services/api/paymentService.ts
import { apiClient } from './client';
import { PaymentMethod, PaymentIntent } from '@types';

export const paymentService = {
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<{ data: PaymentMethod[] }>(
      '/payment-methods'
    );
    return response.data.data;
  },

  createPaymentIntent: async (
    amount: number,
    currency: string,
    context?: { sessionId?: string; type?: string }
  ): Promise<PaymentIntent> => {
    const response = await apiClient.post<{ data: PaymentIntent }>(
      '/payments/intents',
      { amount, currency, ...context }
    );
    return response.data.data;
  },

  confirmPayment: async (paymentIntentId: string): Promise<void> => {
    await apiClient.post('/payments/confirm', { paymentIntentId });
  },

  cancelPayment: async (paymentIntentId: string): Promise<void> => {
    await apiClient.post('/payments/cancel', { paymentIntentId });
  },
};
```

### 6. On-Street Service

```typescript
// src/services/api/onStreetService.ts
import { apiClient } from './client';
import { OnStreetZone, OnStreetQuote, OnStreetSession } from '@types';

export const onStreetService = {
  getNearbyZones: async (lat: number, lng: number): Promise<OnStreetZone[]> => {
    const response = await apiClient.get<{ data: OnStreetZone[] }>(
      '/onstreet/zones',
      { params: { lat, lng } }
    );
    return response.data.data;
  },

  getZoneDetail: async (zoneId: string): Promise<OnStreetZone> => {
    const response = await apiClient.get<{ data: OnStreetZone }>(
      `/onstreet/zone-detail`,
      { params: { zoneId } }
    );
    return response.data.data;
  },

  getQuote: async (zoneId: string, duration: number): Promise<OnStreetQuote> => {
    const response = await apiClient.post<{ data: OnStreetQuote }>(
      '/onstreet/quote',
      { zoneId, duration }
    );
    return response.data.data;
  },

  startSession: async (
    zoneId: string,
    duration: number,
    paymentIntentId: string
  ): Promise<OnStreetSession> => {
    const response = await apiClient.post<{ data: OnStreetSession }>(
      '/onstreet/sessions',
      { zoneId, duration, paymentIntentId }
    );
    return response.data.data;
  },
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/api/client.ts` | Axios instance with interceptors |
| `src/services/api/errors.ts` | Error handling utilities |
| `src/services/api/authService.ts` | Auth API calls |
| `src/services/api/parkingService.ts` | Parking API calls |
| `src/services/api/walletService.ts` | Wallet API calls |
| `src/services/api/paymentService.ts` | Payment API calls |
| `src/services/api/onStreetService.ts` | On-street API calls |
| `src/services/api/index.ts` | Barrel export |
| `src/types/api.ts` | API response types |

## Testing Checklist

- [ ] API client makes requests with correct base URL
- [ ] Auth token is attached to requests
- [ ] Token refresh works on 401 responses
- [ ] Network errors are handled gracefully
- [ ] Error responses are parsed correctly
- [ ] All service methods return typed responses
- [ ] Development logging works

## Related Tasks

- **Previous**: [TASK-001](task-001.md) - Project Setup
- **Required by**: TASK-005, TASK-016, TASK-020, TASK-026
