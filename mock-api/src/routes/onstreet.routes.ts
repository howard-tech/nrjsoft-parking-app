import { Router } from 'express';
import { OnstreetController } from '../controllers/onstreet.controller';

const router = Router();
const controller = new OnstreetController();

// GET /onstreet/zones
router.get('/zones', controller.getZones);

// GET /onstreet/zones/:id
router.get('/zones/:id', controller.getZone);

// POST /onstreet/quote
router.post('/quote', controller.getQuote);

// GET /onstreet/sessions/active
router.get('/sessions/active', controller.getActiveSession);

// POST /onstreet/sessions
router.post('/sessions', controller.startSession);

// POST /onstreet/sessions/:id/extend
router.post('/sessions/:id/extend', controller.extendSession);

// POST /onstreet/sessions/:id/stop
router.post('/sessions/:id/stop', controller.stopSession);

export default router;
