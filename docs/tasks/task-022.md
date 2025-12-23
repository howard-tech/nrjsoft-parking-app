# TASK-022: Card Payment Integration (Stripe)

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-022 |
| **Module** | Payment |
| **Priority** | Critical |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-020, TASK-021 |
| **Status** | 🔴 Not Started |

## Description

Implement secure card payment processing using Stripe SDK with PCI-compliant card input, tokenization, and payment confirmation.

## Acceptance Criteria

- [ ] Stripe SDK integration
- [ ] Secure card input component
- [ ] Card tokenization
- [ ] 3D Secure support
- [ ] Save card for future use
- [ ] Error handling for declined cards

## Technical Implementation

### Stripe Card Input

```typescript
// src/screens/payment/AddCardScreen.tsx
import { CardField, useStripe } from '@stripe/stripe-react-native';

export const AddCardScreen: React.FC = () => {
  const { createToken } = useStripe();
  const [cardComplete, setCardComplete] = useState(false);

  const handleSaveCard = async () => {
    const { token, error } = await createToken({ type: 'Card' });
    if (token) {
      await paymentService.saveCard(token.id);
    }
  };

  return (
    <View>
      <CardField
        postalCodeEnabled={false}
        onCardChange={(details) => setCardComplete(details.complete)}
        style={styles.cardField}
      />
      <Button title="Save Card" onPress={handleSaveCard} disabled={!cardComplete} />
    </View>
  );
};
```

### Payment Processing

```typescript
// src/services/payment/stripeService.ts
import { confirmPayment } from '@stripe/stripe-react-native';

export const stripeService = {
  processPayment: async (clientSecret: string, cardId?: string) => {
    const { paymentIntent, error } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: cardId ? { paymentMethodId: cardId } : undefined,
    });
    
    if (error) throw new Error(error.message);
    return paymentIntent;
  },
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/payment/AddCardScreen.tsx` | Add card form |
| `src/services/payment/stripeService.ts` | Stripe SDK wrapper |
| `src/components/payment/CardInput.tsx` | Card input component |

## Testing Checklist

- [ ] Card input validates correctly
- [ ] Tokenization works
- [ ] Payment confirmation succeeds
- [ ] 3D Secure flow works
- [ ] Error messages display correctly

## Related Tasks

- **Previous**: [TASK-021](task-021.md)
- **Next**: [TASK-023](task-023.md)
