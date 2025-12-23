# AGENT.md - NRJSoft Parking App Development Guide

## 🎯 Mục Tiêu

Xây dựng ứng dụng đỗ xe React Native với 57 tasks trong 3 tháng. File này hướng dẫn AI Agent/Developer cách thiết kế và code từng phần của hệ thống.

---

## 📦 Quick Setup (Copy & Paste)

```bash
# 1. Vào thư mục Downloads (hoặc nơi lưu file zip)
cd ~/Downloads

# 2. Giải nén
unzip nrjsoft-parking-app.zip

# 3. Đổi tên folder
mv nrjsoft-parking-app-full nrjsoft-parking-app

# 4. Vào project
cd nrjsoft-parking-app

# 5. Cấp quyền scripts
chmod +x scripts/*.sh

# 6. Sửa line endings (quan trọng nếu download từ Windows)
sed -i '' $'s/\r$//' scripts/*.sh

# 7. Cài dependencies
npm install --legacy-peer-deps

# 8. Setup Mock API
cd mock-api && npm install && cd ..

# 9. iOS Pods (chỉ macOS)
cd ios && pod install && cd ..

# 10. Tạo file .env
cp .env.example .env

# 11. Chạy app
# Terminal 1: Mock API
cd mock-api && npm run dev

# Terminal 2: Metro
npm start

# Terminal 3: iOS/Android
npm run ios
# hoặc
npm run android
```

### One-liner Setup (macOS)

```bash
cd ~/Downloads && unzip -o nrjsoft-parking-app.zip && mv nrjsoft-parking-app-full nrjsoft-parking-app && cd nrjsoft-parking-app && chmod +x scripts/*.sh && npm install --legacy-peer-deps && cd mock-api && npm install && cd ../ios && pod install && cd .. && cp .env.example .env && echo "✅ Setup complete! Run: npm start"
```

---

## 📋 Task Execution Order

### Phase 1: Foundation (Week 1-2)

```
TASK-052 → TASK-053 → TASK-054 → TASK-001 → TASK-002 → TASK-003
   │           │           │          │          │          │
   ▼           ▼           ▼          ▼          ▼          ▼
Mock API   Mock Data   Simulation  RN Init   Theme      Navigation
Server     Generator   Features              System     Shell
```

**Bắt đầu với Mock API để có backend test ngay:**

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 1 | TASK-052 | Express Mock Server | `mock-api/` với tất cả endpoints |
| 2 | TASK-053 | Mock Data Generator | Fake data cho EU (garages, users, plates) |
| 3 | TASK-054 | Simulation Features | ANPR simulator, payment testing |
| 4 | TASK-001 | React Native Init | Project structure với TypeScript |
| 5 | TASK-002 | Design System | Theme, colors, typography, components |
| 6 | TASK-003 | Navigation Shell | Bottom tabs + Stack navigators |

### Phase 2: Authentication (Week 3)

```
TASK-004 → TASK-005 → TASK-006 → TASK-046
   │          │          │          │
   ▼          ▼          ▼          ▼
Onboarding  OTP Auth   Token Mgmt  Social Login
Screens     Flow       & Refresh   Google/Apple
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 7 | TASK-004 | Onboarding Screens | Tutorial carousel, language select |
| 8 | TASK-005 | OTP Authentication | Phone/email input, OTP verify |
| 9 | TASK-006 | Token Management | Secure storage, auto refresh |
| 10 | TASK-046 | Social Login | Google Sign-In, Apple Sign-In |

### Phase 3: Core Services (Week 4)

```
TASK-007 → TASK-008 → TASK-009 → TASK-033
   │          │          │          │
   ▼          ▼          ▼          ▼
API Client  Push       Redux      i18n
Axios       Notif      Store      Localization
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 11 | TASK-007 | API Client | Axios instance, interceptors, error handling |
| 12 | TASK-008 | Push Notifications | FCM setup, permission handling |
| 13 | TASK-009 | Redux Store | Slices, async thunks, selectors |
| 14 | TASK-033 | Localization | i18next, EN/DE/BG translations |

