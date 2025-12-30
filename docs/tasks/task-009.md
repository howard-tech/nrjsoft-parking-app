# TASK-009: State Management Setup (Redux Toolkit)

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-009 |
| **Module** | Core |
| **Priority** | High |
| **Estimated Effort** | 4 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🟢 Completed |

## Description

Set up Redux Toolkit for global state management including store configuration, slices for auth, session, wallet, and user data, and persistence configuration.

## Acceptance Criteria

- [ ] Redux store configured with TypeScript
- [ ] Auth slice with login state
- [ ] Session slice for active parking
- [ ] Wallet slice for balance
- [ ] User slice for profile data
- [ ] Redux Persist for offline support
- [ ] Typed hooks (useAppDispatch, useAppSelector)

## Technical Implementation

### 1. Store Configuration

```typescript
// src/store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';
import walletReducer from './slices/walletSlice';
import userReducer from './slices/userSlice';
import garagesReducer from './slices/garagesSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'], // Only persist auth and user
};

const rootReducer = combineReducers({
  auth: authReducer,
  session: sessionReducer,
  wallet: walletReducer,
  user: userReducer,
  garages: garagesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. Typed Hooks

```typescript
// src/store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 3. Auth Slice

```typescript
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@services/auth/authService';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { type: string; identifier: string; otp: string }) => {
    const response = await authService.verifyOTP(credentials);
    return response;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
```

### 4. Session Slice

```typescript
// src/store/slices/sessionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { parkingService } from '@services/api/parkingService';
import { ParkingSession } from '@types';

interface SessionState {
  activeSession: ParkingSession | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  activeSession: null,
  isLoading: false,
  error: null,
};

export const fetchActiveSession = createAsyncThunk(
  'session/fetchActive',
  async () => {
    return await parkingService.getActiveSession();
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setActiveSession: (state, action: PayloadAction<ParkingSession | null>) => {
      state.activeSession = action.payload;
    },
    updateSessionCost: (state, action: PayloadAction<number>) => {
      if (state.activeSession) {
        state.activeSession.currentCost = action.payload;
      }
    },
    clearSession: (state) => {
      state.activeSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchActiveSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSession = action.payload;
      })
      .addCase(fetchActiveSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch session';
      });
  },
});

export const { setActiveSession, updateSessionCost, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
```

### 5. Wallet Slice

```typescript
// src/store/slices/walletSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { walletService } from '@services/api/walletService';

interface WalletState {
  balance: number;
  autoReload: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: 0,
  autoReload: {
    enabled: false,
    threshold: 2,
    amount: 10,
  },
  isLoading: false,
  error: null,
};

export const fetchWallet = createAsyncThunk('wallet/fetch', async () => {
  return await walletService.getWallet();
});

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    deductBalance: (state, action: PayloadAction<number>) => {
      state.balance -= action.payload;
    },
    setAutoReload: (state, action: PayloadAction<Partial<WalletState['autoReload']>>) => {
      state.autoReload = { ...state.autoReload, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
        state.autoReload = action.payload.autoReload;
        state.isLoading = false;
      });
  },
});

export const { setBalance, deductBalance, setAutoReload } = walletSlice.actions;
export default walletSlice.reducer;
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/store/index.ts` | Store configuration |
| `src/store/hooks.ts` | Typed hooks |
| `src/store/slices/authSlice.ts` | Auth state |
| `src/store/slices/sessionSlice.ts` | Session state |
| `src/store/slices/walletSlice.ts` | Wallet state |
| `src/store/slices/userSlice.ts` | User profile state |
| `src/store/slices/garagesSlice.ts` | Garages cache |

## Testing Checklist

- [ ] Store initializes correctly
- [ ] Auth state persists across app restarts
- [ ] Login/logout updates state
- [ ] Session state updates from webhooks
- [ ] Wallet balance syncs with backend
- [ ] Typed hooks work correctly

## Related Tasks

- **Previous**: [TASK-001](task-001.md) - Project Setup
- **Required by**: All screens using global state
