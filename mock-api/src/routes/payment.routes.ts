import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const controller = new PaymentController();

// POST /payments/intents
router.post('/intents', controller.createPaymentIntent);

// POST /payments/confirm
router.post('/confirm', controller.confirmPayment);

// POST /payments/apple-pay
router.post('/apple-pay', controller.processApplePay);

// POST /payments/google-pay
router.post('/google-pay', controller.processGooglePay);

// POST /payments/charge
router.post('/charge', controller.chargePayment);

export default router;
