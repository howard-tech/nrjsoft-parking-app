import { appleAuth } from '@invertase/react-native-apple-authentication';
import { authService } from './authService';

export const appleAuthService = {
    isSupported: () => appleAuth.isSupported,

    signIn: async () => {
        if (!appleAuth.isSupported) {
            throw new Error('Apple Sign-In is not supported on this device');
        }

        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

            if (credentialState !== appleAuth.State.AUTHORIZED) {
                throw new Error('Apple authentication failed');
            }

            if (!appleAuthRequestResponse.identityToken) {
                throw new Error('Apple Sign-In returned no identity token');
            }

            const response = await authService.socialLogin({
                provider: 'apple',
                idToken: appleAuthRequestResponse.identityToken,
                authorizationCode: appleAuthRequestResponse.authorizationCode,
                email: appleAuthRequestResponse.email || null,
                fullName: appleAuthRequestResponse.fullName || null,
                user: appleAuthRequestResponse.user,
            });

            return response;
        } catch (error: unknown) {
            const errorCode = (error as { code?: string })?.code;

            if (errorCode === appleAuth.Error.CANCELED) {
                throw new Error('User cancelled sign in');
            }
            if (error instanceof Error) {
                throw error;
            }

            throw new Error('Apple sign-in failed. Please try again.');
        }
    },
};
