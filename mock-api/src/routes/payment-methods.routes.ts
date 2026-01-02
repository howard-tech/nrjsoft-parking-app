import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const controller = new PaymentController();

// GET /payment-methods (aligned with spec)
router.get('/', controller.getPaymentMethods);

// POST /payment-methods
router.post('/', controller.addPaymentMethod);

// POST /payment-methods/attach
router.post('/attach', controller.attachPaymentMethod);

// POST /payment-methods/detach
router.post('/detach', controller.detachPaymentMethod);

// POST /payment-methods/set-default
router.post('/set-default', controller.setDefaultPaymentMethod);

// DELETE /payment-methods/:id
router.delete('/:id', controller.deletePaymentMethod);

export default router;
