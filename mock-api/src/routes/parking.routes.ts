import { Router } from 'express';
import { ParkingController } from '../controllers/parking.controller';

const router = Router();
const controller = new ParkingController();

// GET /parking/nearby
router.get('/nearby', controller.getNearby);

// GET /parking/search
router.get('/search', controller.search);

// GET /parking/:garageId
router.get('/:garageId', controller.getGarage);

export default router;
