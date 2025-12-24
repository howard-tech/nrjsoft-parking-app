import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { getSimulatedDelay } from '../services/simulation.service';

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
    const baseDelay = customDelay
        ? parseInt(customDelay as string, 10)
        : getSimulatedDelay(config.responseDelay);

    if (baseDelay > 0) {
        setTimeout(next, baseDelay);
    } else {
        next();
    }
}
