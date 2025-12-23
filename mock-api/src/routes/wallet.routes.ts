import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';

const router = Router();
const controller = new WalletController();

// GET /wallet
router.get('/', controller.getWallet);

// GET /wallet/transactions
router.get('/transactions', controller.getTransactions);

// POST /wallet/topup-intent
router.post('/topup-intent', controller.createTopupIntent);

// POST /wallet/topup-confirm
router.post('/topup-confirm', controller.confirmTopup);

// GET /wallet/topup-status
router.get('/topup-status', controller.getTopupStatus);

export default router;
