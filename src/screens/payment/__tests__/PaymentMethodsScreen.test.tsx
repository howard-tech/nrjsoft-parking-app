import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaymentMethodsScreen } from '../PaymentMethodsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { paymentService } from '@services/payment/paymentService';


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

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
    StripeProvider: ({ children }: { children: React.ReactNode }) => children,
    initStripe: jest.fn(),
    confirmPayment: jest.fn(),
    usePlatformPay: () => ({
        isPlatformPaySupported: jest.fn().mockResolvedValue(true),
        confirmPlatformPayPayment: jest.fn().mockResolvedValue({
            error: null,
            setupIntent: { status: 'Succeeded', paymentMethodId: 'pm_test_123' },
            paymentMethod: { id: 'pm_test_123' },
        }),
    }),
}));

// Mock paymentService
jest.mock('@services/payment/paymentService', () => ({
    paymentService: {
        getPaymentMethods: jest.fn().mockResolvedValue([]),
        detachPaymentMethod: jest.fn().mockResolvedValue(undefined),
        attachPaymentMethod: jest.fn().mockResolvedValue(undefined),
        createPaymentIntent: jest.fn().mockResolvedValue({
            id: 'pi_test',
            clientSecret: 'pi_test_secret',
            amount: 100,
            currency: 'eur',
            status: 'requires_payment_method',
        }),
    },
}));

// Mock googlePayService
jest.mock('@services/payment/googlePayService', () => ({
    googlePayService: {
        isSupported: jest.fn().mockReturnValue(true),
        getInitConfig: jest.fn().mockReturnValue({}),
    },
}));

describe('PaymentMethodsScreen', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
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
});
