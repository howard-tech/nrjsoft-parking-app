import React, { useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, Theme } from '@theme';
import { googleAuthService } from '@services/auth/googleAuth';
import { appleAuthService } from '@services/auth/appleAuth';
import { useAppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';

type Provider = 'google' | 'apple' | null;

interface SocialLoginButtonsProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onSuccess, onError }) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [loading, setLoading] = useState<Provider>(null);

    const handleError = (message: string) => {
        if (onError) {
            onError(message);
            return;
        }
        Alert.alert('Sign-in failed', message);
    };

    const handleGoogleSignIn = async () => {
        setLoading('google');
        try {
            const response = await googleAuthService.signIn();
            dispatch(
                setCredentials({
                    user: response.user,
                    isAuthenticated: true,
                })
            );
            onSuccess?.();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unable to sign in with Google';
            handleError(message);
        } finally {
            setLoading(null);
        }
    };

    const handleAppleSignIn = async () => {
        if (!appleAuthService.isSupported()) {
            handleError('Apple Sign-In is not supported on this device');
            return;
        }

        setLoading('apple');
        try {
            const response = await appleAuthService.signIn();
            dispatch(
                setCredentials({
                    user: response.user,
                    isAuthenticated: true,
                })
            );
            onSuccess?.();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unable to sign in with Apple';
            handleError(message);
        } finally {
            setLoading(null);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, styles.googleButton, loading && styles.disabled]}
                onPress={handleGoogleSignIn}
                disabled={loading !== null}
                activeOpacity={0.85}
            >
                <Icon name="google" size={20} color={theme.colors.neutral.black} style={styles.icon} />
                <Text style={styles.googleText}>
                    {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
                </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
                <TouchableOpacity
                    style={[styles.button, styles.appleButton, loading && styles.disabled]}
                    onPress={handleAppleSignIn}
                    disabled={loading !== null}
                    activeOpacity={0.85}
                >
                    <Icon name="apple" size={20} color={theme.colors.neutral.white} style={styles.icon} />
                    <Text style={styles.appleText}>
                        {loading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            marginTop: 12,
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            borderRadius: theme.borderRadius.md,
        },
        googleButton: {
            backgroundColor: theme.colors.neutral.white,
            borderWidth: 1,
            borderColor: theme.colors.neutral.border,
        },
        appleButton: {
            backgroundColor: theme.colors.neutral.black,
            marginTop: 12,
        },
        googleText: {
            color: theme.colors.neutral.textPrimary,
            fontSize: 16,
            fontWeight: '600',
        },
        appleText: {
            color: theme.colors.neutral.white,
            fontSize: 16,
            fontWeight: '600',
        },
        icon: {
            marginRight: 10,
        },
        disabled: {
            opacity: 0.8,
        },
    });
