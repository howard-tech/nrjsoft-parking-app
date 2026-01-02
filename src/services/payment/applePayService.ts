import { PaymentResult } from '@types/payment';
import { Platform } from 'react-native';
import Config from 'react-native-config';

export const applePayService = {
    /**
     * Check if Apple Pay is available on this device (platform check only)
     */
    isSupported: (): boolean => {
        return Platform.OS === 'ios';
    },

    /**
     * Get Apple Pay initialization config
     */
    getInitConfig: () => {
        return {
            merchantIdentifier: Config.STRIPE_MERCHANT_ID || 'merchant.com.nrjsoft.parking',
            countryCode: 'DE',
            currencyCode: 'EUR',
        };
    },

    /**
     * Legacy confirmApplePay for backward compatibility
     */
    confirmApplePay: async (clientSecret: string): Promise<PaymentResult> => {
        if (!clientSecret) {
            return { success: false, errorMessage: 'Missing client secret' };
        }
        // Placeholder for Apple Pay integration
        return { success: true, status: 'succeeded' };
    },
};
