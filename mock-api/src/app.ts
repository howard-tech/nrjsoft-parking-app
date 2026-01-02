import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import parkingRoutes from './routes/parking.routes';
import sessionRoutes from './routes/session.routes';
import walletRoutes from './routes/wallet.routes';
import paymentMethodsRoutes from './routes/payment-methods.routes';
import paymentRoutes from './routes/payment.routes';
import onstreetRoutes from './routes/onstreet.routes';
import notificationRoutes from './routes/notification.routes';
import deviceRoutes from './routes/device.routes';
import transactionRoutes from './routes/transactions.routes';
import adminRoutes, { initializeGeneratedData } from './routes/admin.routes';

import { authMiddleware } from './middleware/auth';
import { delayMiddleware } from './middleware/delay';
import { errorHandler } from './middleware/errorHandler';
import { setupWebSocket } from './services/websocket.service';
import { setSocketIO } from './controllers/session.controller';
import { setOnstreetSocketIO } from './controllers/onstreet.controller';
import { setSimulationSocket } from './services/simulation.service';
import swaggerDocument from './swagger.json';
import { simulationErrorMiddleware } from './middleware/simulation';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
});

// Pass io to controllers that need it
setSocketIO(io);
setOnstreetSocketIO(io);
setSimulationSocket(io);

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for Swagger UI
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(delayMiddleware);
app.use(simulationErrorMiddleware);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'NRJSoft Parking API',
    customCss: '.swagger-ui .topbar { display: none }',
}));

// Health check (no auth required)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// API version info
app.get('/api/v1', (req, res) => {
    res.json({
        name: 'NRJSoft Parking Mock API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: [
            '/api/v1/auth',
            '/api/v1/me',
            '/api/v1/parking',
            '/api/v1/sessions',
            '/api/v1/wallet',
            '/api/v1/payment-methods',
            '/api/v1/payments',
            '/api/v1/transactions',
            '/api/v1/onstreet',
            '/api/v1/notifications',
            '/api/v1/devices',
        ],
    });
});

// Public routes (no auth)
app.use('/api/v1/auth', authRoutes);

// Protected routes (require auth)
app.use('/api/v1/me', authMiddleware, userRoutes);
app.use('/api/v1/parking', authMiddleware, parkingRoutes);
app.use('/api/v1/sessions', authMiddleware, sessionRoutes);
app.use('/api/v1/wallet', authMiddleware, walletRoutes);
app.use('/api/v1/payment-methods', authMiddleware, paymentMethodsRoutes);
app.use('/api/v1/payments', authMiddleware, paymentRoutes);
app.use('/api/v1/transactions', authMiddleware, transactionRoutes);
app.use('/api/v1/onstreet', authMiddleware, onstreetRoutes);
app.use('/api/v1/notifications', authMiddleware, notificationRoutes);
app.use('/api/v1/devices', authMiddleware, deviceRoutes);

// Admin routes (no auth for dev convenience)
app.use('/api/v1/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
    });
});

// Initialize generated data on startup
initializeGeneratedData();

// WebSocket setup
setupWebSocket(io);

export { app, httpServer, io };