### Phase 4: Smart Map (Week 5-6)

```
TASK-010 → TASK-011 → TASK-012 → TASK-013 → TASK-014 → TASK-048
   │          │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼          ▼
Map Init   Garage     Bottom     Search     External   Map
           Pins       Sheet      Filter     Nav        Perf
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 15 | TASK-010 | Map Integration | Google Maps SDK, user location |
| 16 | TASK-011 | Garage Markers | Custom pins, clustering, availability |
| 17 | TASK-012 | Detail Bottom Sheet | Garage info, pricing, amenities |
| 18 | TASK-013 | Search & Filters | Search bar, filter chips |
| 19 | TASK-014 | External Navigation | Deep link to Google Maps/Waze |
| 20 | TASK-048 | Map Performance | Marker optimization, caching |

### Phase 5: Parking Sessions (Week 7-8)

```
TASK-015 → TASK-016 → TASK-017 → TASK-018 → TASK-019
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
QR Scanner Session    Active     Cost       Receipt
Modal      Service    Screen     Calculator History
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 21 | TASK-015 | QR Scanner | Camera permission, QR decode |
| 22 | TASK-016 | Session Service | Create, update, end session |
| 23 | TASK-017 | Active Session Screen | Timer, cost, wallet projection |
| 24 | TASK-018 | Cost Calculator | Rate calculation, overstay |
| 25 | TASK-019 | Receipt & History | PDF generation, history list |

### Phase 6: Payments (Week 9-10)

```
TASK-020 → TASK-021 → TASK-022 → TASK-023 → TASK-024 → TASK-025 → TASK-042
   │          │          │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼          ▼          ▼
Payment    Stripe     Apple      Google     Wallet     Subscrip-  Payment
Service    Cards      Pay        Pay        TopUp      tions      UI
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 26 | TASK-020 | Payment Service | Payment methods, intents |
| 27 | TASK-021 | Stripe Cards | Card input, vaulting, charge |
| 28 | TASK-022 | Apple Pay | Native iOS payment sheet |
| 29 | TASK-023 | Google Pay | Native Android payment |
| 30 | TASK-024 | Wallet Top-up | Balance, top-up flow |
| 31 | TASK-025 | Subscriptions | Plans, recurring billing |
| 32 | TASK-042 | Payment UI | Payment methods screen |

### Phase 7: On-Street Parking (Week 11)

```
TASK-026 → TASK-027 → TASK-028 → TASK-029
   │          │          │          │
   ▼          ▼          ▼          ▼
On-Street  Parking    Countdown  Extend/
Service    Screen     Timer      Stop
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 33 | TASK-026 | On-Street Service | Zones, pricing, sessions |
| 34 | TASK-027 | On-Street Screen | Zone select, duration picker |
| 35 | TASK-028 | Countdown Timer | Live countdown, notifications |
| 36 | TASK-029 | Extend/Stop | Extend time, early stop |

### Phase 8: Account & Settings (Week 12)

```
TASK-030 → TASK-031 → TASK-032 → TASK-043 → TASK-047
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
Account    Vehicle    OCR Plate  Notif      Help &
Screen     Manage     Scan       Prefs      Support
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 37 | TASK-030 | Account Screen | Profile view/edit |
| 38 | TASK-031 | Vehicle Management | Add/edit/delete vehicles |
| 39 | TASK-032 | OCR Plate Scan | Camera OCR for plates |
| 40 | TASK-043 | Notification Prefs | Toggle settings |
| 41 | TASK-047 | Help & Support | FAQ, contact, GDPR delete |

### Phase 9: Notifications & Deep Links (Week 12)

```
TASK-034 → TASK-035
   │          │
   ▼          ▼
Notif      Deep
Inbox      Links
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 42 | TASK-034 | Notifications Inbox | In-app notification list |
| 43 | TASK-035 | Deep Linking | QR → app, URL schemes |

