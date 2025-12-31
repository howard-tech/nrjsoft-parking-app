import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export interface BiometricStatus {
    available: boolean;
    biometryType: BiometryTypes | null;
}

export const biometricAuth = {
    checkAvailability: async (): Promise<BiometricStatus> => {
        try {
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();
            return {
                available,
                biometryType: biometryType ?? null,
            };
        } catch (error) {
            console.warn('Biometric availability check failed', error);
            return { available: false, biometryType: null };
        }
    },

    authenticate: async (promptMessage = 'Authenticate to continue'): Promise<boolean> => {
        try {
            const { success } = await rnBiometrics.simplePrompt({
                promptMessage,
                cancelButtonText: 'Cancel',
            });
            return success;
        } catch (error) {
            console.warn('Biometric auth failed', error);
            return false;
        }
    },
};
