import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@theme';
import { NavigationDestination, externalNavigationService } from '@services/navigation/externalNavigation';

interface NavigateButtonProps {
    destination: NavigationDestination;
    variant?: 'primary' | 'outline';
    size?: 'small' | 'medium' | 'large';
}

export const NavigateButton: React.FC<NavigateButtonProps> = ({
    destination,
    variant = 'outline',
    size = 'medium',
}) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const sizeStyles = {
        small: { paddingVertical: 6, paddingHorizontal: 12, icon: 16, text: 12 },
        medium: { paddingVertical: 10, paddingHorizontal: 16, icon: 20, text: 14 },
        large: { paddingVertical: 14, paddingHorizontal: 20, icon: 24, text: 16 },
    }[size];

    const handlePress = () => {
        externalNavigationService.showNavigationOptions(destination);
    };

    const isPrimary = variant === 'primary';
    const variantStyle = isPrimary ? styles.primary : styles.outline;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    paddingVertical: sizeStyles.paddingVertical,
                    paddingHorizontal: sizeStyles.paddingHorizontal,
                },
                variantStyle,
            ]}
            onPress={handlePress}
            accessibilityLabel={`Navigate to ${destination.label || 'parking'}`}
            accessibilityRole="button"
        >
            <Icon
                name="navigation-variant"
                size={sizeStyles.icon}
                color={isPrimary ? '#FFFFFF' : theme.colors.neutral.textPrimary}
            />
            <Text
                style={[
                    styles.text,
                    { fontSize: sizeStyles.text },
                    isPrimary ? styles.textOnPrimary : styles.textDefault,
                ]}
            >
                Navigate
            </Text>
        </TouchableOpacity>
    );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            gap: 8,
        },
        text: {
            fontWeight: '600',
        },
        textDefault: {
            color: theme.colors.neutral.textPrimary,
        },
        textOnPrimary: {
            color: '#FFFFFF',
        },
        primary: {
            backgroundColor: theme.colors.primary.main,
            borderColor: theme.colors.primary.main,
            borderWidth: 0,
        },
        outline: {
            backgroundColor: theme.colors.neutral.surface,
            borderColor: theme.colors.neutral.border,
            borderWidth: 1,
        },
    });
