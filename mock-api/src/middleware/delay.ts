import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function delayMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Skip delay for health checks
    if (req.path === '/health') {
        next();
        return;
    }

    // Check for custom delay header (for testing)
    const customDelay = req.headers['x-mock-delay'];
    const delay = customDelay
        ? parseInt(customDelay as string, 10)
        : config.responseDelay;

    if (delay > 0) {
        setTimeout(next, delay);
    } else {
        next();
    }
}