### Phase 10: Quality & Polish (Week 13)

```
TASK-036 → TASK-037 → TASK-038 → TASK-039 → TASK-044
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
Error      Perf       Unit       E2E        A11y
Handling   Optimize   Tests      Tests      
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 44 | TASK-036 | Error Handling | Error boundaries, retry logic |
| 45 | TASK-037 | Performance | Lazy loading, memoization |
| 46 | TASK-038 | Unit Tests | Jest, 80%+ coverage |
| 47 | TASK-039 | E2E Tests | Detox test suites |
| 48 | TASK-044 | Accessibility | VoiceOver, TalkBack |

### Phase 11: Security & Stability (Week 13)

```
TASK-049 → TASK-050 → TASK-051 → TASK-041 → TASK-055
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
Offline    Security   Analytics  App        Dev
Mode       Hardening  Firebase   Icons      Scripts
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 49 | TASK-049 | Offline Mode | Queue, sync, cache |
| 50 | TASK-050 | Security | Encryption, keychain, SSL pinning |
| 51 | TASK-051 | Analytics | Firebase Analytics, Crashlytics |
| 52 | TASK-041 | App Icons | iOS/Android icons, splash |
| 53 | TASK-055 | Dev Scripts | Automation scripts |

### Phase 12: Deployment (Week 14)

```
TASK-040 → TASK-045 → TASK-056 → TASK-057
   │          │          │          │
   ▼          ▼          ▼          ▼
Build      CI/CD      iOS        Android
Config     Pipeline   Deploy     Deploy
```

| Order | Task | Mô tả | Output |
|-------|------|-------|--------|
| 54 | TASK-040 | Build Configuration | Environment configs |
| 55 | TASK-045 | CI/CD Pipeline | GitHub Actions |
| 56 | TASK-056 | iOS Deployment | Fastlane, TestFlight, App Store |
| 57 | TASK-057 | Android Deployment | Fastlane, Play Store |

---

## 🏗️ System Architecture

### Mobile App Structure

```
src/
├── components/           # Reusable UI Components
│   ├── common/          # Button, Input, Card, Modal
│   ├── map/             # MapView, Marker, BottomSheet
│   ├── parking/         # SessionCard, Timer, Receipt
│   └── payment/         # PaymentMethod, WalletCard
│
├── screens/             # Screen Components
│   ├── auth/            # Onboarding, Login, OTP
│   ├── home/            # SmartMap, GarageDetail
│   ├── session/         # ActiveSession, History
│   ├── payment/         # PaymentMethods, Wallet, Checkout
│   ├── onstreet/        # OnStreetParking, Countdown
│   ├── account/         # Profile, Vehicles, Settings
│   └── notifications/   # Inbox
│
├── navigation/          # React Navigation
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainNavigator.tsx
│   └── types.ts
│
├── services/            # Business Logic & API
│   ├── api/
│   │   ├── client.ts    # Axios instance
│   │   ├── auth.ts      # Auth endpoints
│   │   ├── parking.ts   # Parking endpoints
│   │   ├── payment.ts   # Payment endpoints
│   │   └── types.ts     # API types
│   ├── auth/
│   │   └── AuthService.ts
│   ├── parking/
│   │   ├── SessionService.ts
│   │   └── OnStreetService.ts
│   ├── payment/
│   │   ├── PaymentService.ts
│   │   └── WalletService.ts
│   └── notifications/
│       └── PushService.ts
│
├── store/               # Redux Toolkit
│   ├── index.ts         # Store configuration
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── parkingSlice.ts
│   │   ├── sessionSlice.ts
│   │   ├── paymentSlice.ts
│   │   └── settingsSlice.ts
│   ├── selectors/
│   └── middleware/
│
├── hooks/               # Custom Hooks
│   ├── useAuth.ts
│   ├── useLocation.ts
│   ├── useSession.ts
│   ├── usePayment.ts
│   └── useNotifications.ts
│
├── theme/               # Design System
│   ├── index.ts
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── components.ts
│
├── localization/        # i18n
│   ├── index.ts
│   ├── en.json
│   ├── de.json
│   └── bg.json
│
├── utils/               # Utilities
│   ├── storage.ts       # AsyncStorage wrapper
│   ├── validation.ts    # Form validation
│   ├── formatting.ts    # Date, currency formatters
│   └── constants.ts
│
└── types/               # TypeScript Types
    ├── navigation.ts
    ├── api.ts
    ├── models.ts
    └── env.d.ts
```

