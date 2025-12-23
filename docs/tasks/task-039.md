# TASK-039: E2E Testing with Detox

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-039 |
| **Module** | Quality Assurance |
| **Priority** | Medium |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-038 |
| **Status** | 🔴 Not Started |

## Description

Set up end-to-end testing with Detox for critical user flows including authentication, parking session, and payment flows.

## Acceptance Criteria

- [ ] Detox configuration for iOS and Android
- [ ] E2E test for login flow
- [ ] E2E test for parking session flow
- [ ] E2E test for payment flow
- [ ] E2E test for on-street parking
- [ ] CI/CD integration

## Technical Implementation

### Detox Configuration

```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/NRJSoftParking.app',
      build: 'xcodebuild -workspace ios/NRJSoftParking.xcworkspace -scheme NRJSoftParking -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 14' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_4_API_30' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

### E2E Jest Config

```javascript
// e2e/jest.config.js
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.ts'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
```

### Login Flow Test

```typescript
// e2e/auth.test.ts
import { device, element, by, expect } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show onboarding on first launch', async () => {
    await expect(element(by.text('Choose how you pay.'))).toBeVisible();
  });

  it('should navigate through onboarding', async () => {
    await element(by.text('Next')).tap();
    await expect(element(by.text('Enter any NRJ parking zone'))).toBeVisible();
    
    await element(by.text('Next')).tap();
    await expect(element(by.text('Pay seamlessly'))).toBeVisible();
  });

  it('should complete login with OTP', async () => {
    // Navigate to login
    await element(by.text('Continue to sign in')).tap();
    
    // Enter phone number
    await element(by.id('phone-input')).typeText('+491234567890');
    
    // Request OTP (mocked in test environment)
    await element(by.text('Get OTP')).tap();
    
    // Enter OTP
    await element(by.id('otp-input-0')).typeText('1');
    await element(by.id('otp-input-1')).typeText('2');
    await element(by.id('otp-input-2')).typeText('3');
    await element(by.id('otp-input-3')).typeText('4');
    
    // Accept terms
    await element(by.id('terms-checkbox')).tap();
    
    // Login
    await element(by.text('Secure login')).tap();
    
    // Should be on home screen
    await expect(element(by.id('smart-map'))).toBeVisible();
  });
});
```

### Parking Session Test

```typescript
// e2e/parkingSession.test.ts
import { device, element, by, expect } from 'detox';

describe('Parking Session Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Login first (helper function)
    await loginAsTestUser();
  });

  it('should show nearby garages on map', async () => {
    await expect(element(by.id('smart-map'))).toBeVisible();
    await expect(element(by.id('garage-marker-0'))).toBeVisible();
  });

  it('should open garage detail on marker tap', async () => {
    await element(by.id('garage-marker-0')).tap();
    await expect(element(by.id('garage-bottom-sheet'))).toBeVisible();
    await expect(element(by.text('Remaining slots'))).toBeVisible();
  });

  it('should navigate to garage', async () => {
    await element(by.text('Navigate')).tap();
    // Check if external maps app is opened (platform specific)
  });

  it('should start parking session', async () => {
    await element(by.id('garage-marker-0')).tap();
    await element(by.text('Start Session')).tap();
    
    // Should show active session
    await expect(element(by.text('Parking in Progress'))).toBeVisible();
    await expect(element(by.id('session-timer'))).toBeVisible();
  });
});
```

### Payment Flow Test

```typescript
// e2e/payment.test.ts
import { device, element, by, expect } from 'detox';

describe('Payment Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await loginAsTestUser();
  });

  it('should show wallet balance', async () => {
    await element(by.id('wallet-tab')).tap();
    await expect(element(by.id('wallet-balance'))).toBeVisible();
  });

  it('should add funds to wallet', async () => {
    await element(by.text('+EUR 10')).tap();
    await element(by.text('Top up')).tap();
    
    // Payment sheet should appear (mocked)
    await expect(element(by.id('payment-sheet'))).toBeVisible();
  });

  it('should add payment method', async () => {
    await element(by.text('Payment Settings')).tap();
    await element(by.text('Add new payment method')).tap();
    
    // Card input
    await element(by.id('card-number')).typeText('4242424242424242');
    await element(by.id('card-expiry')).typeText('1225');
    await element(by.id('card-cvc')).typeText('123');
    
    await element(by.text('Save card')).tap();
    
    // Should show saved card
    await expect(element(by.text('**** 4242'))).toBeVisible();
  });
});
```

### Test Helpers

```typescript
// e2e/helpers/auth.ts
import { element, by } from 'detox';

export const loginAsTestUser = async () => {
  // Skip onboarding if shown
  try {
    await element(by.text('Skip')).tap();
  } catch {}
  
  // Login
  await element(by.id('phone-input')).typeText('+491234567890');
  await element(by.id('otp-input-0')).typeText('1234');
  await element(by.id('terms-checkbox')).tap();
  await element(by.text('Secure login')).tap();
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `.detoxrc.js` | Detox configuration |
| `e2e/jest.config.js` | E2E Jest config |
| `e2e/auth.test.ts` | Auth flow tests |
| `e2e/parkingSession.test.ts` | Session flow tests |
| `e2e/payment.test.ts` | Payment flow tests |
| `e2e/onstreet.test.ts` | On-street flow tests |
| `e2e/helpers/auth.ts` | Test helpers |

## Dependencies

```bash
npm install --save-dev detox jest
```

## Testing Checklist

- [ ] Detox builds successfully
- [ ] Auth flow test passes
- [ ] Parking session test passes
- [ ] Payment test passes
- [ ] On-street test passes
- [ ] CI/CD runs E2E tests

## Related Tasks

- **Previous**: [TASK-038](task-038.md)
- **Next**: [TASK-040](task-040.md)
