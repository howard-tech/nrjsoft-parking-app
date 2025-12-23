import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const controller = new PaymentController();

// GET /payment-methods
router.get('/methods', controller.getPaymentMethods);

// POST /payment-methods
router.post('/methods', controller.addPaymentMethod);

// DELETE /payment-methods/:id
router.delete('/methods/:id', controller.deletePaymentMethod);

// POST /payments/intents
router.post('/intents', controller.createPaymentIntent);

// POST /payments/confirm
router.post('/confirm', controller.confirmPayment);

// POST /payments/apple-pay
router.post('/apple-pay', controller.processApplePay);

// POST /payments/google-pay
router.post('/google-pay', controller.processGooglePay);

export default router;
