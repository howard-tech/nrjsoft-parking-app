import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.title, { color: theme.colors.neutral.textPrimary }]}>
                {title}
            </Text>
            {description ? (
                <Text style={[styles.description, { color: theme.colors.neutral.textSecondary }]}>
                    {description}
                </Text>
            ) : null}
            {actionLabel && onAction ? (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary.main }]}
                    onPress={onAction}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.buttonText, { color: theme.colors.primary.contrast }]}>
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        maxWidth: 320,
    },
    button: {
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
