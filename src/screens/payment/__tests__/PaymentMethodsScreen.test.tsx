import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaymentMethodsScreen } from '../PaymentMethodsScreen';
import { NavigationContainer } from '@react-navigation/native';


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
}));

// Mock paymentService
jest.mock('@services/payment/paymentService', () => ({
    paymentService: {
        getPaymentMethods: jest.fn().mockResolvedValue([]),
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
            expect(getByText('Add Payment Method')).toBeTruthy();
        });
    });

    it('navigates to AddPaymentMethod when button is pressed', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <PaymentMethodsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Add Payment Method')).toBeTruthy();
        });

        fireEvent.press(getByText('Add Payment Method'));
        expect(mockNavigate).toHaveBeenCalledWith('AddPaymentMethod');
    });
});
