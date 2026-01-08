import { apiClient } from '@services/api';
import { paymentService } from './paymentService';

jest.mock('@services/api', () => ({
    apiClient: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
    },
}));

jest.mock('./stripeService', () => ({
    stripeService: {
        confirmCardPayment: jest.fn().mockResolvedValue({ success: true }),
    },
}));

jest.mock('./applePayService', () => ({
    applePayService: {
        confirmApplePay: jest.fn().mockResolvedValue({ success: true }),
    },
}));

jest.mock('./googlePayService', () => ({
    googlePayService: {
        confirmGooglePay: jest.fn().mockResolvedValue({ success: true }),
    },
}));

describe('paymentService', () => {
    const mockGet = apiClient.get as jest.Mock;
    const mockPost = apiClient.post as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads payment methods', async () => {
        mockGet.mockResolvedValueOnce({ data: { data: [{ id: 'pm_1', type: 'card' }] } });
        const methods = await paymentService.getPaymentMethods();
        expect(mockGet).toHaveBeenCalledWith('/payment-methods');
        expect(methods).toHaveLength(1);
    });

    it('attaches and detaches payment methods', async () => {
        mockPost.mockResolvedValue({});
        await paymentService.attachPaymentMethod('pm_1', 'card');
        expect(mockPost).toHaveBeenCalledWith('/payment-methods/attach', {
            paymentMethodId: 'pm_1',
            type: 'card',
        });
        await paymentService.detachPaymentMethod('pm_1');
        expect(mockPost).toHaveBeenCalledWith('/payment-methods/detach', { paymentMethodId: 'pm_1' });
    });

    it('creates a payment intent', async () => {
        mockPost.mockResolvedValueOnce({ data: { intent: { id: 'pi_1', amount: 1200, currency: 'EUR' } } });
        const intent = await paymentService.createPaymentIntent(1200, 'EUR');
        expect(mockPost).toHaveBeenCalledWith('/payments/intents', { amount: 1200, currency: 'EUR' });
        expect(intent.id).toBe('pi_1');
    });

    it('confirms a payment intent', async () => {
        mockPost.mockResolvedValueOnce({ data: { result: { success: true } } });
        const result = await paymentService.confirmPayment('pi_1');
        expect(mockPost).toHaveBeenCalledWith('/payments/confirm', { paymentIntentId: 'pi_1' });
        expect(result.success).toBe(true);
    });

    it('charges a payment method', async () => {
        mockPost.mockResolvedValueOnce({ data: { result: { success: true } } });
        const result = await paymentService.chargePayment(500, 'EUR', 'pm_1', 'Test');
        expect(mockPost).toHaveBeenCalledWith('/payments/charge', {
            amount: 500,
            currency: 'EUR',
            paymentMethodId: 'pm_1',
            description: 'Test',
        });
        expect(result.success).toBe(true);
    });

    it('loads transactions', async () => {
        mockGet.mockResolvedValueOnce({ data: { items: [{ id: 'tx_1' }] } });
        const items = await paymentService.getTransactions();
        expect(mockGet).toHaveBeenCalledWith('/transactions');
        expect(items[0].id).toBe('tx_1');
    });
});
