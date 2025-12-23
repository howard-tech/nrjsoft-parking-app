# TASK-020: Payment Service Integration

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-020 |
| **Module** | Payment |
| **Priority** | Critical |
| **Estimated Effort** | 10 hours |
| **Dependencies** | TASK-007 |
| **Status** | 🔴 Not Started |

## Description

Implement the payment service layer that handles payment intents, payment confirmation, and integration with payment providers (Stripe/Adyen).

## Context from Technical Proposal (Pages 22-24)

### Payment Flow:
1. GET /payment-methods - Available methods
2. POST /payments/intents - Create payment intent
3. Confirm via Card/Apple Pay/Google Pay
4. POST /payments/confirm - Finalize transaction

## Acceptance Criteria

- [ ] Payment intent creation
- [ ] Card payment processing
- [ ] Apple Pay integration
- [ ] Google Pay integration
- [ ] Payment confirmation flow
- [ ] Error handling
- [ ] Receipt generation

## Technical Implementation

### Payment Service

```typescript
// src/services/payment/paymentService.ts
import { apiClient } from '@services/api/client';
import { PaymentMethod, PaymentIntent, PaymentResult } from '@types';

export const paymentService = {
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get('/payment-methods');
    return response.data.data;
  },

  createPaymentIntent: async (
    amount: number,
    currency: string,
    context?: { sessionId?: string; type?: string }
  ): Promise<PaymentIntent> => {
    const response = await apiClient.post('/payments/intents', {
      amount,
      currency,
      ...context,
    });
    return response.data.data;
  },

  confirmPayment: async (paymentIntentId: string): Promise<PaymentResult> => {
    const response = await apiClient.post('/payments/confirm', { paymentIntentId });
    return response.data.data;
  },

  processCardPayment: async (
    paymentIntentId: string,
    cardToken: string
  ): Promise<PaymentResult> => {
    // Use Stripe/Adyen SDK to process
    return { success: true, receiptUrl: '' };
  },

  processApplePay: async (paymentIntentId: string): Promise<PaymentResult> => {
    // Apple Pay SDK integration
    return { success: true, receiptUrl: '' };
  },

  processGooglePay: async (paymentIntentId: string): Promise<PaymentResult> => {
    // Google Pay SDK integration
    return { success: true, receiptUrl: '' };
  },
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/payment/paymentService.ts` | Payment operations |
| `src/services/payment/stripeService.ts` | Stripe integration |
| `src/services/payment/applePayService.ts` | Apple Pay |
| `src/services/payment/googlePayService.ts` | Google Pay |
| `src/hooks/usePayment.ts` | Payment hook |

## Testing Checklist

- [ ] Payment intent creates successfully
- [ ] Card payment processes
- [ ] Apple Pay works on iOS
- [ ] Google Pay works on Android
- [ ] Error handling works

## Related Tasks

- **Previous**: [TASK-007](task-007.md)
- **Next**: [TASK-021](task-021.md)
