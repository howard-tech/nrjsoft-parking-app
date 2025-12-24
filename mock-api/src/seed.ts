#!/usr/bin/env ts-node
/**
 * Mock Data Seeder CLI
 * 
 * Usage:
 *   npx ts-node src/seed.ts              # Generate with defaults
 *   npx ts-node src/seed.ts --users=50   # Custom user count
 *   npx ts-node src/seed.ts --export     # Export to JSON files
 */

import * as fs from 'fs';
import * as path from 'path';
import { seedDatabase, GeneratedData } from './generators';

interface CLIOptions {
    users: number;
    garages: number;
    zones: number;
    export: boolean;
}

function parseArgs(): CLIOptions {
    const args = process.argv.slice(2);
    const options: CLIOptions = {
        users: 20,
        garages: 30,
        zones: 30,
        export: false,
    };

    args.forEach((arg) => {
        if (arg.startsWith('--users=')) {
            options.users = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--garages=')) {
            options.garages = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--zones=')) {
            options.zones = parseInt(arg.split('=')[1], 10);
        } else if (arg === '--export') {
            options.export = true;
        }
    });

    return options;
}

function exportToFiles(data: GeneratedData): void {
    const dataDir = path.join(__dirname, 'data');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const files = {
        'users.json': data.users,
        'vehicles.json': data.vehicles,
        'garages.json': data.garages,
        'zones.json': data.zones,
        'sessions.json': data.sessions,
        'wallets.json': data.wallets,
        'transactions.json': data.transactions,
        'notifications.json': data.notifications,
        'payment-methods.json': data.paymentMethods,
    };

    console.log('\n📁 Exporting to JSON files...');

    Object.entries(files).forEach(([filename, data]) => {
        const filePath = path.join(dataDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`   ✓ ${filename} (${Array.isArray(data) ? data.length : 1} items)`);
    });

    console.log('✅ Export complete!');
}

// Main execution
const options = parseArgs();

console.log('');
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║       NRJSoft Parking - Mock Data Seeder               ║');
console.log('╠════════════════════════════════════════════════════════╣');
console.log(`║  Users:   ${options.users.toString().padEnd(45)}║`);
console.log(`║  Garages: ${options.garages.toString().padEnd(45)}║`);
console.log(`║  Zones:   ${options.zones.toString().padEnd(45)}║`);
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

const data = seedDatabase({
    userCount: options.users,
    garageCount: options.garages,
    zoneCount: options.zones,
});

if (options.export) {
    exportToFiles(data);
}

// Print summary
console.log('\n📊 Data Summary:');
console.log(`   Users:           ${data.users.length}`);
console.log(`   Vehicles:        ${data.vehicles.length}`);
console.log(`   Garages:         ${data.garages.length}`);
console.log(`   Zones:           ${data.zones.length}`);
console.log(`   Sessions:        ${data.sessions.length}`);
console.log(`   Wallets:         ${data.wallets.length}`);
console.log(`   Transactions:    ${data.transactions.length}`);
console.log(`   Notifications:   ${data.notifications.length}`);
console.log(`   Payment Methods: ${data.paymentMethods.length}`);
console.log('');
