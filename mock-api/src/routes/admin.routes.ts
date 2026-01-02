import { Router, Request, Response } from 'express';
import { seedDatabase, GeneratedData } from '../generators';
import {
    userStore, vehicleStore, garageStore, sessionStore,
    zoneStore, walletStore, transactionStore, notificationStore,
    paymentMethodStore, clearAllData
} from '../services/data.store';
import { seededGarages } from '../generators/garageSeed';
import { anprSimulator } from '../services/anpr.service';
import { getSimulationConfig, updateSimulationConfig, startSessionCostTicker, stopSessionCostTicker } from '../services/simulation.service';
import { paymentSimulator } from '../services/payment-simulator.service';
import { emitToUser } from '../services/websocket.service';
import { io } from '../app';

const router = Router();

// Store for generated data
let generatedData: GeneratedData | null = null;

function populateStores(data: GeneratedData) {
    clearAllData();

    data.users.forEach(u => userStore.set(u.id, u));
    data.vehicles.forEach(v => vehicleStore.set(v.id, v));
    data.garages.forEach(g => garageStore.set(g.id, g));
    data.sessions.forEach(s => sessionStore.set(s.id, s));
    data.zones.forEach(z => zoneStore.set(z.id, z));
    data.wallets.forEach(w => walletStore.set(w.id, w));
    data.transactions.forEach(t => transactionStore.set(t.id, t));
    data.notifications.forEach(n => notificationStore.set(n.id, n));
    data.paymentMethods.forEach(p => paymentMethodStore.set(p.id, p));

    // Inject seeded garages near emulator location
    seededGarages.forEach((garage) => {
        garageStore.set(garage.id, {
            id: garage.id,
            name: garage.name,
            address: garage.address ?? 'Test Address',
            location: { lat: garage.latitude, lng: garage.longitude },
            entryMethod: 'QR',
            availableSlots: garage.availableSpots ?? 20,
            totalSlots: garage.totalSpots ?? 100,
            hourlyRate: garage.pricing?.hourly ?? 2.5,
            currency: garage.pricing?.currency ?? 'EUR',
            features: {},
            policies: { prepayRequired: false },
        });
    });
}

// Initialize with generated data on module load
export function initializeGeneratedData(): GeneratedData {
    if (!generatedData) {
        generatedData = seedDatabase({
            userCount: 20,
            garageCount: 30,
            zoneCount: 30,
        });
        populateStores(generatedData);
    }
    return generatedData;
}

// Get current generated data
export function getGeneratedData(): GeneratedData | null {
    return generatedData;
}

// POST /admin/reset - Reset all data
router.post('/reset', (req: Request, res: Response) => {
    console.log('🔄 Resetting data...');

    // Regenerate data
    generatedData = seedDatabase({
        userCount: req.body.userCount || 20,
        garageCount: req.body.garageCount || 30,
        zoneCount: req.body.zoneCount || 30,
    });

    // Repopulate data stores (clears old data first)
    populateStores(generatedData);

    res.json({
        success: true,
        message: 'Data reset successfully',
        counts: {
            users: generatedData.users.length,
            vehicles: generatedData.vehicles.length,
            garages: generatedData.garages.length,
            zones: generatedData.zones.length,
            sessions: generatedData.sessions.length,
            wallets: generatedData.wallets.length,
            transactions: generatedData.transactions.length,
            notifications: generatedData.notifications.length,
            paymentMethods: generatedData.paymentMethods.length,
        },
    });
});

// GET /admin/stats - Get current data stats
router.get('/stats', (req: Request, res: Response) => {
    if (!generatedData) {
        initializeGeneratedData();
    }

    res.json({
        users: userStore.size,
        vehicles: vehicleStore.size,
        garages: garageStore.size,
        zones: zoneStore.size,
        sessions: sessionStore.size,
        wallets: walletStore.size,
        transactions: transactionStore.size,
        notifications: notificationStore.size,
        paymentMethods: paymentMethodStore.size,
    });
});

// --- Simulation controls ---

router.get('/simulate/config', (_req: Request, res: Response) => {
    res.json({
        success: true,
        config: getSimulationConfig(),
        activeAnpr: anprSimulator.getActiveVehicles(),
    });
});

router.post('/simulate/config', (req: Request, res: Response) => {
    const updated = updateSimulationConfig(req.body || {});
    res.json({ success: true, config: updated });
});

router.post('/simulate/anpr/entry', (req: Request, res: Response) => {
    try {
        const { garageId, vehiclePlate } = req.body;
        if (!garageId || !vehiclePlate) {
            res.status(400).json({ error: 'garageId and vehiclePlate are required' });
            return;
        }
        const event = anprSimulator.simulateEntry(garageId, vehiclePlate);
        res.json({ success: true, event });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/simulate/anpr/exit', (req: Request, res: Response) => {
    try {
        const { vehiclePlate } = req.body;
        if (!vehiclePlate) {
            res.status(400).json({ error: 'vehiclePlate is required' });
            return;
        }
        const event = anprSimulator.simulateExit(vehiclePlate);
        res.json({ success: true, event });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/simulate/payment', async (req: Request, res: Response) => {
    try {
        const { amount, currency = 'EUR', paymentMethod } = req.body;
        if (!amount || amount <= 0) {
            res.status(400).json({ error: 'Valid amount required' });
            return;
        }
        const intent = paymentSimulator.createIntent(amount, currency);
        const confirmed = await paymentSimulator.confirmIntent(intent.id, paymentMethod);
        res.json({ success: true, intent: confirmed });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/simulate/webhook', (req: Request, res: Response) => {
    const { event = 'payment.succeeded', payload = {} } = req.body || {};
    console.log(`🔔 Webhook simulated: ${event}`, payload);
    res.json({
        success: true,
        delivered: true,
        event,
        payload,
        deliveredAt: new Date().toISOString(),
    });
});

router.post('/simulate/session/tick', (req: Request, res: Response) => {
    const { sessionId, userId } = req.body || {};
    const session = sessionStore.get(sessionId);
    if (!session || !userId) {
        res.status(400).json({ success: false, error: 'sessionId and userId required' });
        return;
    }
    startSessionCostTicker(session);
    if (io) {
        emitToUser(io, userId, 'SESSION_UPDATE', {
            sessionId,
            timestamp: new Date().toISOString(),
            status: session.status,
        });
    }
    res.json({ success: true });
});

router.post('/simulate/session/stop', (req: Request, res: Response) => {
    const { sessionId } = req.body || {};
    if (!sessionId) {
        res.status(400).json({ success: false, error: 'sessionId required' });
        return;
    }
    stopSessionCostTicker(sessionId);
    res.json({ success: true });
});

export default router;
