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

export default router;
