# TASK-023: Apple Pay Integration

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-023 |
| **Module** | Payment |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-020 |
| **Status** | 🔴 Not Started |

## Description

Implement Apple Pay payment method for iOS devices with proper merchant configuration and payment sheet presentation.

## Acceptance Criteria

- [ ] Apple Pay availability check
- [ ] Payment sheet presentation
- [ ] Payment token processing
- [ ] Face ID / Touch ID authentication
- [ ] Error handling

## Technical Implementation

### Apple Pay Service

```typescript
// src/services/payment/applePayService.ts
import { presentApplePay, isApplePaySupported } from '@stripe/stripe-react-native';

export const applePayService = {
  isAvailable: async (): Promise<boolean> => {
    return isApplePaySupported();
  },

  processPayment: async (
    amount: number,
    currency: string,
    clientSecret: string
  ) => {
    const { paymentMethod, error } = await presentApplePay({
      cartItems: [{ label: 'Parking Fee', amount: amount.toString() }],
      country: 'DE',
      currency,
    });

    if (error) throw new Error(error.message);
    
    // Confirm with backend
    return paymentMethod;
  },
};
```

### Apple Pay Button

```typescript
// src/components/payment/ApplePayButton.tsx
import { ApplePayButton } from '@stripe/stripe-react-native';

export const NRJApplePayButton: React.FC<Props> = ({ onPress, disabled }) => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    applePayService.isAvailable().then(setIsAvailable);
  }, []);

  if (!isAvailable) return null;

  return (
    <ApplePayButton
      onPress={onPress}
      type="plain"
      buttonStyle="black"
      borderRadius={8}
      style={styles.button}
      disabled={disabled}
    />
  );
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/payment/applePayService.ts` | Apple Pay logic |
| `src/components/payment/ApplePayButton.tsx` | Pay button |

## iOS Configuration

```xml
<!-- ios/App/Info.plist -->
<key>NSApplePayUsageDescription</key>
<string>Pay for parking with Apple Pay</string>
```

## Testing Checklist

- [ ] Availability check works
- [ ] Payment sheet shows correctly
- [ ] Face ID/Touch ID triggers
- [ ] Payment processes successfully
- [ ] Error handling works

## Related Tasks

- **Previous**: [TASK-022](task-022.md)
- **Next**: [TASK-024](task-024.md)
