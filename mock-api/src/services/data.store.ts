import { User, Vehicle } from '../types';
import users from '../data/users.json';
import vehicles from '../data/vehicles.json';

// Centralized user store - shared across all controllers
export const userStore: Map<string, User> = new Map(
    users.map((u) => [u.id, u as User])
);

// Centralized vehicle store
export const vehicleStore: Map<string, Vehicle> = new Map(
    vehicles.map((v) => [v.id, v as Vehicle])
);

// Helper functions for user management
export function getUser(userId: string): User | undefined {
    return userStore.get(userId);
}

export function findUserByPhone(phone: string): User | undefined {
    return Array.from(userStore.values()).find((u) => u.phone === phone);
}

export function findUserByEmail(email: string): User | undefined {
    return Array.from(userStore.values()).find((u) => u.email === email);
}

export function createUser(user: User): User {
    userStore.set(user.id, user);
    return user;
}

export function updateUser(userId: string, updates: Partial<User>): User | undefined {
    const user = userStore.get(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
    userStore.set(userId, updatedUser);
    return updatedUser;
}

// Helper functions for vehicle management
export function getVehicle(vehicleId: string): Vehicle | undefined {
    return vehicleStore.get(vehicleId);
}

export function getUserVehicles(userId: string): Vehicle[] {
    return Array.from(vehicleStore.values()).filter((v) => v.userId === userId);
}

export function createVehicle(vehicle: Vehicle): Vehicle {
    vehicleStore.set(vehicle.id, vehicle);
    return vehicle;
}

export function updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Vehicle | undefined {
    const vehicle = vehicleStore.get(vehicleId);
    if (!vehicle) return undefined;

    const updatedVehicle = { ...vehicle, ...updates };
    vehicleStore.set(vehicleId, updatedVehicle);
    return updatedVehicle;
}

export function deleteVehicle(vehicleId: string): boolean {
    return vehicleStore.delete(vehicleId);
}

export function setDefaultVehicle(userId: string, vehicleId: string): void {
    Array.from(vehicleStore.values())
        .filter((v) => v.userId === userId)
        .forEach((v) => {
            vehicleStore.set(v.id, { ...v, isDefault: v.id === vehicleId });
        });
}
