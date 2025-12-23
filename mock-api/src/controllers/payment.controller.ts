import { Request, Response } from 'express';
import { PaymentMethod } from '../types';
import { paymentMethodStore } from '../services/data.store';

export class PaymentController {
    // GET /payment-methods
    getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const userMethods = Array.from(paymentMethodStore.values()).filter(
            (pm) => pm.userId === userId
        );

        res.json(userMethods);
    };

    // POST /payment-methods
    addPaymentMethod = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { type, token, isDefault } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!type) {
            res.status(400).json({ error: 'Payment method type required' });
            return;
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            Array.from(paymentMethodStore.values())
                .filter((pm) => pm.userId === userId)
                .forEach((pm) => {
                    paymentMethodStore.set(pm.id, { ...pm, isDefault: false });
                });
        }

        // Create mock payment method based on type
        let paymentMethod: PaymentMethod;

        if (type === 'card') {
            paymentMethod = {
                id: `pm_${Date.now()}`,
                userId,
                type: 'card',
                last4: '4242',
                brand: 'Visa',
                expiryMonth: 12,
                expiryYear: 2027,
                isDefault: isDefault || false,
                createdAt: new Date().toISOString(),
            };
        } else if (type === 'apple_pay') {
            paymentMethod = {
                id: `pm_${Date.now()}`,
                userId,
                type: 'apple_pay',
                isDefault: isDefault || false,
                createdAt: new Date().toISOString(),
            };
        } else if (type === 'google_pay') {
            paymentMethod = {
                id: `pm_${Date.now()}`,
                userId,
                type: 'google_pay',
                isDefault: isDefault || false,
                createdAt: new Date().toISOString(),
            };
        } else {
            res.status(400).json({ error: 'Invalid payment method type' });
            return;
        }

        paymentMethodStore.set(paymentMethod.id, paymentMethod);

        res.status(201).json(paymentMethod);
    };

    // DELETE /payment-methods/:id
    deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const paymentMethod = paymentMethodStore.get(id);

        if (!paymentMethod || paymentMethod.userId !== userId) {
            res.status(404).json({ error: 'Payment method not found' });
            return;
        }

        paymentMethodStore.delete(id);

        res.json({ success: true, message: 'Payment method deleted' });
    };

    // POST /payments/intents
    createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { amount, currency = 'EUR', description, sessionId } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!amount || amount <= 0) {
            res.status(400).json({ error: 'Valid amount required' });
            return;
        }

        const intent = {
            id: `pi_${Date.now()}`,
            amount,
            currency,
            description,
            sessionId,
            status: 'requires_payment_method',
            clientSecret: `pi_${Date.now()}_secret_mock`,
            createdAt: new Date().toISOString(),
        };

        res.json(intent);
    };

    // POST /payments/confirm
    confirmPayment = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { intentId, paymentMethodId } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!intentId) {
            res.status(400).json({ error: 'Payment intent ID required' });
            return;
        }

        // Mock successful payment
        res.json({
            success: true,
            intentId,
            status: 'succeeded',
            message: 'Payment completed successfully',
        });
    };

    // POST /payments/apple-pay
    processApplePay = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { paymentToken, amount } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Mock Apple Pay processing
        res.json({
            success: true,
            transactionId: `ap_${Date.now()}`,
            amount,
            message: 'Apple Pay payment successful',
        });
    };

    // POST /payments/google-pay
    processGooglePay = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { paymentToken, amount } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Mock Google Pay processing
        res.json({
            success: true,
            transactionId: `gp_${Date.now()}`,
            amount,
            message: 'Google Pay payment successful',
        });
    };
}