### Mock API Structure

```
mock-api/
├── src/
│   ├── index.ts              # Express app entry
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── parking.routes.ts
│   │   ├── session.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── wallet.routes.ts
│   │   ├── onstreet.routes.ts
│   │   ├── user.routes.ts
│   │   └── admin.routes.ts   # Test/simulation endpoints
│   │
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── ParkingController.ts
│   │   ├── SessionController.ts
│   │   ├── PaymentController.ts
│   │   └── AdminController.ts
│   │
│   ├── services/
│   │   ├── TokenService.ts
│   │   ├── SessionService.ts
│   │   ├── PaymentService.ts
│   │   └── SimulationService.ts
│   │
│   ├── data/
│   │   ├── generator.ts      # Faker data generator
│   │   ├── garages.ts        # EU garages
│   │   ├── users.ts          # Test users
│   │   ├── vehicles.ts       # License plates
│   │   └── zones.ts          # On-street zones
│   │
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   ├── delay.ts          # Response delay
│   │   └── error.ts          # Error simulation
│   │
│   └── websocket/
│       └── SessionSocket.ts  # Real-time updates
│
├── package.json
└── tsconfig.json
```

---

## 📝 Code Patterns

### 1. API Service Pattern

```typescript
// src/services/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { getToken, refreshToken } from '../auth/TokenService';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401, refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Logout user
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Redux Slice Pattern

```typescript
// src/store/slices/sessionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SessionService } from '@/services/parking/SessionService';
import { ParkingSession, SessionStatus } from '@/types/models';

