import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface SessionTimerProps {
    formattedTime: string;
    size?: 'small' | 'large';
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ formattedTime, size = 'large' }) => {
    const theme = useTheme();
    const fontSize = size === 'large' ? 42 : 20;
    return <Text style={[styles.timer, { color: theme.colors.neutral.textPrimary, fontSize }]}>{formattedTime}</Text>;
};

const styles = StyleSheet.create({
    timer: {
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
});
