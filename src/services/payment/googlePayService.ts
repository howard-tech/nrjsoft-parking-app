import { PaymentResult } from '@types/payment';
import { Platform } from 'react-native';
import Config from 'react-native-config';

// Note: Google Pay in Stripe RN SDK uses hooks (usePlatformPay) which require component context.
// For service layer, we provide utility functions. The actual Google Pay flow
// should use usePlatformPay hook in the component.

export interface GooglePayConfig {
    testEnv?: boolean;
    merchantName?: string;
    countryCode?: string;
    currencyCode?: string;
}

export const googlePayService = {
    /**
     * Check if Google Pay is available on this device (platform check only)
     * Actual availability should be checked via usePlatformPay.isPlatformPaySupported
     */
    isSupported: (): boolean => {
        return Platform.OS === 'android';
    },

    /**
     * Get Google Pay initialization config
     */
    getInitConfig: (config: GooglePayConfig = {}) => {
        const {
            testEnv = Config.GOOGLE_PAY_ENVIRONMENT !== 'PRODUCTION',
            merchantName = Config.APP_NAME || 'NRJSoft Parking',
            countryCode = Config.PAYMENT_COUNTRY_CODE || 'DE',
            currencyCode = Config.PAYMENT_CURRENCY_CODE || 'EUR',
        } = config;

        return {
            testEnv,
            merchantName,
            merchantCountryCode: countryCode,
            countryCode,
            currencyCode,
            amount: 0,
            billingAddressConfig: {
                format: 'Full' as string, // Use 'Full' or 'Min' based on SDK requirements
                isRequired: false,
            },
            existingPaymentMethodRequired: false,
        };
    },

    /**
     * Process Google Pay result into PaymentResult
     */
    processResult: (error: { message?: string } | null): PaymentResult => {
        if (error) {
            return {
                success: false,
                errorMessage: error.message || 'Google Pay failed',
            };
        }
        return { success: true, status: 'succeeded' };
    },

    /**
     * Legacy confirmGooglePay for backward compatibility
     * Note: This is a placeholder - actual implementation should use useGooglePay hook
     */
    confirmGooglePay: async (clientSecret: string): Promise<PaymentResult> => {
        if (!clientSecret) {
            return { success: false, errorMessage: 'Missing client secret' };
        }

        // In a real implementation, this would be called from a component using useGooglePay
        // This placeholder returns success for mock testing
        return { success: true, status: 'succeeded' };
    },
};
