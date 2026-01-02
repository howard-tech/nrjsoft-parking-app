import { PaymentResult } from '@types/payment';
import { confirmPayment, initStripe } from '@stripe/stripe-react-native';

export const stripeService = {
    initialize: async (publishableKey?: string): Promise<void> => {
        if (publishableKey) {
            await initStripe({ publishableKey });
        }
    },

    confirmCardPayment: async (
        clientSecret: string,
        paymentMethodId?: string
    ): Promise<PaymentResult> => {
        if (!clientSecret) {
            return { success: false, errorMessage: 'Missing client secret' };
        }

        try {
            const { paymentIntent, error } = await confirmPayment(clientSecret, {
                paymentMethodType: 'Card',
                paymentMethodId,
            });

            if (error) {
                return { success: false, errorMessage: error.message };
            }

            return {
                success: true,
                status: paymentIntent?.status as PaymentResult['status'],
            };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Payment failed';
            return { success: false, errorMessage: message };
        }
    },
};
