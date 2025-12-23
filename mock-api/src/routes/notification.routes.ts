import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const controller = new NotificationController();

// GET /notifications
router.get('/', controller.getNotifications);

// PUT /notifications/:id/read
router.put('/:id/read', controller.markAsRead);

// PUT /notifications/read-all
router.put('/read-all', controller.markAllAsRead);

// POST /devices/register
router.post('/devices/register', controller.registerDevice);

// DELETE /devices/unregister
router.delete('/devices/unregister', controller.unregisterDevice);

export default router;
