# TASK-024: Google Pay Integration

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-024 |
| **Module** | Payment |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-020 |
| **Status** | 🔴 Not Started |

## Description

Implement Google Pay payment method for Android devices with proper merchant configuration and payment sheet presentation.

## Acceptance Criteria

- [ ] Google Pay availability check
- [ ] Payment sheet presentation
- [ ] Payment token processing
- [ ] Android tap to pay flow
- [ ] Error handling

## Technical Implementation

### Google Pay Service

```typescript
// src/services/payment/googlePayService.ts
import { presentGooglePay, isGooglePaySupported } from '@stripe/stripe-react-native';

export const googlePayService = {
  isAvailable: async (): Promise<boolean> => {
    return isGooglePaySupported({ testEnv: __DEV__ });
  },

  processPayment: async (
    amount: number,
    currency: string,
    clientSecret: string
  ) => {
    const { paymentMethod, error } = await presentGooglePay({
      clientSecret,
      forSetupIntent: false,
    });

    if (error) throw new Error(error.message);
    return paymentMethod;
  },

  initialize: async () => {
    await initGooglePay({
      merchantName: 'NRJ Soft Parking',
      countryCode: 'DE',
      testEnv: __DEV__,
    });
  },
};
```

### Google Pay Button

```typescript
// src/components/payment/GooglePayButton.tsx
import { GooglePayButton } from '@stripe/stripe-react-native';

export const NRJGooglePayButton: React.FC<Props> = ({ onPress, disabled }) => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    googlePayService.isAvailable().then(setIsAvailable);
  }, []);

  if (!isAvailable) return null;

  return (
    <GooglePayButton
      onPress={onPress}
      type="standard"
      style={styles.button}
      disabled={disabled}
    />
  );
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/payment/googlePayService.ts` | Google Pay logic |
| `src/components/payment/GooglePayButton.tsx` | Pay button |

## Android Configuration

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<meta-data
  android:name="com.google.android.gms.wallet.api.enabled"
  android:value="true" />
```

## Testing Checklist

- [ ] Availability check works
- [ ] Payment sheet shows correctly
- [ ] Payment processes successfully
- [ ] Error handling works

## Related Tasks

- **Previous**: [TASK-023](task-023.md)
- **Next**: [TASK-025](task-025.md)
