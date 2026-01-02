import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaymentMethodsScreen } from '../PaymentMethodsScreen';
import { NavigationContainer } from '@react-navigation/native';


// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: jest.fn(),
        }),
    };
});

// Mock Icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

describe('PaymentMethodsScreen', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renders correctly', () => {
        const { getByText } = render(
            <NavigationContainer>
                <PaymentMethodsScreen />
            </NavigationContainer>
        );

        expect(getByText('Payment Methods')).toBeTruthy();
        expect(getByText('Add Payment Method')).toBeTruthy();
    });

    it('navigates to AddPaymentMethod when button is pressed', () => {
        const { getByText } = render(
            <NavigationContainer>
                <PaymentMethodsScreen />
            </NavigationContainer>
        );

        fireEvent.press(getByText('Add Payment Method'));
        expect(mockNavigate).toHaveBeenCalledWith('AddPaymentMethod');
    });
});
