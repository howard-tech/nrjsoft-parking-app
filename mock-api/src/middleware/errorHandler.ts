import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
    statusCode?: number;
    details?: unknown;
}

export function errorHandler(
    err: ApiError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void {
    console.error('[Error]', err.message, err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err.details,
        }),
    });
}

// Helper function to create API errors
export function createError(
    message: string,
    statusCode: number = 500,
    details?: unknown
): ApiError {
    const error: ApiError = new Error(message);
    error.statusCode = statusCode;
    error.details = details;
    return error;
}
