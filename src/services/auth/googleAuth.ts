import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import { authService } from './authService';

let isConfigured = false;

const configureIfNeeded = () => {
    if (isConfigured) {
        return;
    }

    GoogleSignin.configure({
        webClientId: Config.GOOGLE_WEB_CLIENT_ID || Config.GOOGLE_IOS_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
    });

    isConfigured = true;
};

const getWebClientId = () => Config.GOOGLE_WEB_CLIENT_ID || Config.GOOGLE_IOS_CLIENT_ID;

export const googleAuthService = {
    configure: () => {
        configureIfNeeded();
    },

    signIn: async () => {
        configureIfNeeded();

        if (!getWebClientId()) {
            throw new Error('Missing Google web client ID. Please set GOOGLE_WEB_CLIENT_ID in your env file.');
        }

        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const userInfo = await GoogleSignin.signIn();

            if (!userInfo.idToken) {
                throw new Error('Missing Google ID token. Please try again.');
            }

            const response = await authService.socialLogin({
                provider: 'google',
                idToken: userInfo.idToken,
                email: userInfo.user.email || null,
                name: userInfo.user.name || null,
                photo: userInfo.user.photo || null,
            });

            return response;
        } catch (error: unknown) {
            const errorCode = (error as { code?: string })?.code;

            if (errorCode === statusCodes.SIGN_IN_CANCELLED) {
                throw new Error('User cancelled sign in');
            }
            if (errorCode === statusCodes.IN_PROGRESS) {
                throw new Error('Sign in already in progress');
            }
            if (errorCode === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                throw new Error('Google Play Services not available');
            }
            if (error instanceof Error) {
                throw error;
            }

            throw new Error('Google sign-in failed. Please try again.');
        }
    },

    signOut: async () => {
        configureIfNeeded();
        await GoogleSignin.signOut();
    },

    isSignedIn: async () => {
        configureIfNeeded();
        return GoogleSignin.isSignedIn();
    },
};
