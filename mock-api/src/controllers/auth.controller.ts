import { Request, Response } from 'express';
import { JwtService } from '../services/jwt.service';
import { OtpService } from '../services/otp.service';
import { User } from '../types';
import {
    userStore,
    findUserByPhone,
    findUserByEmail,
    createUser,
    getUser,
} from '../services/data.store';

const jwtService = new JwtService();
const otpService = new OtpService();

export class AuthController {
    // POST /auth/otp-request
    requestOtp = async (req: Request, res: Response): Promise<void> => {
        const { phone, email } = req.body;

        if (!phone && !email) {
            res.status(400).json({ error: 'Phone or email required' });
            return;
        }

        const identifier = phone || email;
        const otp = otpService.generate(identifier);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            // In dev mode, return OTP for convenience
            ...(process.env.NODE_ENV !== 'production' && { otp }),
        });
    };

    // POST /auth/otp-verify
    verifyOtp = async (req: Request, res: Response): Promise<void> => {
        const { phone, email, otp } = req.body;
        const identifier = phone || email;

        if (!identifier || !otp) {
            res.status(400).json({ error: 'Phone/email and OTP required' });
            return;
        }

        // Verify OTP (123456 always works in mock)
        if (!otpService.verify(identifier, otp)) {
            res.status(401).json({ error: 'Invalid OTP' });
            return;
        }

        // Find existing user or create new one (using centralized store)
        let user = phone ? findUserByPhone(phone) : findUserByEmail(email);

        if (!user) {
            user = createUser({
                id: `user_${Date.now()}`,
                phone,
                email,
                name: 'New User',
                provider: phone ? 'phone' : 'email',
                createdAt: new Date().toISOString(),
            });
        }

        const accessToken = jwtService.generateAccessToken(user);
        const refreshToken = jwtService.generateRefreshToken(user);

        res.json({
            accessToken,
            refreshToken,
            expiresIn: 3600,
            user,
        });
    };

    // POST /auth/social/google
    googleAuth = async (req: Request, res: Response): Promise<void> => {
        const { idToken } = req.body;

        if (!idToken) {
            res.status(400).json({ error: 'Google ID token required' });
            return;
        }

        // Mock Google authentication - create/find user (using centralized store)
        let user = getUser('user_google_123');

        if (!user) {
            user = createUser({
                id: 'user_google_123',
                email: 'google.user@gmail.com',
                name: 'Google User',
                provider: 'google',
                createdAt: new Date().toISOString(),
            });
        }

        const accessToken = jwtService.generateAccessToken(user);
        const refreshToken = jwtService.generateRefreshToken(user);

        res.json({
            accessToken,
            refreshToken,
            expiresIn: 3600,
            user,
        });
    };

    // POST /auth/social/apple
    appleAuth = async (req: Request, res: Response): Promise<void> => {
        const { identityToken } = req.body;

        if (!identityToken) {
            res.status(400).json({ error: 'Apple identity token required' });
            return;
        }

        // Mock Apple authentication - create/find user (using centralized store)
        let user = getUser('user_apple_123');

        if (!user) {
            user = createUser({
                id: 'user_apple_123',
                email: 'apple.user@icloud.com',
                name: 'Apple User',
                provider: 'apple',
                createdAt: new Date().toISOString(),
            });
        }

        const accessToken = jwtService.generateAccessToken(user);
        const refreshToken = jwtService.generateRefreshToken(user);

        res.json({
            accessToken,
            refreshToken,
            expiresIn: 3600,
            user,
        });
    };

    // POST /auth/refresh
    refreshToken = async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token required' });
            return;
        }

        try {
            const decoded = jwtService.verifyRefreshToken(refreshToken);
            const user = getUser(decoded.id);

            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }

            const accessToken = jwtService.generateAccessToken(user);

            res.json({
                accessToken,
                expiresIn: 3600,
            });
        } catch {
            res.status(401).json({ error: 'Invalid refresh token' });
        }
    };

    // POST /auth/logout
    logout = async (req: Request, res: Response): Promise<void> => {
        // In a real app, we would invalidate the refresh token
        res.json({ success: true, message: 'Logged out successfully' });
    };
}
