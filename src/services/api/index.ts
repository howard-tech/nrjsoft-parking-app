import { Platform } from 'react-native';
import axios, { AxiosRequestConfig } from 'axios';
import Config from 'react-native-config';
import { tokenStorage } from '../auth/tokenStorage';
import { store } from '../../store';
import { logout } from '../../store/slices/authSlice';

// Fallback logic: if Config is missing/empty, use localhost (iOS) or 10.0.2.2 (Android)
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3001/api/v1' : 'http://localhost:3001/api/v1';
const BASE_URL = Config.API_BASE_URL || Config.API_URL || DEFAULT_URL;
const REQUEST_TIMEOUT = Number(Config.API_TIMEOUT) || 10000;

type RetriableRequestConfig = AxiosRequestConfig & { _retry?: boolean; _networkRetry?: boolean };

// Basic client for regular API calls
export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: REQUEST_TIMEOUT,
});

/**
 * Separate client for authentication-related requests.
 * Used for token refresh to avoid recursive 401 loops in the main apiClient interceptor.
 */
export const authApiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: REQUEST_TIMEOUT,
});

// Queue mechanism for handling concurrent refresh attempts
let isRefreshing = false;
let refreshQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    refreshQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    refreshQueue = [];
};

// Request Interceptor: Attach the current access token to every outgoing request
apiClient.interceptors.request.use(
    async (config) => {
        const headers = config.headers ?? {};
        const accessToken = await tokenStorage.getAccessToken();
        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }
        config.headers = headers;

        if (__DEV__) {
            const method = config.method?.toUpperCase();
            console.log(`[API] ${method} ${config.url}`, config.data ?? config.params ?? '');
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 errors and attempt to refresh the token
apiClient.interceptors.response.use(
    (response) => {
        if (__DEV__) {
            console.log(`[API] Response ${response.status} ${response.config.url}`, response.data);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (!error.response && !originalRequest._networkRetry) {
            originalRequest._networkRetry = true;
            return apiClient(originalRequest);
        }

        // If error is 401 (Unauthorized) and we haven't already tried to refresh this specific request
        if (error.response?.status === 401 && !originalRequest._retry) {

            // If a refresh is already in flight, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers = originalRequest.headers ?? {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

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

                // Update the Authorization header of the original request
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // Process the queue with the new token
                processQueue(null, accessToken);

                return apiClient(originalRequest);
            } catch (refreshError) {
                // If the refresh fails, we must clear tokens and force global logout
                await tokenStorage.clearTokens();
                store.dispatch(logout());

                // Process the queue with the error
                processQueue(refreshError, null);

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
