# TASK-038: Testing Setup & Unit Tests

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-038 |
| **Module** | Quality Assurance |
| **Priority** | High |
| **Estimated Effort** | 10 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🟢 Completed |

## Description

Set up testing infrastructure including Jest configuration, React Native Testing Library, and write unit tests for critical services and components.

## Acceptance Criteria

- [x] Jest configuration for React Native
- [x] React Native Testing Library setup
- [x] Unit tests for auth service
- [x] Unit tests for payment service
- [x] Unit tests for session service
- [x] Component tests for critical UI
- [x] Test coverage reporting
- [x] CI/CD integration

## Technical Implementation

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-reanimated)/)',
  ],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@theme$': '<rootDir>/src/theme',
    '^@types$': '<rootDir>/src/types',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Jest Setup

```typescript
// jest.setup.js
import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Silence warnings
jest.spyOn(console, 'warn').mockImplementation(() => {});
```

### Auth Service Tests

```typescript
// src/services/auth/__tests__/authService.test.ts
import { authService } from '../authService';
import { apiClient } from '@services/api/client';
import { tokenStorage } from '../tokenStorage';

jest.mock('@services/api/client');
jest.mock('../tokenStorage');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestOTP', () => {
    it('should request OTP for phone number', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: { success: true } });

      const result = await authService.requestOTP('phone', '+491234567890');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/otp-request', {
        type: 'phone',
        identifier: '+491234567890',
      });
      expect(result.success).toBe(true);
    });

    it('should handle request error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(authService.requestOTP('phone', '+491234567890')).rejects.toThrow('Network error');
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP and store tokens', async () => {
      const mockResponse = {
        data: {
          accessToken: 'access123',
          refreshToken: 'refresh123',
          user: { id: '1', name: 'Test User' },
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.verifyOTP({
        type: 'phone',
        identifier: '+491234567890',
        otp: '123456',
      });

      expect(tokenStorage.setTokens).toHaveBeenCalledWith('access123', 'refresh123');
      expect(result.user.name).toBe('Test User');
    });
  });

  describe('logout', () => {
    it('should clear tokens on logout', async () => {
      await authService.logout();

      expect(tokenStorage.clearTokens).toHaveBeenCalled();
    });
  });
});
```

### Session Service Tests

```typescript
// src/services/session/__tests__/sessionService.test.ts
import { sessionService } from '../sessionService';
import { apiClient } from '@services/api/client';

jest.mock('@services/api/client');

describe('SessionService', () => {
  describe('calculateCurrentCost', () => {
    it('should calculate cost based on elapsed time', () => {
      const session = {
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        hourlyRate: 5,
      };

      const cost = sessionService.calculateCurrentCost(session);

      expect(cost).toBeCloseTo(10, 1); // 2 hours * €5/hr = €10
    });

    it('should apply minimum charge', () => {
      const session = {
        startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
        hourlyRate: 5,
        minimumCharge: 2,
      };

      const cost = sessionService.calculateCurrentCost(session);

      expect(cost).toBe(2); // Minimum charge applied
    });
  });
});
```

### Component Tests

```typescript
// src/components/common/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Press me" onPress={() => {}} />);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Press me" onPress={onPress} />);

    fireEvent.press(getByText('Press me'));

    expect(onPress).toHaveBeenCalled();
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Press me" onPress={onPress} disabled />);

    fireEvent.press(getByText('Press me'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator', () => {
    const { getByTestId } = render(<Button title="Press me" onPress={() => {}} loading />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `jest.config.js` | Jest configuration |
| `jest.setup.js` | Test setup and mocks |
| `src/services/auth/__tests__/authService.test.ts` | Auth service tests |
| `src/services/session/__tests__/sessionService.test.ts` | Session service tests |
| `src/services/payment/__tests__/paymentService.test.ts` | Payment service tests |
| `src/components/common/__tests__/Button.test.tsx` | Button component tests |

## Dependencies

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

## Testing Checklist

- [ ] Jest runs successfully
- [ ] All service tests pass
- [ ] Component tests render correctly
- [ ] Coverage meets threshold (70%)
- [ ] Mocks work correctly
- [ ] CI/CD runs tests

## Related Tasks

- **Previous**: [TASK-037](task-037.md)
- **Next**: [TASK-039](task-039.md)
