# TASK-006: Auth Service & Token Management

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-006 |
| **Module** | Authentication |
| **Priority** | Critical |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-005, TASK-007 |
| **Status** | 🟢 Completed |

## Description

Implement secure token storage, authentication state management, and token refresh logic for the application.

## Acceptance Criteria

- [ ] Secure token storage using react-native-keychain
- [ ] Auth state context provider
- [ ] Automatic token refresh before expiry
- [ ] Logout clears all tokens
- [ ] Social auth integration (Google/Apple)
- [ ] useAuth hook for components

## Technical Implementation

### Auth Service

```typescript
// src/services/auth/authService.ts
import * as Keychain from 'react-native-keychain';
import { apiClient } from '@services/api/client';

export const authService = {
  requestOTP: async ({ type, identifier }) => { /* ... */ },
  verifyOTP: async ({ type, identifier, otp }) => {
    const response = await apiClient.post('/auth/otp-verify', { type, identifier, otp });
    await tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },
  loginWithGoogle: async () => { /* Google Sign-In */ },
  loginWithApple: async () => { /* Apple Sign-In */ },
  logout: async () => {
    await tokenStorage.clearTokens();
  },
};
```

### Token Storage

```typescript
// src/services/auth/tokenStorage.ts
export const tokenStorage = {
  setTokens: async (access: string, refresh: string) => {
    await Keychain.setGenericPassword('tokens', JSON.stringify({ access, refresh }));
  },
  getAccessToken: async () => { /* ... */ },
  getRefreshToken: async () => { /* ... */ },
  clearTokens: async () => {
    await Keychain.resetGenericPassword();
  },
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/auth/authService.ts` | Auth operations |
| `src/services/auth/tokenStorage.ts` | Secure token storage |
| `src/store/authSlice.ts` | Auth state management |
| `src/hooks/useAuth.ts` | Auth hook |

## Related Tasks

- **Previous**: [TASK-005](task-005.md)
- **Next**: [TASK-030](task-030.md) - Account Screen
