# Sprint 4: Payment Methods & Card Integration (TASK-021, TASK-022)

This PR implements Payment Methods management and Card Payment integration for Sprint 4.

## Changes
- **Payment Methods Screen** (`TASK-021`):
    - Added `PaymentMethodsScreen` to list saved payment methods.
    - Updated `WalletStack` to include the new screen.
    - Enhanced `AppHeader` to support back navigation.
- **Card Payment Integration** (`TASK-022`):
    - Added `CardPaymentScreen` utilizing Stripe's `CardField`.
    - Updated `paymentService` to support attaching payment methods.
    - Added unit tests for both screens.
- **Android Configuration**:
    - Updated `build.gradle` for vector icons.
    - Updated `.env.development` with valid Maps API key.
- **Components**:
    - Improved `PhoneInput` with Country Code selector (carried over).

## Verification
- **Unit Tests**: All new tests passed.
- **Manual Test**: Android app launches and navigates to screens.
- **Lint**: Passed.

## Tasks
- [x] TASK-021: Payment methods screen
- [x] TASK-022: Card payment
- [ ] TASK-023: Apple Pay (Next)
- [ ] TASK-024: Google Pay (Next)
