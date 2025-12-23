import { Request, Response } from 'express';
import { Zone, ParkingSession } from '../types';
import { zoneStore, sessionStore } from '../services/data.store';

// Socket.io instance
let ioInstance: any = null;

export function setOnstreetSocketIO(io: any): void {
    ioInstance = io;
}

export class OnstreetController {
    // GET /onstreet/zones
    getZones = async (req: Request, res: Response): Promise<void> => {
        const { lat, lng, radius = 2000 } = req.query;
        const zones = Array.from(zoneStore.values());

        if (!lat || !lng) {
            // Return all zones if no coordinates
            res.json({ zones, total: zones.length });
            return;
        }

        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const radiusMeters = parseInt(radius as string, 10);

        // Simple distance calculation
        const nearbyZones = zones.filter((zone) => {
            const dlat = zone.location.lat - latitude;
            const dlng = zone.location.lng - longitude;
            const distance = Math.sqrt(dlat * dlat + dlng * dlng) * 111000; // Rough meters
            return distance <= radiusMeters;
        });

        res.json({ zones: nearbyZones, total: nearbyZones.length });
    };

    // GET /onstreet/zones/:id
    getZone = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        const zone = zoneStore.get(id);

        if (!zone) {
            res.status(404).json({ error: 'Zone not found' });
            return;
        }

        res.json(zone);
    };

    // POST /onstreet/quote
    getQuote = async (req: Request, res: Response): Promise<void> => {
        const { zoneId, duration } = req.body;

        if (!zoneId || !duration) {
            res.status(400).json({ error: 'Zone ID and duration required' });
            return;
        }

        const zone = zoneStore.get(zoneId);

        if (!zone) {
            res.status(404).json({ error: 'Zone not found' });
            return;
        }

        const durationMinutes = parseInt(duration as string, 10);

        // Check max duration
        if (durationMinutes > zone.maxDuration) {
            res.status(400).json({
                error: `Maximum duration for this zone is ${zone.maxDuration} minutes`,
            });
            return;
        }

        const totalFee =
            Math.round((durationMinutes / 60) * zone.hourlyRate * 100) / 100;

        res.json({
            zoneId,
            zoneName: zone.name,
            zoneType: zone.type,
            duration: durationMinutes,
            hourlyRate: zone.hourlyRate,
            totalFee,
            currency: zone.currency,
        });
    };

    // POST /onstreet/sessions
    startSession = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { zoneId, vehiclePlate, duration } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!zoneId || !vehiclePlate || !duration) {
            res
                .status(400)
                .json({ error: 'Zone ID, vehicle plate, and duration required' });
            return;
        }

        // Check for existing active session
        const existingSession = Array.from(sessionStore.values()).find(
            (s) => s.userId === userId && s.status === 'active' && s.zoneId !== undefined
        );

        if (existingSession) {
            res.status(400).json({ error: 'Already have an active on-street session' });
            return;
        }

        const zone = zoneStore.get(zoneId);

        if (!zone) {
            res.status(404).json({ error: 'Zone not found' });
            return;
        }

        const durationMinutes = parseInt(duration as string, 10);
        const totalFee =
            Math.round((durationMinutes / 60) * zone.hourlyRate * 100) / 100;

        const session: ParkingSession = {
            id: `onstreet_${Date.now()}`,
            userId,
            zoneId,
            zoneName: zone.name,
            vehiclePlate: vehiclePlate.toUpperCase(),
            entryMethod: 'MANUAL',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + durationMinutes * 60000).toISOString(),
            status: 'active',
            hourlyRate: zone.hourlyRate,
            currency: zone.currency,
            elapsedMinutes: durationMinutes,
            totalFee,
            paymentStatus: 'paid',
        };

        sessionStore.set(session.id, session);

        // Emit via WebSocket
        if (ioInstance) {
            ioInstance.to(`user_${userId}`).emit('ONSTREET_SESSION_START', session);
        }

        res.status(201).json(session);
    };

    // GET /onstreet/sessions/active
    getActiveSession = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const activeSession = Array.from(sessionStore.values()).find(
            (s) => s.userId === userId && s.status === 'active' && s.zoneId !== undefined
        );

        if (!activeSession) {
            res.json({ hasActiveSession: false });
            return;
        }

        // Calculate remaining time
        const endTime = new Date(activeSession.endTime!).getTime();
        const remainingMs = endTime - Date.now();
        const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));

        // Check if expired
        if (remainingMinutes <= 0) {
            activeSession.status = 'completed';
            sessionStore.set(activeSession.id, activeSession);

            if (ioInstance) {
                ioInstance.to(`user_${userId}`).emit('ONSTREET_SESSION_EXPIRED', activeSession);
            }

            res.json({ hasActiveSession: false, expiredSession: activeSession });
            return;
        }

        res.json({
            hasActiveSession: true,
            session: {
                ...activeSession,
                remainingMinutes,
            },
        });
    };

    // POST /onstreet/sessions/:id/extend
    extendSession = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { id } = req.params;
        const { duration } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!duration) {
            res.status(400).json({ error: 'Duration required' });
            return;
        }

        const session = sessionStore.get(id);

        if (!session || session.userId !== userId) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        if (session.status !== 'active') {
            res.status(400).json({ error: 'Session is not active' });
            return;
        }

        const zone = zoneStore.get(session.zoneId!);
        if (!zone) {
            res.status(404).json({ error: 'Zone not found' });
            return;
        }

        const additionalMinutes = parseInt(duration as string, 10);
        const additionalFee =
            Math.round((additionalMinutes / 60) * zone.hourlyRate * 100) / 100;

        // Extend end time
        const currentEndTime = new Date(session.endTime!).getTime();
        const newEndTime = new Date(currentEndTime + additionalMinutes * 60000);

        session.endTime = newEndTime.toISOString();
        session.elapsedMinutes = (session.elapsedMinutes || 0) + additionalMinutes;
        session.totalFee = (session.totalFee || 0) + additionalFee;

        sessionStore.set(id, session);

        // Emit via WebSocket
        if (ioInstance) {
            ioInstance.to(`user_${userId}`).emit('ONSTREET_SESSION_EXTENDED', session);
        }

        res.json({
            success: true,
            session,
            additionalFee,
        });
    };

    // POST /onstreet/sessions/:id/stop
    stopSession = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const session = sessionStore.get(id);

        if (!session || session.userId !== userId) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        if (session.status !== 'active') {
            res.status(400).json({ error: 'Session is not active' });
            return;
        }

        // Calculate refund (if any time remaining)
        const endTime = new Date(session.endTime!).getTime();
        const remainingMs = endTime - Date.now();
        const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));

        const refundAmount =
            Math.round((remainingMinutes / 60) * session.hourlyRate * 100) / 100;

        session.status = 'completed';
        session.endTime = new Date().toISOString();

        const actualMinutes = (session.elapsedMinutes || 0) - remainingMinutes;
        session.elapsedMinutes = actualMinutes;
        session.totalFee = (session.totalFee || 0) - refundAmount;

        sessionStore.set(id, session);

        // Emit via WebSocket
        if (ioInstance) {
            ioInstance.to(`user_${userId}`).emit('ONSTREET_SESSION_STOPPED', session);
        }

        res.json({
            success: true,
            session,
            refundAmount: refundAmount > 0 ? refundAmount : 0,
        });
    };
}
