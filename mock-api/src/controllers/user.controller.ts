import { Request, Response } from 'express';
import { User, Vehicle } from '../types';
import users from '../data/users.json';
import vehicles from '../data/vehicles.json';

// In-memory stores
const userStore: Map<string, User> = new Map(
    users.map((u) => [u.id, u as User])
);
const vehicleStore: Map<string, Vehicle> = new Map(
    vehicles.map((v) => [v.id, v as Vehicle])
);

export class UserController {
    // GET /me
    getProfile = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = userStore.get(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(user);
    };

    // PUT /me
    updateProfile = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { name, email, avatar } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = userStore.get(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Update user
        const updatedUser: User = {
            ...user,
            ...(name && { name }),
            ...(email && { email }),
            ...(avatar && { avatar }),
            updatedAt: new Date().toISOString(),
        };

        userStore.set(userId, updatedUser);

        res.json(updatedUser);
    };

    // GET /me/vehicles
    getVehicles = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const userVehicles = Array.from(vehicleStore.values()).filter(
            (v) => v.userId === userId
        );

        res.json(userVehicles);
    };

    // POST /me/vehicles
    addVehicle = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { plate, nickname, make, model, color, isDefault } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!plate) {
            res.status(400).json({ error: 'License plate is required' });
            return;
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            Array.from(vehicleStore.values())
                .filter((v) => v.userId === userId)
                .forEach((v) => {
                    vehicleStore.set(v.id, { ...v, isDefault: false });
                });
        }

        const vehicle: Vehicle = {
            id: `vehicle_${Date.now()}`,
            userId,
            plate: plate.toUpperCase(),
            nickname,
            make,
            model,
            color,
            isDefault: isDefault || false,
            createdAt: new Date().toISOString(),
        };

        vehicleStore.set(vehicle.id, vehicle);

        res.status(201).json(vehicle);
    };

    // PUT /me/vehicles/:id
    updateVehicle = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { id } = req.params;
        const { plate, nickname, make, model, color, isDefault } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const vehicle = vehicleStore.get(id);

        if (!vehicle || vehicle.userId !== userId) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            Array.from(vehicleStore.values())
                .filter((v) => v.userId === userId && v.id !== id)
                .forEach((v) => {
                    vehicleStore.set(v.id, { ...v, isDefault: false });
                });
        }

        const updatedVehicle: Vehicle = {
            ...vehicle,
            ...(plate && { plate: plate.toUpperCase() }),
            ...(nickname !== undefined && { nickname }),
            ...(make && { make }),
            ...(model && { model }),
            ...(color && { color }),
            ...(isDefault !== undefined && { isDefault }),
        };

        vehicleStore.set(id, updatedVehicle);

        res.json(updatedVehicle);
    };

    // DELETE /me/vehicles/:id
    deleteVehicle = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const vehicle = vehicleStore.get(id);

        if (!vehicle || vehicle.userId !== userId) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }

        vehicleStore.delete(id);

        res.json({ success: true, message: 'Vehicle deleted' });
    };
}
