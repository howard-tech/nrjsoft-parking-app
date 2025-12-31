import { createPinnedFetch } from '@services/security/sslPinning';
import { tokenStorage } from '@services/auth/tokenStorage';
import DeviceInfo from 'react-native-device-info';

const BASE_URL = process.env.API_BASE_URL || 'https://api.nrjsoft.com';
const pinnedFetch = createPinnedFetch();

export interface SecureRequestInit extends RequestInit {
    auth?: boolean;
}

export const secureClient = {
    request: async <T = unknown>(endpoint: string, options: SecureRequestInit = {}): Promise<T> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (options.auth !== false) {
            const tokens = await tokenStorage.getTokens();
            if (tokens?.accessToken) {
                headers.Authorization = `Bearer ${tokens.accessToken}`;
            }
        }

        headers['X-Device-Id'] = await DeviceInfo.getUniqueId();

        const response = await pinnedFetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    },
};
