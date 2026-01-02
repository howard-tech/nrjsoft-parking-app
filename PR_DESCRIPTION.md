# Sprint 4: Payment Hardening & New Flows (TASK-023 → TASK-027)

This PR hardens the platform pay flows (Apple Pay, Google Pay) and adds real charge/default/transaction history features.

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
    - Improved loading states, error handling (error/cancel), and type safety (Stripe PlatformPay result narrowing).
- **Tests**:
    - Updated `PaymentMethodsScreen.test.tsx` to cover Apple/Google Pay success, cancel, and error paths.
    - Mocked `Platform.OS` and platform services for comprehensive unit testing.
    - Added ESM mapping in `jest.config.js` for library compatibility.
- **Task-025: Process Payment / Charge Flow**
    - Added `PaymentCheckoutScreen` to charge a real amount with a saved payment method.
    - Added `paymentService.chargePayment` and mock API endpoint `/payments/charge`.
- **Task-026: Default Payment Method UX**
    - Added “Set Default” action in `PaymentMethodsScreen` and backend `/payment-methods/set-default`.
- **Task-027: Transaction History & Receipts**
    - Added `PaymentHistoryScreen` listing transactions from `/transactions`.
    - Extended mock API with `/transactions` endpoint and receipt metadata.

## Verification
- **Unit Tests**: `npm test -- PaymentMethodsScreen.test.tsx CardPaymentScreen.test.tsx` passed (8 tests).
- **Lint**: `npm run lint` passed with zero errors.

## Tasks
- [x] TASK-021: Payment methods screen (Completed)
- [x] TASK-022: Card payment (Completed)
- [x] TASK-023: Apple Pay Flow
- [x] TASK-024: Google Pay Integration
