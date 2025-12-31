import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { formatDuration } from '@utils/formatters';

interface SessionTimerProps {
    seconds: number;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ seconds }) => {
    const theme = useTheme();
    return <Text style={[styles.timer, { color: theme.colors.neutral.textPrimary }]}>{formatDuration(seconds)}</Text>;
};

const styles = StyleSheet.create({
    timer: {
        fontSize: 42,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
});
