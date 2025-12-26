import { apiClient } from '../api';
import { tokenStorage } from './tokenStorage';

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    accessToken: string;
    refreshToken: string;
}

export const authService = {
    /**
     * Request an OTP for login
     */
    async requestOTP(type: 'mobile' | 'email', identifier: string): Promise<void> {
        await apiClient.post('/auth/otp-request', { type, identifier });
    },

    /**
     * Verify the OTP and get tokens
     */
    async verifyOTP(type: 'mobile' | 'email', identifier: string, otp: string): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/otp-verify', {
            type,
            identifier,
            otp,
        });

        const { accessToken, refreshToken } = response.data;
        await tokenStorage.setTokens(accessToken, refreshToken);

        return response.data;
    },

    /**
     * Refresh the access token using the refresh token
     */
    async refreshToken(): Promise<string | null> {
        try {
            const storedRefreshToken = await tokenStorage.getRefreshToken();
            if (!storedRefreshToken) {
                return null;
            }

            const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
                '/auth/token-refresh',
                { refreshToken: storedRefreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            await tokenStorage.setTokens(accessToken, newRefreshToken);

            return accessToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            await tokenStorage.clearTokens();
            return null;
        }
    },

    /**
     * Log out the user
     */
    async logout(): Promise<void> {
        try {
            const storedRefreshToken = await tokenStorage.getRefreshToken();
            if (storedRefreshToken) {
                await apiClient.post('/auth/logout', { refreshToken: storedRefreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await tokenStorage.clearTokens();
        }
    },
};
