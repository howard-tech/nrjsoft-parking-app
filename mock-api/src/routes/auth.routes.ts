import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

// POST /auth/otp-request
router.post('/otp-request', controller.requestOtp);

// POST /auth/otp-verify
router.post('/otp-verify', controller.verifyOtp);

// POST /auth/social/google
router.post('/social/google', controller.googleAuth);

// POST /auth/social/apple
router.post('/social/apple', controller.appleAuth);

// POST /auth/refresh
router.post('/refresh', controller.refreshToken);

// POST /auth/logout
router.post('/logout', controller.logout);

export default router;
