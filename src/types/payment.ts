export type PaymentMethodType = 'card' | 'apple_pay' | 'google_pay' | 'wallet';

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
    isDefault?: boolean;
    label?: string;
    createdAt?: string;
}

export type PaymentIntentStatus = 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled';

export interface PaymentIntent {
    id: string;
    clientSecret?: string;
    amount: number;
    currency: string;
    status: PaymentIntentStatus;
    paymentMethodId?: string;
    metadata?: Record<string, unknown>;
}

export interface PaymentResult {
    success: boolean;
    receiptUrl?: string;
    errorMessage?: string;
    status?: PaymentIntentStatus;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    description?: string;
    status: TransactionStatus;
    createdAt: string;
    paymentMethodId?: string;
    paymentMethodType?: PaymentMethodType;
    receiptUrl?: string;
}
