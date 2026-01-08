import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@components/common/Button';

jest.mock('@theme', () => ({
    useTheme: () => ({
        colors: {
            primary: { main: '#003366' },
            secondary: { main: '#FFAA00' },
        },
        typography: {
            button: { fontSize: 16 },
        },
    }),
}));

describe('Button', () => {
    it('renders the title and triggers onPress', () => {
        const handlePress = jest.fn();
        const { getByText } = render(<Button title="Continue" onPress={handlePress} />);

        fireEvent.press(getByText('Continue'));
        expect(handlePress).toHaveBeenCalled();
    });

    it('shows a loader when loading', () => {
        const { queryByText, UNSAFE_getByType } = render(
            <Button title="Loading" onPress={jest.fn()} loading />
        );

        expect(queryByText('Loading')).toBeNull();
        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('sets accessibility state when disabled', () => {
        const { getByLabelText } = render(
            <Button title="Disabled" onPress={jest.fn()} disabled />
        );

        const button = getByLabelText('Disabled');
        expect(button).toHaveProp('accessibilityState', expect.objectContaining({ disabled: true }));
    });
});
