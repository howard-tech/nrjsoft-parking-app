import { useAppDispatch, useAppSelector } from '@store';
import { useCallback } from 'react';
import { setWalletLoading } from '@store/slices/walletSlice';

export const useWallet = () => {
    const dispatch = useAppDispatch();
    const { balance, currency, isLoading, error } = useAppSelector((state) => state.wallet);

    const refresh = useCallback(async () => {
        dispatch(setWalletLoading(true));
        // Placeholder for future wallet fetch integration
        dispatch(setWalletLoading(false));
    }, [dispatch]);

    return {
        balance,
        currency,
        isLoading,
        error,
        refresh,
    };
};
