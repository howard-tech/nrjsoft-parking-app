import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';

const jwtService = new JwtService();

// Paths that don't require authentication
const publicPaths = [
    '/health',
    '/api-docs',
    '/api/v1/auth/otp-request',
    '/api/v1/auth/otp-verify',
    '/api/v1/auth/social/google',
    '/api/v1/auth/social/apple',
    '/api/v1/auth/refresh',
];

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Skip auth for public paths
    if (publicPaths.some((path) => req.path.startsWith(path))) {
        next();
        return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization header required' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwtService.verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
