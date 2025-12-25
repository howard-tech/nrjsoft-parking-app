import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface PlaceholderScreenProps {
    route?: {
        name: string;
    };
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ route }) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <Text style={[styles.text, { color: theme.colors.neutral.textPrimary }]}>
                {route?.name || 'Screen'}
            </Text>
            <Text style={[styles.subtext, { color: theme.colors.neutral.textSecondary }]}>
                Screen coming soon
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    text: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 16,
        fontWeight: '400',
    },
});
