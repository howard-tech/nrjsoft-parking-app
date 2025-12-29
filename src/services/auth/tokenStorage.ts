import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

interface Tokens {
    accessToken: string;
    refreshToken: string;
}

const KEYCHAIN_SERVICE = 'com.nrjsoftparking.auth';
const KEYCHAIN_USERNAME = 'auth_tokens';
const LEGACY_TOKEN_KEY = '@auth_tokens';
const LEGACY_ACCESS_KEY = '@access_token';
const LEGACY_REFRESH_KEY = '@refresh_token';

const saveToKeychain = async (tokens: Tokens): Promise<void> => {
    await Keychain.setGenericPassword(KEYCHAIN_USERNAME, JSON.stringify(tokens), {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
};

const parseTokens = (rawValue: string | null): Tokens | null => {
    if (!rawValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawValue) as Partial<Tokens>;
        if (parsed.accessToken && parsed.refreshToken) {
            return {
                accessToken: parsed.accessToken,
                refreshToken: parsed.refreshToken,
            };
        }
    } catch {
        // ignore JSON parse errors and fallback to other sources
    }

    return null;
};

const migrateLegacyTokens = async (): Promise<Tokens | null> => {
    // Legacy combined token blob
    const legacyTokens = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
    const parsedLegacyTokens = parseTokens(legacyTokens);
    if (parsedLegacyTokens) {
        await saveToKeychain(parsedLegacyTokens);
        await AsyncStorage.multiRemove([LEGACY_TOKEN_KEY]);
        return parsedLegacyTokens;
    }

    // Legacy split keys
    const [legacyAccess, legacyRefresh] = await Promise.all([
        AsyncStorage.getItem(LEGACY_ACCESS_KEY),
        AsyncStorage.getItem(LEGACY_REFRESH_KEY),
    ]);

    if (legacyAccess && legacyRefresh) {
        const tokens = { accessToken: legacyAccess, refreshToken: legacyRefresh };
        await saveToKeychain(tokens);
        await AsyncStorage.multiRemove([LEGACY_ACCESS_KEY, LEGACY_REFRESH_KEY]);
        return tokens;
    }

    return null;
};

export const tokenStorage = {
    /**
     * Save tokens securely
     */
    async setTokens(accessToken: string, refreshToken: string): Promise<boolean> {
        try {
            const tokens: Tokens = { accessToken, refreshToken };
            await saveToKeychain(tokens);
            return true;
        } catch (error) {
            console.error('Error saving tokens:', error);
            return false;
        }
    },

    /**
     * Retrieve saved tokens, migrating legacy storage if needed
     */
    async getTokens(): Promise<Tokens | null> {
        try {
            const credentials = await Keychain.getGenericPassword({
                service: KEYCHAIN_SERVICE,
            });
            if (credentials) {
                return JSON.parse(credentials.password) as Tokens;
            }

            return await migrateLegacyTokens();
        } catch (error) {
            console.error('Error getting tokens:', error);
            return await migrateLegacyTokens();
        }
    },

    /**
     * Get only access token
     */
    async getAccessToken(): Promise<string | null> {
        const tokens = await this.getTokens();
        return tokens?.accessToken || null;
    },

    /**
     * Get only refresh token
     */
    async getRefreshToken(): Promise<string | null> {
        const tokens = await this.getTokens();
        return tokens?.refreshToken || null;
    },

    /**
     * Clear all tokens (on logout) and remove legacy entries
     */
    async clearTokens(): Promise<boolean> {
        try {
            await Keychain.resetGenericPassword({
                service: KEYCHAIN_SERVICE,
            });
            await AsyncStorage.multiRemove([LEGACY_TOKEN_KEY, LEGACY_ACCESS_KEY, LEGACY_REFRESH_KEY]);
            return true;
        } catch (error) {
            console.error('Error clearing tokens:', error);
            return false;
        }
    },
};
