import { httpServer } from './app';
import { config } from './config';

const PORT = config.port;
const HOST = process.env.HOST || '127.0.0.1';

httpServer.listen(PORT, HOST, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║       NRJSoft Parking - Mock API Server                ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  🚀 Server running at: http://${HOST}:${PORT}           ║`);
    console.log(`║  📚 API Base URL:      http://${HOST}:${PORT}/api/v1    ║`);
    console.log('║  🔌 WebSocket:         Enabled                         ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║  📋 Available Endpoints:                               ║');
    console.log('║     POST /api/v1/auth/otp-request                      ║');
    console.log('║     POST /api/v1/auth/otp-verify (OTP: 123456)         ║');
    console.log('║     GET  /api/v1/parking/nearby?lat=43.83&lng=25.96    ║');
    console.log('║     GET  /api/v1/sessions/active                       ║');
    console.log('║     GET  /api/v1/wallet                                ║');
    console.log('║     GET  /api/v1/onstreet/zones                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    httpServer.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    httpServer.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
