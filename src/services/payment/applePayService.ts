import { PaymentResult } from '@types/payment';
import { Platform } from 'react-native';
import Config from 'react-native-config';
import { PlatformPay } from '@stripe/stripe-react-native';

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
        const countryCode = Config.PAYMENT_COUNTRY_CODE || 'DE';
        const currencyCode = Config.PAYMENT_CURRENCY_CODE || 'EUR';
        const merchantName = Config.APP_NAME || 'NRJSoft Parking';
        return {
            merchantIdentifier: Config.STRIPE_MERCHANT_ID || 'merchant.com.nrjsoft.parking',
            countryCode,
            currencyCode,
            cartItems: [
                {
                    label: merchantName,
                    amount: '0.00',
                    paymentType: PlatformPay.PaymentType.Immediate,
                },
            ],
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
