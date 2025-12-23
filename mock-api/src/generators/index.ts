// Export all generators
export * from './constants';
export * from './garage.generator';
export * from './user.generator';
export * from './session.generator';
export * from './zone.generator';
export * from './transaction.generator';
export * from './notification.generator';
export * from './payment-method.generator';

import { generateGarages } from './garage.generator';
import { generateUsers } from './user.generator';
import { generateSessions } from './session.generator';
import { generateZones } from './zone.generator';
import { generateWalletsAndTransactions } from './transaction.generator';
import { generateNotifications } from './notification.generator';
import { generatePaymentMethods } from './payment-method.generator';

import {
    User, Vehicle, Garage, Zone, ParkingSession,
    Wallet, Transaction, Notification, PaymentMethod
} from '../types';

export interface GeneratedData {
    users: User[];
    vehicles: Vehicle[];
    garages: Garage[];
    zones: Zone[];
    sessions: ParkingSession[];
    wallets: Wallet[];
    transactions: Transaction[];
    notifications: Notification[];
    paymentMethods: PaymentMethod[];
}

export interface SeedOptions {
    userCount?: number;
    garageCount?: number;
    zoneCount?: number;
}

export function seedDatabase(options: SeedOptions = {}): GeneratedData {
    const {
        userCount = 20,
        garageCount = 30,
        zoneCount = 30,
    } = options;

    console.log('🌱 Generating mock data...');

    // Generate garages
    const garages = generateGarages(garageCount);
    console.log(`   ✓ Generated ${garages.length} garages`);

    // Generate users and vehicles
    const { users, vehicles } = generateUsers(userCount);
    console.log(`   ✓ Generated ${users.length} users`);
    console.log(`   ✓ Generated ${vehicles.length} vehicles`);

    // Generate zones
    const zones = generateZones(zoneCount);
    console.log(`   ✓ Generated ${zones.length} on-street zones`);

    // Generate sessions
    const sessions = generateSessions(users, garages);
    console.log(`   ✓ Generated ${sessions.length} parking sessions`);

    // Generate wallets and transactions
    const { wallets, transactions } = generateWalletsAndTransactions(users);
    console.log(`   ✓ Generated ${wallets.length} wallets`);
    console.log(`   ✓ Generated ${transactions.length} transactions`);

    // Generate notifications
    const notifications = generateNotifications(users);
    console.log(`   ✓ Generated ${notifications.length} notifications`);

    // Generate payment methods
    const paymentMethods = generatePaymentMethods(users);
    console.log(`   ✓ Generated ${paymentMethods.length} payment methods`);

    console.log('✅ Mock data generation complete!');

    return {
        users,
        vehicles,
        garages,
        zones,
        sessions,
        wallets,
        transactions,
        notifications,
        paymentMethods,
    };
}
