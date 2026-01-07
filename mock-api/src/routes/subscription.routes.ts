import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';

const router = Router();
const controller = new SubscriptionController();

router.get('/plans', controller.getPlans);
router.get('/active', controller.getActive);
router.post('/', controller.subscribe);
router.post('/:id/cancel', controller.cancel);
router.patch('/:id', controller.update);

export default router;
