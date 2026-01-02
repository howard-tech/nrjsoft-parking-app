import {
    User, Vehicle, Garage, ParkingSession,
    Zone, Wallet, Transaction, Notification, PaymentMethod
} from '../types';
import { seededGarages } from '../generators/garageSeed';

// Centralized stores - shared across all controllers
// Initialized empty to avoid duplication - populated by initializeGeneratedData()
export const userStore: Map<string, User> = new Map();
export const vehicleStore: Map<string, Vehicle> = new Map();
export const garageStore: Map<string, Garage> = new Map();
export const sessionStore: Map<string, ParkingSession> = new Map();
export const zoneStore: Map<string, Zone> = new Map();
export const walletStore: Map<string, Wallet> = new Map();
export const transactionStore: Map<string, Transaction> = new Map();
export const notificationStore: Map<string, Notification> = new Map();
export const paymentMethodStore: Map<string, PaymentMethod> = new Map();

// Seed garages near emulator location for map testing
seededGarages.forEach((garage) => {
    const seeded: Garage = {
        id: garage.id,
        name: garage.name,
        address: garage.address ?? 'Test Address',
        location: { lat: garage.latitude, lng: garage.longitude },
        entryMethod: 'QR',
        availableSlots: garage.availableSpots ?? 20,
        totalSlots: garage.totalSpots ?? 100,
        hourlyRate: garage.pricing?.hourly ?? 2.5,
        currency: garage.pricing?.currency ?? 'EUR',
        features: garage.features ?? {},
        policies: garage.policies ?? { prepayRequired: false },
        maxTime: garage.maxTime,
        status: garage.status as Garage['status'],
    };
    garageStore.set(seeded.id, seeded);
});

// --- Helper Functions ---

// User Management
export function getUser(userId: string): User | undefined {
    return userStore.get(userId);
}

export function findUserByPhone(phone: string): User | undefined {
    return Array.from(userStore.values()).find((u) => u.phone === phone);
}

export function findUserByEmail(email: string): User | undefined {
    return Array.from(userStore.values()).find((u) => u.email === email);
}

export function getAnyUser(): User | undefined {
    return Array.from(userStore.values())[0];
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

// Vehicle Management
export function getVehicle(vehicleId: string): Vehicle | undefined {
    return vehicleStore.get(vehicleId);
}

export function findVehicleByPlate(plate: string): Vehicle | undefined {
    const normalized = plate.trim().toUpperCase();
    return Array.from(vehicleStore.values()).find(
        (v) => v.plate.trim().toUpperCase() === normalized
    );
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

// Clear all data
export function clearAllData(): void {
    userStore.clear();
    vehicleStore.clear();
    garageStore.clear();
    sessionStore.clear();
    zoneStore.clear();
    walletStore.clear();
    transactionStore.clear();
    notificationStore.clear();
    paymentMethodStore.clear();
}
