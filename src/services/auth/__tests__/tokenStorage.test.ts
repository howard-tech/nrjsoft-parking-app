import * as Keychain from 'react-native-keychain';
import { tokenStorage } from '../tokenStorage';

jest.mock('react-native-keychain', () => ({
    setGenericPassword: jest.fn(),
    getGenericPassword: jest.fn(),
    resetGenericPassword: jest.fn(),
    ACCESSIBLE: {
        WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    },
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

    it('clears tokens correctly', async () => {
        await tokenStorage.clearTokens();
        expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(
            expect.objectContaining({
                service: 'com.nrjsoftparking.auth',
            })
        );
    });
});
