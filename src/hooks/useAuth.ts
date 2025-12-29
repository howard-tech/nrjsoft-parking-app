import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
    setRequestOtpLoading,
    setVerifyOtpLoading,
    setCheckSessionLoading,
    setLogoutLoading,
    setCredentials,
    setError,
    logout as logoutAction,
} from '../store/slices/authSlice';
import { authService } from '../services/auth/authService';
import { tokenStorage } from '../services/auth/tokenStorage';
import { parseAxiosError } from '../utils/errorParser';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const {
        user,
        isAuthenticated,
        requestOtpLoading,
        verifyOtpLoading,
        checkSessionLoading,
        logoutLoading,
        error,
    } = useAppSelector((state) => state.auth);

    /**
     * Verify OTP and log in
     */
    const login = useCallback(
        async (type: 'mobile' | 'email', identifier: string, otp: string) => {
            dispatch(setVerifyOtpLoading(true));
            try {
                const response = await authService.verifyOTP(type, identifier, otp);
                dispatch(
                    setCredentials({
                        user: response.user,
                        isAuthenticated: true,
                    })
                );
            } catch (err) {
                dispatch(setError(parseAxiosError(err, 'auth.loginFailed')));
                throw err;
            } finally {
                dispatch(setVerifyOtpLoading(false));
            }
        },
        [dispatch]
    );

    /**
     * Check for existing session on app start
     */
    const checkSession = useCallback(async () => {
        dispatch(setCheckSessionLoading(true));
        try {
            const tokens = await tokenStorage.getTokens();
            if (tokens) {
                // Validate session by fetching the current user profile
                const userProfile = await authService.getCurrentUser();
                dispatch(
                    setCredentials({
                        user: userProfile,
                        isAuthenticated: true,
                    })
                );
            }
        } catch (err) {
            // If fetching profile fails (and refresh also fails), we log out
            dispatch(logoutAction());
        } finally {
            dispatch(setCheckSessionLoading(false));
        }
    }, [dispatch]);

    /**
     * Log out and clear state
     */
    const logout = useCallback(async () => {
        dispatch(setLogoutLoading(true));
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            dispatch(logoutAction());
            dispatch(setLogoutLoading(false));
        }
    }, [dispatch]);

    /**
     * Request an OTP
     */
    const requestOTP = useCallback(
        async (type: 'mobile' | 'email', identifier: string) => {
            dispatch(setRequestOtpLoading(true));
            try {
                await authService.requestOTP(type, identifier);
            } catch (err) {
                dispatch(setError(parseAxiosError(err, 'auth.otpRequestFailed')));
                throw err;
            } finally {
                dispatch(setRequestOtpLoading(false));
            }
        },
        [dispatch]
    );

    return {
        user,
        isAuthenticated,
        isLoading: requestOtpLoading || verifyOtpLoading || checkSessionLoading || logoutLoading,
        requestOtpLoading,
        verifyOtpLoading,
        checkSessionLoading,
        logoutLoading,
        error,
        login,
        logout,
        checkSession,
        requestOTP,
    };
};
