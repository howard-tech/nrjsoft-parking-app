import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useTheme } from '@theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const theme = useTheme();

    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return { backgroundColor: theme.colors.secondary.main };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.colors.primary.main,
                };
            default:
                return { backgroundColor: theme.colors.primary.main };
        }
    };

    const getTextColor = () => {
        if (variant === 'outline') {
            return theme.colors.primary.main;
        }
        return '#FFFFFF';
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                (disabled || loading) && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        theme.typography.button,
                        { color: getTextColor() },
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        flexDirection: 'row',
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        textAlign: 'center',
    },
});
