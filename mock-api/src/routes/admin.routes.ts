import { Router, Request, Response } from 'express';
import { seedDatabase, GeneratedData } from '../generators';
import {
    userStore, vehicleStore, garageStore, sessionStore,
    zoneStore, walletStore, transactionStore, notificationStore,
    paymentMethodStore, clearAllData
} from '../services/data.store';

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

export default router;
