import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaymentMethodsScreen } from '../PaymentMethodsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { paymentService } from '@services/payment/paymentService';
import { Alert, Platform } from 'react-native';
import { applePayService } from '@services/payment/applePayService';


// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    OS: 'android',
    select: jest.fn(obj => obj.android || obj.default),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: mockGoBack,
            addListener: jest.fn((event, callback) => {
                if (event === 'focus') {
                    callback();
                }
                return jest.fn();
            }),
        }),
    };
});

// Mock Icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

const mockConfirmPlatformPayPayment = jest.fn().mockResolvedValue({
    error: null,
    setupIntent: { status: 'Succeeded', paymentMethodId: 'pm_test_123' },
    paymentMethod: { id: 'pm_test_123' },
});
const mockIsPlatformPaySupported = jest.fn().mockResolvedValue(true);

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
    StripeProvider: ({ children }: { children: React.ReactNode }) => children,
    initStripe: jest.fn(),
    confirmPayment: jest.fn(),
    usePlatformPay: () => ({
        isPlatformPaySupported: mockIsPlatformPaySupported,
        confirmPlatformPayPayment: mockConfirmPlatformPayPayment,
    }),
}));

jest.mock('react-native-config', () => ({
    PAYMENT_COUNTRY_CODE: 'DE',
    PAYMENT_CURRENCY_CODE: 'EUR',
    GOOGLE_PAY_ENVIRONMENT: 'TEST',
    APP_NAME: 'NRJSoft Parking',
}));

// Mock paymentService
jest.mock('@services/payment/paymentService', () => ({
    paymentService: {
        getPaymentMethods: jest.fn().mockResolvedValue([]),
        detachPaymentMethod: jest.fn().mockResolvedValue(undefined),
        attachPaymentMethod: jest.fn().mockResolvedValue(undefined),
        setDefaultPaymentMethod: jest.fn().mockResolvedValue(undefined),
        createPaymentIntent: jest.fn().mockResolvedValue({
            id: 'pi_test',
            clientSecret: 'pi_test_secret',
            amount: 100,
            currency: 'eur',
            status: 'requires_payment_method',
        }),
    },
}));

// Mock applePayService
jest.mock('@services/payment/googlePayService', () => ({
    googlePayService: {
        isSupported: jest.fn().mockReturnValue(true),
        getInitConfig: jest.fn().mockReturnValue({}),
    },
}));

jest.mock('@services/payment/applePayService', () => ({
    applePayService: {
        isSupported: jest.fn().mockReturnValue(false),
        getInitConfig: jest.fn().mockReturnValue({}),
    },
}));

describe('PaymentMethodsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsPlatformPaySupported.mockResolvedValue(true);
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        Platform.OS = 'android';
    });

    it('renders correctly', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <PaymentMethodsScreen />
            </NavigationContainer>
        );

        expect(getByText('Payment Methods')).toBeTruthy();
        await waitFor(() => {
            expect(getByText('Add Card')).toBeTruthy();
            expect(getByText('Add Google Pay')).toBeTruthy();
        });
    });

    it('navigates to AddPaymentMethod when Add Card button is pressed', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <PaymentMethodsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Add Card')).toBeTruthy();
        });

        fireEvent.press(getByText('Add Card'));
        expect(mockNavigate).toHaveBeenCalledWith('AddPaymentMethod');
    });

    it('triggers Google Pay flow when Add Google Pay button is pressed', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <PaymentMethodsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Add Google Pay')).toBeTruthy();
        });

        fireEvent.press(getByText('Add Google Pay'));

        // Check if createPaymentIntent was called
        await waitFor(() => {
            expect(paymentService.createPaymentIntent).toHaveBeenCalled();
        });
    });

    it('triggers Apple Pay flow when Add Apple Pay button is pressed', async () => {
        applePayService.isSupported.mockReturnValue(true);
        Platform.OS = 'ios';

        const { getByText } = render(
            <NavigationContainer>
                <PaymentMethodsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Add Apple Pay')).toBeTruthy();
        });

        fireEvent.press(getByText('Add Apple Pay'));

        await waitFor(() => {
            expect(paymentService.createPaymentIntent).toHaveBeenCalled();
        });
    });

    it('handles Google Pay cancel without throwing error', async () => {
        mockConfirmPlatformPayPayment.mockResolvedValueOnce({
            error: { code: 'Canceled', message: 'User canceled' },
        });

        const { getByText } = render(
            <NavigationContainer>
                <PaymentMethodsScreen />
            </NavigationContainer>
        );

        await waitFor(() => getByText('Add Google Pay'));
        fireEvent.press(getByText('Add Google Pay'));

        await waitFor(() => {
            expect(paymentService.attachPaymentMethod).not.toHaveBeenCalled();
        });
    });

    it('shows alert on Apple Pay error', async () => {
        applePayService.isSupported.mockReturnValue(true);
        Platform.OS = 'ios';

        mockConfirmPlatformPayPayment.mockResolvedValueOnce({
            error: { code: 'Failed', message: 'Apple Pay failed' },
        });

        const alertSpy = jest.spyOn(Alert, 'alert');

        const { getByText } = render(
            <NavigationContainer>
                <PaymentMethodsScreen />
            </NavigationContainer>
        );

        await waitFor(() => getByText('Add Apple Pay'));
        fireEvent.press(getByText('Add Apple Pay'));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalled();
        });
    });
});
