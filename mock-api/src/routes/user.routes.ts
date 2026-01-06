import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

// GET /me
router.get('/', controller.getProfile);

// PUT /me
router.put('/', controller.updateProfile);

// GET /me/vehicles
router.get('/vehicles', controller.getVehicles);

// POST /me/vehicles
router.post('/vehicles', controller.addVehicle);

// PUT /me/vehicles/:id
router.put('/vehicles/:id', controller.updateVehicle);

// DELETE /me/vehicles/:id
router.delete('/vehicles/:id', controller.deleteVehicle);

// Notification preferences
router.get('/notification-preferences', controller.getNotificationPreferences);
router.put('/notification-preferences', controller.updateNotificationPreferences);

export default router;