interface SessionState {
  activeSession: ParkingSession | null;
  history: ParkingSession[];
  loading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  activeSession: null,
  history: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchActiveSession = createAsyncThunk(
  'session/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await SessionService.getActive();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startSession = createAsyncThunk(
  'session/start',
  async (garageId: string, { rejectWithValue }) => {
    try {
      return await SessionService.start(garageId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
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
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSession.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = action.payload;
      })
      .addCase(fetchActiveSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateSessionCost, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
```

### 3. Screen Component Pattern

```typescript
// src/screens/session/ActiveSessionScreen.tsx
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { RootState, AppDispatch } from '@/store';
import { fetchActiveSession, updateSessionCost } from '@/store/slices/sessionSlice';
import { useSession } from '@/hooks/useSession';
import { useTheme } from '@/theme';

import { SessionTimer } from '@/components/parking/SessionTimer';
import { CostDisplay } from '@/components/parking/CostDisplay';
import { WalletProjection } from '@/components/parking/WalletProjection';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorView } from '@/components/common/ErrorView';

export const ActiveSessionScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  const { activeSession, loading, error } = useSelector(
    (state: RootState) => state.session
  );
  const { walletBalance } = useSelector(
    (state: RootState) => state.payment
  );
  
  const { calculateCurrentCost, formatDuration } = useSession();

  useEffect(() => {
    dispatch(fetchActiveSession());
  }, [dispatch]);

  // Update cost every minute
  useEffect(() => {
    if (!activeSession) return;
    
    const interval = setInterval(() => {
      const newCost = calculateCurrentCost(activeSession);
      dispatch(updateSessionCost(newCost));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [activeSession, dispatch, calculateCurrentCost]);

  const handleTopUp = useCallback(() => {
    // Navigate to wallet top-up
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error} onRetry={() => dispatch(fetchActiveSession())} />;
  if (!activeSession) return null;

  const isLowBalance = walletBalance - activeSession.currentCost < 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.label}>{t('session.parkingInProgress')}</Text>
        <Text style={styles.location}>{activeSession.garage.name}</Text>
      </View>

      <SessionTimer startTime={activeSession.startTime} />
      
      <CostDisplay 
        amount={activeSession.currentCost} 
        currency="EUR"
      />
      
      <WalletProjection
        currentCost={activeSession.currentCost}
        walletBalance={walletBalance}
        isLow={isLowBalance}
      />

      {isLowBalance && (
        <Button
          title={t('session.topUpNow')}
          onPress={handleTopUp}
          variant="warning"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
```

### 4. Custom Hook Pattern

```typescript
// src/hooks/useSession.ts
import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { 
  fetchActiveSession, 
  startSession, 
  endSession 
} from '@/store/slices/sessionSlice';
import { ParkingSession } from '@/types/models';

export const useSession = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { activeSession, loading, error } = useSelector(
    (state: RootState) => state.session
  );

  const isActive = useMemo(() => !!activeSession, [activeSession]);

  const calculateCurrentCost = useCallback((session: ParkingSession): number => {
    const now = new Date();
    const start = new Date(session.startTime);
    const durationMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    const hours = Math.ceil(durationMinutes / 60);
    return hours * session.garage.hourlyRate;
  }, []);

  const formatDuration = useCallback((startTime: string): string => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const start = useCallback(async (garageId: string) => {
    return dispatch(startSession(garageId)).unwrap();
  }, [dispatch]);

  const end = useCallback(async () => {
    if (!activeSession) return;
    return dispatch(endSession(activeSession.id)).unwrap();
  }, [dispatch, activeSession]);

  const refresh = useCallback(() => {
    dispatch(fetchActiveSession());
  }, [dispatch]);

  return {
    activeSession,
    isActive,
    loading,
    error,
    calculateCurrentCost,
    formatDuration,
    start,
    end,
    refresh,
  };
};
```

### 5. Reusable Component Pattern

```typescript
// src/components/common/Button.tsx
import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'warning' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  testID,
}) => {
  const theme = useTheme();

  const containerStyles = [
    styles.container,
    styles[size],
    { backgroundColor: theme.colors[variant] },
    variant === 'outline' && { 
      backgroundColor: 'transparent', 
      borderWidth: 2, 
      borderColor: theme.colors.primary 
    },
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    { color: variant === 'outline' ? theme.colors.primary : '#FFFFFF' },
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.7,
  },
});
```

---

## 🔧 Task Execution Guide

### Khi Bắt Đầu Mỗi Task

```bash
# 1. Đọc task specification
cat docs/tasks/task-XXX.md

# 2. Tạo branch
git checkout -b feature/TASK-XXX

# 3. Code theo patterns ở trên

# 4. Test
npm test
npm run lint
npm run ios  # manual test

# 5. Commit
git add .
git commit -m "feat(scope): TASK-XXX description"
```

### Checklist Trước Khi Complete

```
□ Code compiles without errors
□ No TypeScript errors (npx tsc --noEmit)
□ Lint passes (npm run lint)
□ Unit tests pass (npm test)
□ Manual test iOS simulator
□ Manual test Android emulator
□ Follows patterns in this document
□ All acceptance criteria met
```

---

## 📱 Screen Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Onboarding │ ──▶ │    Login    │ ──▶ │  Smart Map  │
│  (Tutorial) │     │ (OTP/Social)│     │   (Home)    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
        ┌──────────────────────────────────────┼──────────────────────────────────────┐
        │                                      │                                      │
        ▼                                      ▼                                      ▼
┌───────────────┐                    ┌─────────────────┐                    ┌─────────────────┐
│ Garage Detail │                    │  On-Street Tab  │                    │   Account Tab   │
│ (Bottom Sheet)│                    │                 │                    │                 │
└───────┬───────┘                    └────────┬────────┘                    └────────┬────────┘
        │                                     │                                      │
        ▼                                     ▼                                      ▼
┌───────────────┐                    ┌─────────────────┐                    ┌─────────────────┐
│  QR Scanner   │                    │  Zone Select    │                    │    Profile      │
│  (ANPR auto)  │                    │  Duration Pick  │                    │    Vehicles     │
└───────┬───────┘                    └────────┬────────┘                    │    Settings     │
        │                                     │                             └─────────────────┘
        ▼                                     ▼
┌───────────────┐                    ┌─────────────────┐
│Active Session │                    │   Pay Upfront   │
│ Timer + Cost  │                    │                 │
└───────┬───────┘                    └────────┬────────┘
        │                                     │
        ▼                                     ▼
┌───────────────┐                    ┌─────────────────┐
│   Pay & Exit  │                    │ Countdown Timer │
│   Receipt     │                    │ Extend/Stop     │
└───────────────┘                    └─────────────────┘
```

---

## 🔌 API Endpoints Reference

### Authentication
```
POST /auth/otp-request     - Request OTP
POST /auth/otp-verify      - Verify OTP, get tokens
POST /auth/refresh         - Refresh access token
POST /auth/social/google   - Google Sign-In
POST /auth/social/apple    - Apple Sign-In
```

### User
```
GET  /me                   - Get profile
PUT  /me                   - Update profile
GET  /me/vehicles          - List vehicles
POST /me/vehicles          - Add vehicle
DELETE /me/vehicles/:id    - Remove vehicle
```

### Parking
```
GET  /parking/nearby       - Nearby garages (lat, lng, radius)
GET  /parking/:id          - Garage detail
GET  /parking/search       - Search garages
```

### Sessions
```
GET  /sessions/active      - Current active session
POST /sessions             - Start session
GET  /sessions/:id         - Session detail
POST /sessions/:id/extend  - Extend session
POST /sessions/:id/end     - End session
GET  /sessions/history     - Past sessions
```

### Wallet
```
GET  /wallet               - Balance & settings
POST /wallet/topup-intent  - Create top-up
GET  /wallet/transactions  - Transaction history
```

### Payments
```
GET  /payment-methods      - Saved payment methods
POST /payment-methods      - Add payment method
DELETE /payment-methods/:id - Remove method
POST /payments/intents     - Create payment intent
POST /payments/confirm     - Confirm payment
```

### On-Street
```
GET  /onstreet/zones       - Available zones (lat, lng)
GET  /onstreet/zones/:id   - Zone detail
POST /onstreet/quote       - Get price quote
POST /onstreet/sessions    - Start on-street session
POST /onstreet/sessions/:id/extend - Extend time
POST /onstreet/sessions/:id/stop   - Stop early
```

### Subscriptions
```
GET  /subscriptions/plans  - Available plans
POST /subscriptions        - Subscribe
DELETE /subscriptions/:id  - Cancel
```

---

## 🚀 Quick Commands

```bash
# Setup
npm install --legacy-peer-deps
cd mock-api && npm install && cd ..
cd ios && pod install && cd ..
cp .env.example .env

# Development
npm start                  # Metro bundler
npm run ios               # Run iOS
npm run android           # Run Android
cd mock-api && npm run dev # Mock API

# Testing
npm test                  # Unit tests
npm run lint              # Linter
npx tsc --noEmit          # Type check

# Build
npm run build:ios         # iOS release
npm run build:android     # Android release
```

---

## 📚 Files Reference

| File | Mô tả |
|------|-------|
| `docs/tasks/task-XXX.md` | Chi tiết từng task |
| `docs/TASK-LIST.md` | Master task list |
| `AGENT.md` | File này - hướng dẫn coding |
| `.env.example` | Environment template |
| `package.json` | Dependencies |

---

**Total: 57 Tasks | 400 Hours | 3 Months | $29,000 USD**

**Start with TASK-052 (Mock API) → Work through each phase → Deploy**
