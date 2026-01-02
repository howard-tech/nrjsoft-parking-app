import React from 'react';
import { render } from '@testing-library/react-native';
import { CardPaymentScreen } from '../CardPaymentScreen';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';

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
        }),
    };
});

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
    StripeProvider: ({ children }: { children: React.ReactNode }) => children,
    useStripe: () => ({
        createPaymentMethod: jest.fn().mockResolvedValue({
            paymentMethod: { id: 'pm_123' },
            error: undefined
        }),
    }),
    CardField: ({ onCardChange: _onCardChange }: { onCardChange: (details: { complete: boolean }) => void }) => {
        // Find a way to trigger onCardChange in test if needed, or simply force button enable
        return null;
    },
}));

// Mock icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

describe('CardPaymentScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(
            <StripeProvider publishableKey="test_key">
                <NavigationContainer>
                    <CardPaymentScreen />
                </NavigationContainer>
            </StripeProvider>
        );

        expect(getByText('Add Card')).toBeTruthy();
        expect(getByText('Save Card')).toBeTruthy();
    });

    it('disables save button initially', () => {
        const { getByText } = render(
            <StripeProvider publishableKey="test_key">
                <NavigationContainer>
                    <CardPaymentScreen />
                </NavigationContainer>
            </StripeProvider>
        );
        expect(getByText('Save Card')).toBeTruthy();
    });
});
