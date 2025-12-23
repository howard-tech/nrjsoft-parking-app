import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const controller = new PaymentController();

// GET /payment-methods (aligned with spec)
router.get('/', controller.getPaymentMethods);

// POST /payment-methods
router.post('/', controller.addPaymentMethod);

// DELETE /payment-methods/:id
router.delete('/:id', controller.deletePaymentMethod);

export default router;
