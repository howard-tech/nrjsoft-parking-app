import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStorage } from '../tokenStorage';

jest.mock('react-native-keychain', () => ({
    setGenericPassword: jest.fn(),
    getGenericPassword: jest.fn(),
    resetGenericPassword: jest.fn(),
    ACCESSIBLE: {
        WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    multiRemove: jest.fn(),
}));

describe('tokenStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sets tokens correctly', async () => {
        await tokenStorage.setTokens('access', 'refresh');
        expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
            'auth_tokens',
            JSON.stringify({ accessToken: 'access', refreshToken: 'refresh' }),
            expect.objectContaining({
                service: 'com.nrjsoftparking.auth',
                accessible: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
            })
        );
    });

    it('gets access token correctly', async () => {
        (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
            password: JSON.stringify({ accessToken: 'access', refreshToken: 'refresh' }),
        });
        const token = await tokenStorage.getAccessToken();
        expect(token).toBe('access');
    });

    it('gets refresh token correctly', async () => {
        (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
            password: JSON.stringify({ accessToken: 'access', refreshToken: 'refresh' }),
        });
        const token = await tokenStorage.getRefreshToken();
        expect(token).toBe('refresh');
    });

    it('migrates legacy combined tokens from AsyncStorage when keychain is empty', async () => {
        (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify({ accessToken: 'legacyAccess', refreshToken: 'legacyRefresh' }));

        const tokens = await tokenStorage.getTokens();

        expect(tokens).toEqual({ accessToken: 'legacyAccess', refreshToken: 'legacyRefresh' });
        expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
            'auth_tokens',
            JSON.stringify({ accessToken: 'legacyAccess', refreshToken: 'legacyRefresh' }),
            expect.objectContaining({ service: 'com.nrjsoftparking.auth' })
        );
        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['@auth_tokens']);
    });

    it('migrates legacy split tokens from AsyncStorage when keychain is empty', async () => {
        (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null); // legacy blob
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('legacyAccess');
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('legacyRefresh');

        const tokens = await tokenStorage.getTokens();

        expect(tokens).toEqual({ accessToken: 'legacyAccess', refreshToken: 'legacyRefresh' });
        expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
            'auth_tokens',
            JSON.stringify({ accessToken: 'legacyAccess', refreshToken: 'legacyRefresh' }),
            expect.objectContaining({ service: 'com.nrjsoftparking.auth' })
        );
        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['@access_token', '@refresh_token']);
    });

    it('clears tokens correctly', async () => {
        await tokenStorage.clearTokens();
        expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(
            expect.objectContaining({
                service: 'com.nrjsoftparking.auth',
            })
        );
        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['@auth_tokens', '@access_token', '@refresh_token']);
    });
});
