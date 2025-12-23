import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const controller = new NotificationController();

// POST /devices/register (aligned with spec)
router.post('/register', controller.registerDevice);

// DELETE /devices/unregister
router.delete('/unregister', controller.unregisterDevice);

export default router;
