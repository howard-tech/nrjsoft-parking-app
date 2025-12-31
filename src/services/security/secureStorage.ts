import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';

const SERVICE_NAME = 'com.nrjsoftparking.secure';
const DEFAULT_USERNAME = 'secure_item';

export const secureStorage = {
    setCredentials: async (accessToken: string, refreshToken: string): Promise<boolean> => {
        try {
            await Keychain.setGenericPassword(
                DEFAULT_USERNAME,
                JSON.stringify({ accessToken, refreshToken }),
                {
                    service: SERVICE_NAME,
                    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
                }
            );
            return true;
        } catch (error) {
            console.error('Failed to store credentials', error);
            return false;
        }
    },

    getCredentials: async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
        try {
            const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
            if (credentials?.password) {
                return JSON.parse(credentials.password) as { accessToken: string; refreshToken: string };
            }
            return null;
        } catch (error) {
            console.error('Failed to read credentials', error);
            return null;
        }
    },

    clearCredentials: async (): Promise<boolean> => {
        try {
            await Keychain.resetGenericPassword({ service: SERVICE_NAME });
            return true;
        } catch (error) {
            console.error('Failed to clear credentials', error);
            return false;
        }
    },

    setItem: async (key: string, value: string): Promise<boolean> => {
        try {
            await EncryptedStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error('Failed to set secure item', error);
            return false;
        }
    },

    getItem: async (key: string): Promise<string | null> => {
        try {
            return await EncryptedStorage.getItem(key);
        } catch (error) {
            console.error('Failed to get secure item', error);
            return null;
        }
    },

    removeItem: async (key: string): Promise<boolean> => {
        try {
            await EncryptedStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove secure item', error);
            return false;
        }
    },

    clearAll: async (): Promise<boolean> => {
        try {
            await EncryptedStorage.clear();
            await Keychain.resetGenericPassword({ service: SERVICE_NAME });
            return true;
        } catch (error) {
            console.error('Failed to clear secure storage', error);
            return false;
        }
    },
};
