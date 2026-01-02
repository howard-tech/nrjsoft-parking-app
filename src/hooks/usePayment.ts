import { useCallback, useState } from 'react';
import { paymentService } from '@services/payment/paymentService';
import { PaymentIntent, PaymentMethod, PaymentResult } from '@types/payment';

export const usePayment = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [intent, setIntent] = useState<PaymentIntent | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadMethods = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await paymentService.getPaymentMethods();
            setMethods(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    }, []);

    const createIntent = useCallback(async (amount: number, currency: string) => {
        setLoading(true);
        setError(null);
        try {
            const created = await paymentService.createPaymentIntent(amount, currency);
            setIntent(created);
            return created;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create payment intent');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const confirmCard = useCallback(
        async (clientSecret?: string, paymentMethodId?: string): Promise<PaymentResult> => {
            setLoading(true);
            setError(null);
            try {
                const secret = clientSecret ?? intent?.clientSecret ?? '';
                const result = await paymentService.processCardPayment(secret, paymentMethodId);
                if (!result.success) {
                    setError(result.errorMessage ?? 'Payment failed');
                }
                return result;
            } finally {
                setLoading(false);
            }
        },
        [intent?.clientSecret]
    );

    return {
        methods,
        intent,
        loading,
        error,
        loadMethods,
        createIntent,
        confirmCard,
    };
};
