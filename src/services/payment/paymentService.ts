import { apiClient } from '@services/api';
import { PaymentIntent, PaymentMethod, PaymentResult, Transaction } from '@types/payment';
import { stripeService } from './stripeService';
import { applePayService } from './applePayService';
import { googlePayService } from './googlePayService';

export interface CreatePaymentContext {
    sessionId?: string;
    type?: string;
    metadata?: Record<string, unknown>;
}

export const paymentService = {
    getPaymentMethods: async (): Promise<PaymentMethod[]> => {
        const response = await apiClient.get<{ data?: PaymentMethod[]; methods?: PaymentMethod[] }>(
            '/payment-methods'
        );
        return response.data?.data ?? response.data?.methods ?? [];
    },

    attachPaymentMethod: async (paymentMethodId: string, type?: PaymentMethod['type']): Promise<void> => {
        await apiClient.post('/payment-methods/attach', { paymentMethodId, type });
    },

    detachPaymentMethod: async (paymentMethodId: string): Promise<void> => {
        await apiClient.post('/payment-methods/detach', { paymentMethodId });
    },

    setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
        await apiClient.post('/payment-methods/set-default', { paymentMethodId });
    },

    createPaymentIntent: async (
        amount: number,
        currency: string,
        context?: CreatePaymentContext
    ): Promise<PaymentIntent> => {
        const response = await apiClient.post<{ data?: PaymentIntent; intent?: PaymentIntent }>(
            '/payments/intents',
            {
                amount,
                currency,
                ...context,
            }
        );
        return response.data?.data ?? response.data?.intent ?? {
            id: `pi_${Date.now()}`,
            amount,
            currency,
            status: 'requires_payment_method',
        };
    },

    confirmPayment: async (paymentIntentId: string): Promise<PaymentResult> => {
        const response = await apiClient.post<{ data?: PaymentResult; result?: PaymentResult }>(
            '/payments/confirm',
            { paymentIntentId }
        );
        return response.data?.data ?? response.data?.result ?? { success: true };
    },

    processCardPayment: async (
        clientSecret: string,
        paymentMethodId?: string
    ): Promise<PaymentResult> => stripeService.confirmCardPayment(clientSecret, paymentMethodId),

    processApplePay: async (clientSecret: string): Promise<PaymentResult> =>
        applePayService.confirmApplePay(clientSecret),

    processGooglePay: async (clientSecret: string): Promise<PaymentResult> =>
        googlePayService.confirmGooglePay(clientSecret),

    chargePayment: async (
        amount: number,
        currency: string,
        paymentMethodId: string,
        description?: string
    ): Promise<PaymentResult> => {
        const response = await apiClient.post<{ data?: PaymentResult; result?: PaymentResult }>(
            '/payments/charge',
            { amount, currency, paymentMethodId, description }
        );
        return response.data?.data ?? response.data?.result ?? { success: true };
    },

    getTransactions: async (): Promise<Transaction[]> => {
        const response = await apiClient.get<{ data?: Transaction[]; items?: Transaction[] }>(
            '/transactions'
        );
        return response.data?.data ?? response.data?.items ?? [];
    },
};
