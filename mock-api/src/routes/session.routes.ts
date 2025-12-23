import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';

const router = Router();
const controller = new SessionController();

// GET /sessions/active
router.get('/active', controller.getActive);

// GET /sessions/history
router.get('/history', controller.getHistory);

// POST /sessions
router.post('/', controller.startSession);

// GET /sessions/:id
router.get('/:id', controller.getSession);

// POST /sessions/:id/end
router.post('/:id/end', controller.endSession);

// POST /sessions/:id/extend
router.post('/:id/extend', controller.extendSession);

export default router;
