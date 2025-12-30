import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletState {
    balance: number;
    currency: string;
    lastUpdated: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: WalletState = {
    balance: 0,
    currency: 'EUR',
    lastUpdated: null,
    isLoading: false,
    error: null,
};

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setBalance: (
            state,
            action: PayloadAction<{ balance: number; currency?: string; lastUpdated?: string | null }>
        ) => {
            state.balance = action.payload.balance;
            state.currency = action.payload.currency || state.currency;
            state.lastUpdated = action.payload.lastUpdated ?? new Date().toISOString();
        },
        setWalletLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setWalletError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        resetWallet: (state) => {
            state.balance = 0;
            state.lastUpdated = null;
            state.error = null;
        },
    },
});

export const { setBalance, setWalletError, setWalletLoading, resetWallet } = walletSlice.actions;

export default walletSlice.reducer;
