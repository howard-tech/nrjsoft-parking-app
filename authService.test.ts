import { apiClient, authApiClient } from '@services/api';
import { tokenStorage } from '@services/auth/tokenStorage';
import { authService } from '@services/auth/authService';

jest.mock('@services/api', () => ({
    apiClient: {
        get: jest.fn(),
        post: jest.fn(),
    },
    authApiClient: {
        post: jest.fn(),
    },
}));

jest.mock('@services/auth/tokenStorage', () => ({
    tokenStorage: {
        setTokens: jest.fn(),
        getRefreshToken: jest.fn(),
        clearTokens: jest.fn(),
    },
}));

describe('authService', () => {
    const mockPost = apiClient.post as jest.Mock;
    const mockAuthPost = authApiClient.post as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('requests OTP for a mobile number', async () => {
        mockPost.mockResolvedValueOnce({ data: { success: true } });
        await authService.requestOTP('mobile', '+359888123456');
        expect(mockPost).toHaveBeenCalledWith('/auth/otp-request', { phone: '+359888123456' });
    });

    it('requests OTP for an email', async () => {
        mockPost.mockResolvedValueOnce({ data: { success: true } });
        await authService.requestOTP('email', 'demo@nrjsoft.com');
        expect(mockPost).toHaveBeenCalledWith('/auth/otp-request', { email: 'demo@nrjsoft.com' });
    });

    it('verifies OTP and stores tokens', async () => {
        mockPost.mockResolvedValueOnce({
            data: {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                user: { id: 'user-1', name: 'Demo', email: 'demo@nrjsoft.com' },
            },
        });

        const result = await authService.verifyOTP('mobile', '+359888123456', '123456');

        expect(tokenStorage.setTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
        expect(result.user.id).toBe('user-1');
    });

    it('handles social login and stores tokens', async () => {
        mockPost.mockResolvedValueOnce({
            data: {
                accessToken: 'social-access',
                refreshToken: 'social-refresh',
                user: { id: 'user-2', name: 'Social', email: 'social@nrjsoft.com' },
            },
        });

        const result = await authService.socialLogin({
            provider: 'google',
            idToken: 'token',
            email: 'social@nrjsoft.com',
        });

        expect(tokenStorage.setTokens).toHaveBeenCalledWith('social-access', 'social-refresh');
        expect(result.user.id).toBe('user-2');
    });

    it('returns null when refresh token is missing', async () => {
        (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce(null);
        const token = await authService.refreshToken();
        expect(token).toBeNull();
        expect(mockAuthPost).not.toHaveBeenCalled();
    });

    it('refreshes token when refresh token exists', async () => {
        (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('refresh-token');
        mockAuthPost.mockResolvedValueOnce({
            data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
        });

        const token = await authService.refreshToken();

        expect(mockAuthPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'refresh-token' });
        expect(tokenStorage.setTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
        expect(token).toBe('new-access');
    });

    it('clears tokens if refresh fails', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('refresh-token');
        mockAuthPost.mockRejectedValueOnce(new Error('refresh failed'));

        const token = await authService.refreshToken();

        expect(tokenStorage.clearTokens).toHaveBeenCalled();
        expect(token).toBeNull();
        errorSpy.mockRestore();
    });

    it('logs out and clears tokens', async () => {
        (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('refresh-token');
        mockPost.mockResolvedValueOnce({ data: { success: true } });

        await authService.logout();

        expect(mockPost).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh-token' });
        expect(tokenStorage.clearTokens).toHaveBeenCalled();
    });
});
