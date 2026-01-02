# Sprint 4: Apple Pay & Google Pay Integration (TASK-023, TASK-024)

This PR implements Apple Pay and Google Pay payment flows using Stripe's `usePlatformPay` hook.

## Changes
- **Apple Pay Integration** (`TASK-023`):
    - Added "Add Apple Pay" button for iOS users.
    - Implemented setup flow using `SetupIntent` to save payment methods securely.
    - Integrated with `applePayService` for configuration and status checking.
- **Google Pay Integration** (`TASK-024`):
    - Refined Google Pay flow to use `SetupIntent` (type: setup, amount: 0) for saving payment methods without charging.
    - Added "Add Google Pay" button for Android users.
    - Wired with environment configuration via `react-native-config`.
    - Persists payment methods by calling `attachPaymentMethod` after successful confirmation.
- **UI Enhancements**:
    - Refactored `PaymentMethodsScreen` footer to provide platform-specific payment options (Apple Pay on iOS, Google Pay on Android).
    - Improved loading states and error handling for platform payments.
- **Tests**:
    - Updated `PaymentMethodsScreen.test.tsx` to cover both Apple Pay and Google Pay rendering and logic.
    - Mocked `Platform.OS` and platform services for comprehensive unit testing.
    - Added ESM mapping in `jest.config.js` for library compatibility.

## Verification
- **Unit Tests**: `npm test -- PaymentMethodsScreen.test.tsx CardPaymentScreen.test.tsx` passed (6 tests).
- **Lint**: `npm run lint` passed with zero errors.

## Tasks
- [x] TASK-021: Payment methods screen (Completed)
- [x] TASK-022: Card payment (Completed)
- [x] TASK-023: Apple Pay Flow
- [x] TASK-024: Google Pay Integration
