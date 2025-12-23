import jwt, { SignOptions } from 'jsonwebtoken';
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
        const options: SignOptions = { expiresIn: '1h' };
        return jwt.sign(payload, config.jwtSecret, options);
    }

    generateRefreshToken(user: Partial<User>): string {
        const payload = { id: user.id };
        const options: SignOptions = { expiresIn: '7d' };
        return jwt.sign(payload, config.jwtSecret, options);
    }

    verifyAccessToken(token: string): User {
        return jwt.verify(token, config.jwtSecret) as User;
    }

    verifyRefreshToken(token: string): { id: string } {
        return jwt.verify(token, config.jwtSecret) as { id: string };
    }
}
