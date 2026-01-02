import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const controller = new PaymentController();

// GET /transactions
router.get('/', controller.getTransactions);

export default router;
