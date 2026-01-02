# Sprint 4: Payment Methods & Card Integration (TASK-021, TASK-022)

This PR implements Payment Methods management and Card Payment integration for Sprint 4.

## Changes
- **Payment Methods Screen** (`TASK-021`):
    - Added `PaymentMethodsScreen` to list saved payment methods from backend.
    - Supports pull-to-refresh and loading/empty states.
    - Delete uses `paymentService.detachPaymentMethod` before removing locally.
    - Updated `WalletStack` to include the new screen.
    - Enhanced `AppHeader` to support back navigation.
- **Card Payment Integration** (`TASK-022`):
    - Added `CardPaymentScreen` utilizing Stripe's `CardField`.
    - Fixed `createPaymentMethod` to use correct type (`{ type: 'Card' }`).
    - Attaches payment method to customer via backend before showing success.
    - Improved error handling.
- **Services**:
    - Added `attachPaymentMethod` and `detachPaymentMethod` to `paymentService`.
- **Security Fixes** (Codex Review):
    - Removed real API key from `.env.development`.
    - Removed `usesCleartextTraffic` from main `AndroidManifest.xml`.
    - Added `StripeProvider` wrapper in `App.tsx`.
- **Test Configuration**:
    - Updated `jest.config.js` for ESM module transformation.
    - Added mocks for `react-native-config`, `AsyncStorage`, `Keychain`.

## Verification
- **Unit Tests**: All payment screen tests passed.
- **Lint**: Passed (warnings only for inline styles).

## Tasks
- [x] TASK-021: Payment methods screen
- [x] TASK-022: Card payment
- [ ] TASK-023: Apple Pay (Next)
- [ ] TASK-024: Google Pay (Next)
