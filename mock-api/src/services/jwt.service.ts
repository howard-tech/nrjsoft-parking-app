import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../types';

export class JwtService {
    generateAccessToken(user: Partial<User>): string {
        const payload = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name
        };
        // Use config for expiry time - cast to any to avoid StringValue type issues
        return jwt.sign(payload, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn
        } as jwt.SignOptions);
    }

    generateRefreshToken(user: Partial<User>): string {
        const payload = { id: user.id };
        // Use config for refresh expiry time
        return jwt.sign(payload, config.jwtSecret, {
            expiresIn: config.jwtRefreshExpiresIn
        } as jwt.SignOptions);
    }

    verifyAccessToken(token: string): User {
        return jwt.verify(token, config.jwtSecret) as User;
    }

    verifyRefreshToken(token: string): { id: string } {
        return jwt.verify(token, config.jwtSecret) as { id: string };
    }
}
