import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';

interface CountdownTimerProps {
    initialSeconds: number;
    onTimerEnd: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
    initialSeconds,
    onTimerEnd,
}) => {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        if (seconds <= 0) {
            onTimerEnd();
            return;
        }

        const timer = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds, onTimerEnd]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 10,
    },
    timerText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
    },
});
