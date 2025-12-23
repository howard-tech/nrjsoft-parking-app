import { Request, Response } from 'express';
import { ParkingSession } from '../types';
import { sessionStore, garageStore } from '../services/data.store';

// Socket.io instance will be set from app.ts
let ioInstance: any = null;

export function setSocketIO(io: any): void {
    ioInstance = io;
}

export class SessionController {
    // GET /sessions/active
    getActive = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Filter for active GARAGE sessions only
        const activeSession = Array.from(sessionStore.values()).find(
            (s) => s.userId === userId && s.status === 'active' && s.garageId !== undefined
        );

        if (!activeSession) {
            res.json({ hasActiveSession: false });
            return;
        }

        // Calculate current fee
        const elapsedMinutes = Math.floor(
            (Date.now() - new Date(activeSession.startTime).getTime()) / 60000
        );
        const currentFee =
            Math.round((elapsedMinutes / 60) * activeSession.hourlyRate * 100) / 100;

        res.json({
            hasActiveSession: true,
            session: {
                ...activeSession,
                elapsedMinutes,
                currentFee,
            },
        });
    };

    // POST /sessions
    startSession = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { garageId, vehiclePlate, entryMethod = 'ANPR' } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!garageId || !vehiclePlate) {
            res.status(400).json({ error: 'Garage ID and vehicle plate required' });
            return;
        }

        // Check if user already has an active GARAGE session
        const existingSession = Array.from(sessionStore.values()).find(
            (s) => s.userId === userId && s.status === 'active' && s.garageId !== undefined
        );

        if (existingSession) {
            res.status(400).json({ error: 'Already have an active garage session' });
            return;
        }

        // Find garage in store
        const garage = garageStore.get(garageId);
        if (!garage) {
            res.status(404).json({ error: 'Garage not found' });
            return;
        }

        const session: ParkingSession = {
            id: `session_${Date.now()}`,
            userId,
            garageId,
            garageName: garage.name,
            vehiclePlate: vehiclePlate.toUpperCase(),
            entryMethod: entryMethod as 'ANPR' | 'QR' | 'MANUAL',
            startTime: new Date().toISOString(),
            status: 'active',
            hourlyRate: garage.hourlyRate,
            currency: garage.currency,
        };

        sessionStore.set(session.id, session);

        // Emit via WebSocket
        if (ioInstance) {
            ioInstance.to(`user_${userId}`).emit('SESSION_START', session);
        }

        res.status(201).json(session);
    };

    // GET /sessions/:id
    getSession = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const session = sessionStore.get(id);

        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        // Only return session if it belongs to the user
        if (session.userId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        // Ensure this is a garage session
        if (!session.garageId) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        // If active, calculate current fee
        if (session.status === 'active') {
            const elapsedMinutes = Math.floor(
                (Date.now() - new Date(session.startTime).getTime()) / 60000
            );
            const currentFee =
                Math.round((elapsedMinutes / 60) * session.hourlyRate * 100) / 100;

            res.json({ ...session, elapsedMinutes, currentFee });
            return;
        }

        res.json(session);
    };

    // POST /sessions/:id/end
    endSession = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const session = sessionStore.get(id);

        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        if (session.userId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        if (session.status !== 'active') {
            res.status(400).json({ error: 'Session is not active' });
            return;
        }

        // Ensure this is a garage session
        if (!session.garageId) {
            res.status(400).json({ error: 'Invalid session type for this endpoint' });
            return;
        }

        // Calculate final fee
        const endTime = new Date();
        const elapsedMinutes = Math.floor(
            (endTime.getTime() - new Date(session.startTime).getTime()) / 60000
        );
        const totalFee =
            Math.round((elapsedMinutes / 60) * session.hourlyRate * 100) / 100;

        const completedSession: ParkingSession = {
            ...session,
            endTime: endTime.toISOString(),
            status: 'completed',
            elapsedMinutes,
            totalFee,
            paymentStatus: 'paid', // Assume auto-payment for mock
        };

        sessionStore.set(id, completedSession);

        // Emit via WebSocket
        if (ioInstance) {
            ioInstance.to(`user_${userId}`).emit('SESSION_END', completedSession);
        }

        res.json(completedSession);
    };

    // POST /sessions/:id/extend
    extendSession = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { minutes = 60 } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const session = sessionStore.get(id);

        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        if (session.userId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        // Ensure this is a garage session
        if (!session.garageId) {
            res.status(400).json({ error: 'Invalid session type for this endpoint' });
            return;
        }

        // In a real app, this would extend pre-paid time
        // For mock, we just acknowledge the extension
        res.json({
            success: true,
            message: `Session extended by ${minutes} minutes`,
            session,
        });
    };

    // GET /sessions/history
    getHistory = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { page = 1, limit = 20 } = req.query;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get COMPLETED garage sessions for user, sorted by date desc
        const userSessions = Array.from(sessionStore.values())
            .filter((s) => s.userId === userId && s.garageId !== undefined && s.status === 'completed')
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        const paginated = userSessions.slice(startIndex, endIndex);

        res.json({
            sessions: paginated,
            total: userSessions.length,
            page: pageNum,
            totalPages: Math.ceil(userSessions.length / limitNum),
            hasMore: endIndex < userSessions.length,
        });
    };
}
