import { Router, Request, Response } from 'express';
import { seedDatabase, GeneratedData } from '../generators';
import {
    userStore, vehicleStore
} from '../services/data.store';

const router = Router();

// Store for generated data
let generatedData: GeneratedData | null = null;

// Initialize with generated data on module load
export function initializeGeneratedData(): GeneratedData {
    if (!generatedData) {
        generatedData = seedDatabase({
            userCount: 20,
            garageCount: 30,
            zoneCount: 30,
        });

        // Populate data stores
        generatedData.users.forEach((user) => {
            userStore.set(user.id, user);
        });

        generatedData.vehicles.forEach((vehicle) => {
            vehicleStore.set(vehicle.id, vehicle);
        });
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

    // Clear existing stores
    userStore.clear();
    vehicleStore.clear();

    // Regenerate data
    generatedData = seedDatabase({
        userCount: req.body.userCount || 20,
        garageCount: req.body.garageCount || 30,
        zoneCount: req.body.zoneCount || 30,
    });

    // Repopulate data stores
    generatedData.users.forEach((user) => {
        userStore.set(user.id, user);
    });

    generatedData.vehicles.forEach((vehicle) => {
        vehicleStore.set(vehicle.id, vehicle);
    });

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
        users: generatedData?.users.length || 0,
        vehicles: generatedData?.vehicles.length || 0,
        garages: generatedData?.garages.length || 0,
        zones: generatedData?.zones.length || 0,
        sessions: generatedData?.sessions.length || 0,
        wallets: generatedData?.wallets.length || 0,
        transactions: generatedData?.transactions.length || 0,
        notifications: generatedData?.notifications.length || 0,
        paymentMethods: generatedData?.paymentMethods.length || 0,
    });
});

export default router;
