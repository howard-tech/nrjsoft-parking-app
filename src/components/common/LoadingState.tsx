import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface LoadingStateProps {
    message?: string;
    fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...',
    fullScreen = false,
}) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator size="large" color={theme.colors.primary.main} />
            {message ? (
                <Text style={[styles.message, { color: theme.colors.neutral.textSecondary }]}>
                    {message}
                </Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    fullScreen: {
        flex: 1,
    },
    message: {
        marginTop: 12,
        fontSize: 14,
    },
});
