import axios from 'axios';
import { Config } from 'react-native-config';
import { tokenStorage } from '../auth/tokenStorage';

// Basic client for regular API calls
export const apiClient = axios.create({
    baseURL: Config.API_URL || 'http://localhost:3001/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

/**
 * Separate client for authentication-related requests.
 * Used for token refresh to avoid recursive 401 loops in the main apiClient interceptor.
 */
export const authApiClient = axios.create({
    baseURL: Config.API_URL || 'http://localhost:3001/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor: Attach the current access token to every outgoing request
apiClient.interceptors.request.use(
    async (config) => {
        const accessToken = await tokenStorage.getAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 errors and attempt to refresh the token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const oldRefreshToken = await tokenStorage.getRefreshToken();
                if (!oldRefreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call the refresh endpoint using the dedicated authApiClient instance
                const response = await authApiClient.post<{ accessToken: string; refreshToken?: string }>(
                    '/auth/refresh',
                    { refreshToken: oldRefreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Store the new tokens securely
                await tokenStorage.setTokens(accessToken, newRefreshToken || oldRefreshToken);

                // Update the Authorization header of the original request and retry it
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If the refresh fails, we must clear tokens and force logout
                await tokenStorage.clearTokens();
                // We'll let the original error bubble up so the UI can respond
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
