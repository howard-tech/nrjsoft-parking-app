import { Request, Response } from 'express';
import { Wallet, Transaction } from '../types';
import wallets from '../data/wallets.json';
import transactions from '../data/transactions.json';

// In-memory stores
const walletStore: Map<string, Wallet> = new Map(
    wallets.map((w) => [w.userId, w as Wallet])
);
const transactionStore: Transaction[] = [...(transactions as Transaction[])];

export class WalletController {
    // GET /wallet
    getWallet = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        let wallet = walletStore.get(userId);

        // Create wallet if doesn't exist
        if (!wallet) {
            wallet = {
                id: `wallet_${Date.now()}`,
                userId,
                balance: 0,
                currency: 'EUR',
                updatedAt: new Date().toISOString(),
            };
            walletStore.set(userId, wallet);
        }

        res.json(wallet);
    };

    // GET /wallet/transactions
    getTransactions = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { page = 1, limit = 20, type } = req.query;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        let userTransactions = transactionStore.filter((t) => t.userId === userId);

        // Filter by type if specified
        if (type) {
            userTransactions = userTransactions.filter((t) => t.type === type);
        }

        // Sort by date descending
        userTransactions.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        const paginated = userTransactions.slice(startIndex, endIndex);

        res.json({
            transactions: paginated,
            total: userTransactions.length,
            page: pageNum,
            totalPages: Math.ceil(userTransactions.length / limitNum),
            hasMore: endIndex < userTransactions.length,
        });
    };

    // POST /wallet/topup-intent
    createTopupIntent = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { amount, paymentMethodId } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!amount || amount <= 0) {
            res.status(400).json({ error: 'Valid amount required' });
            return;
        }

        // Create a mock payment intent
        const intent = {
            id: `pi_${Date.now()}`,
            amount,
            currency: 'EUR',
            status: 'requires_confirmation',
            clientSecret: `pi_${Date.now()}_secret_mock`,
            paymentMethodId,
            createdAt: new Date().toISOString(),
        };

        res.json(intent);
    };

    // POST /wallet/topup-confirm
    confirmTopup = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { intentId, amount } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!intentId || !amount) {
            res.status(400).json({ error: 'Intent ID and amount required' });
            return;
        }

        // Get or create wallet
        let wallet = walletStore.get(userId);
        if (!wallet) {
            wallet = {
                id: `wallet_${Date.now()}`,
                userId,
                balance: 0,
                currency: 'EUR',
                updatedAt: new Date().toISOString(),
            };
        }

        // Update balance
        wallet.balance = Math.round((wallet.balance + amount) * 100) / 100;
        wallet.updatedAt = new Date().toISOString();
        walletStore.set(userId, wallet);

        // Create transaction record
        const transaction: Transaction = {
            id: `txn_${Date.now()}`,
            walletId: wallet.id,
            userId,
            type: 'topup',
            amount,
            currency: 'EUR',
            description: 'Wallet top-up',
            status: 'completed',
            createdAt: new Date().toISOString(),
        };
        transactionStore.unshift(transaction);

        res.json({
            success: true,
            wallet,
            transaction,
        });
    };

    // GET /wallet/topup-status
    getTopupStatus = async (req: Request, res: Response): Promise<void> => {
        const { intentId } = req.query;

        if (!intentId) {
            res.status(400).json({ error: 'Intent ID required' });
            return;
        }

        // Mock status - always return succeeded
        res.json({
            intentId,
            status: 'succeeded',
            message: 'Top-up completed successfully',
        });
    };
}
