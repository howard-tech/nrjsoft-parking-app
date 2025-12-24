import { Request, Response, NextFunction } from 'express';
import { shouldSimulateError } from '../services/simulation.service';

export function simulationErrorMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Avoid breaking health/docs endpoints
    if (req.path === '/health' || req.path.startsWith('/api-docs')) {
        next();
        return;
    }

    if (shouldSimulateError()) {
        res.status(500).json({
            success: false,
            error: 'Simulated error (testing mode)',
            path: req.path,
        });
        return;
    }

    next();
}
