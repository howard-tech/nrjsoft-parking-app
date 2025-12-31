import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseSessionTimerProps {
    startTime: string;
    onMinuteElapsed?: () => void;
}

export const useSessionTimer = ({ startTime, onMinuteElapsed }: UseSessionTimerProps) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastMinuteRef = useRef(0);
    const appState = useRef(AppState.currentState);

    const calculateElapsed = useCallback(() => {
        const start = new Date(startTime).getTime();
        const now = Date.now();
        return Math.floor((now - start) / 1000);
    }, [startTime]);

    useEffect(() => {
        setElapsedSeconds(calculateElapsed());

        intervalRef.current = setInterval(() => {
            const elapsed = calculateElapsed();
            setElapsedSeconds(elapsed);
            const currentMinute = Math.floor(elapsed / 60);
            if (currentMinute > lastMinuteRef.current) {
                lastMinuteRef.current = currentMinute;
                onMinuteElapsed?.();
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [calculateElapsed, onMinuteElapsed]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                setElapsedSeconds(calculateElapsed());
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [calculateElapsed]);

    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');

    const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    return { elapsedSeconds, hours, minutes, seconds, formattedTime };
};
