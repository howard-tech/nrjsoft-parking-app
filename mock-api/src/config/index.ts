export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    jwtSecret: process.env.JWT_SECRET || 'mock-jwt-secret-key-nrjsoft-parking',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    responseDelay: parseInt(process.env.RESPONSE_DELAY || '200', 10),
    environment: process.env.NODE_ENV || 'development',
};
