import { Server as SocketIOServer, Socket } from 'socket.io';
import { JwtService } from './jwt.service';

const jwtService = new JwtService();

export function setupWebSocket(io: SocketIOServer): void {
    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwtService.verifyAccessToken(token);
            socket.data.user = decoded;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.user?.id;
        console.log(`[WebSocket] User connected: ${userId}`);

        // Join user's personal room for targeted messages
        socket.join(`user_${userId}`);

        // Handle session updates request
        socket.on('REQUEST_SESSION_UPDATE', (sessionId: string) => {
            console.log(`[WebSocket] Session update requested for: ${sessionId}`);

            // Simulate periodic updates every minute
            const interval = setInterval(() => {
                const now = new Date();
                socket.emit('SESSION_UPDATE', {
                    sessionId,
                    timestamp: now.toISOString(),
                    message: 'Session still active',
                });
            }, 60000);

            socket.on('disconnect', () => {
                clearInterval(interval);
            });

            socket.on('STOP_SESSION_UPDATES', () => {
                clearInterval(interval);
            });
        });

        // Handle garage availability updates
        socket.on('SUBSCRIBE_GARAGE', (garageId: string) => {
            console.log(`[WebSocket] Subscribed to garage: ${garageId}`);
            socket.join(`garage_${garageId}`);
        });

        socket.on('UNSUBSCRIBE_GARAGE', (garageId: string) => {
            socket.leave(`garage_${garageId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[WebSocket] User disconnected: ${userId}`);
        });
    });
}

// Helper function to emit events to specific users
export function emitToUser(
    io: SocketIOServer,
    userId: string,
    event: string,
    data: unknown
): void {
    io.to(`user_${userId}`).emit(event, data);
}

// Helper function to emit garage updates
export function emitGarageUpdate(
    io: SocketIOServer,
    garageId: string,
    data: unknown
): void {
    io.to(`garage_${garageId}`).emit('GARAGE_UPDATE', data);
}
