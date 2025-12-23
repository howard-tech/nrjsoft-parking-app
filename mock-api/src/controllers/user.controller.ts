import { Request, Response } from 'express';
import { User, Vehicle } from '../types';
import {
    getUser,
    updateUser,
    getUserVehicles,
    getVehicle,
    createVehicle,
    updateVehicle as updateVehicleStore,
    deleteVehicle as deleteVehicleStore,
    setDefaultVehicle,
} from '../services/data.store';

export class UserController {
    // GET /me
    getProfile = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = getUser(userId);

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

        const updatedUser = updateUser(userId, {
            ...(name && { name }),
            ...(email && { email }),
            ...(avatar && { avatar }),
        });

        if (!updatedUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(updatedUser);
    };

    // GET /me/vehicles
    getVehicles = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const userVehicles = getUserVehicles(userId);
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
            setDefaultVehicle(userId, ''); // Clear all defaults first
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

        createVehicle(vehicle);

        // If this is the default, set it
        if (isDefault) {
            setDefaultVehicle(userId, vehicle.id);
        }

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

        const vehicle = getVehicle(id);

        if (!vehicle || vehicle.userId !== userId) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }

        // If setting as default, update all vehicles
        if (isDefault) {
            setDefaultVehicle(userId, id);
        }

        const updatedVehicle = updateVehicleStore(id, {
            ...(plate && { plate: plate.toUpperCase() }),
            ...(nickname !== undefined && { nickname }),
            ...(make && { make }),
            ...(model && { model }),
            ...(color && { color }),
            ...(isDefault !== undefined && { isDefault }),
        });

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

        const vehicle = getVehicle(id);

        if (!vehicle || vehicle.userId !== userId) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }

        deleteVehicleStore(id);

        res.json({ success: true, message: 'Vehicle deleted' });
    };
}
