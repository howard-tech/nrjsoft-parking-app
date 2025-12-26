import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
    setLoading,
    setCredentials,
    setError,
    logout as logoutAction,
} from '../store/slices/authSlice';
import { authService } from '../services/auth/authService';
import { tokenStorage } from '../services/auth/tokenStorage';
import axios from 'axios';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

    /**
     * Verify OTP and log in
     */
    const login = useCallback(
        async (type: 'mobile' | 'email', identifier: string, otp: string) => {
            dispatch(setLoading(true));
            try {
                const response = await authService.verifyOTP(type, identifier, otp);
                dispatch(
                    setCredentials({
                        user: response.user,
                        isAuthenticated: true,
                    })
                );
            } catch (err) {
                let message = 'Login failed';
                if (axios.isAxiosError(err)) {
                    message = err.response?.data?.message || message;
                }
                dispatch(setError(message));
                throw err;
            } finally {
                dispatch(setLoading(false));
            }
        },
        [dispatch]
    );

    /**
     * Check for existing session on app start
     */
    const checkSession = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const tokens = await tokenStorage.getTokens();
            if (tokens) {
                // In a real app, we might fetch the user profile here
                // For now, we simulate success if tokens exist
                dispatch(
                    setCredentials({
                        user: { id: '1', name: 'John Doe', email: 'john@example.com' }, // Mock user
                        isAuthenticated: true,
                    })
                );
            }
        } catch (err) {
            console.error('Session check failed:', err);
            dispatch(logoutAction());
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    /**
     * Log out and clear state
     */
    const logout = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            dispatch(logoutAction());
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    /**
     * Request an OTP
     */
    const requestOTP = useCallback(
        async (type: 'mobile' | 'email', identifier: string) => {
            dispatch(setLoading(true));
            try {
                await authService.requestOTP(type, identifier);
            } catch (err) {
                let message = 'Failed to request OTP';
                if (axios.isAxiosError(err)) {
                    message = err.response?.data?.message || message;
                }
                dispatch(setError(message));
                throw err;
            } finally {
                dispatch(setLoading(false));
            }
        },
        [dispatch]
    );

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        checkSession,
        requestOTP,
    };
};
