import * as Keychain from 'react-native-keychain';



interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export const tokenStorage = {
    /**
     * Save tokens securely
     */
    async setTokens(accessToken: string, refreshToken: string): Promise<boolean> {
        try {
            const tokens: Tokens = { accessToken, refreshToken };
            await Keychain.setGenericPassword('auth_tokens', JSON.stringify(tokens), {
                service: 'com.nrjsoftparking.auth',
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            });
            return true;
        } catch (error) {
            console.error('Error saving tokens:', error);
            return false;
        }
    },

    /**
     * Retrieve saved tokens
     */
    async getTokens(): Promise<Tokens | null> {
        try {
            const credentials = await Keychain.getGenericPassword({
                service: 'com.nrjsoftparking.auth',
            });
            if (credentials) {
                return JSON.parse(credentials.password) as Tokens;
            }
            return null;
        } catch (error) {
            console.error('Error getting tokens:', error);
            return null;
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
     * Clear all tokens (on logout)
     */
    async clearTokens(): Promise<boolean> {
        try {
            await Keychain.resetGenericPassword({
                service: 'com.nrjsoftparking.auth',
            });
            return true;
        } catch (error) {
            console.error('Error clearing tokens:', error);
            return false;
        }
    },
};
