import { faker } from '@faker-js/faker';
import { Transaction, Wallet } from '../types';

export function generateWallet(userId: string): Wallet {
    return {
        id: `wallet_${faker.string.alphanumeric(8)}`,
        userId,
        balance: faker.number.float({ min: 0, max: 200, fractionDigits: 2 }),
        currency: 'EUR',
        updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    };
}

export function generateTransaction(userId: string, walletId: string, sessionId?: string): Transaction {
    const isTopup = faker.datatype.boolean({ probability: 0.3 });
    const amount = isTopup
        ? faker.helpers.arrayElement([10, 20, 50, 100])
        : -faker.number.float({ min: 2, max: 30, fractionDigits: 2 });

    return {
        id: `txn_${faker.string.alphanumeric(8)}`,
        walletId,
        userId,
        type: isTopup ? 'topup' : 'payment',
        amount,
        currency: 'EUR',
        description: isTopup
            ? 'Wallet top-up'
            : `Parking at ${faker.company.name()}`,
        status: 'completed',
        createdAt: faker.date.recent({ days: 60 }).toISOString(),
        sessionId: isTopup ? undefined : sessionId,
    };
}

export function generateWalletsAndTransactions(
    users: Array<{ id: string }>,
    transactionsPerUser: { min: number; max: number } = { min: 5, max: 20 }
): { wallets: Wallet[]; transactions: Transaction[] } {
    const wallets: Wallet[] = [];
    const transactions: Transaction[] = [];

    users.forEach((user) => {
        const wallet = generateWallet(user.id);
        wallets.push(wallet);

        const txnCount = faker.number.int(transactionsPerUser);
        for (let i = 0; i < txnCount; i++) {
            transactions.push(generateTransaction(user.id, wallet.id));
        }
    });

    // Sort transactions by date descending
    transactions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { wallets, transactions };
}
