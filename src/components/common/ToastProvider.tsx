import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@theme';

type ToastType = 'info' | 'success' | 'error';

type ToastContextValue = {
    showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = useTheme();
    const [message, setMessage] = useState<string | null>(null);
    const [type, setType] = useState<ToastType>('info');
    const opacity = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = useCallback(
        (nextMessage: string, nextType: ToastType = 'info') => {
            setMessage(nextMessage);
            setType(nextType);
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
                    setMessage(null);
                });
            }, 2500);
        },
        [opacity]
    );

    const value = useMemo(() => ({ showToast }), [showToast]);

    const backgroundColor =
        type === 'error'
            ? theme.colors.error.main
            : type === 'success'
              ? theme.colors.success.main
              : theme.colors.primary.main;

    return (
        <ToastContext.Provider value={value}>
            {children}
            {message ? (
                <Animated.View style={[styles.container, { backgroundColor, opacity }]}>
                    <Text style={styles.text}>{message}</Text>
                </Animated.View>
            ) : null}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextValue => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 32,
        left: 16,
        right: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        zIndex: 999,
    },
    text: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
        textAlign: 'center',
    },
});

export default ToastProvider;
