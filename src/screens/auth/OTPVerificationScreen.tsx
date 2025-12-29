import React, { useState } from 'react';
import axios from 'axios';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme';
import { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import { OTPInput } from '../../components/common/OTPInput';
import { Button } from '../../components/common/Button';
import { CountdownTimer } from './components/CountdownTimer';

type OTPRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;

import { useAuth } from '@hooks/useAuth';

export const OTPVerificationScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<OTPRouteProp>();
    const { t } = useTranslation();
    const theme = useTheme();
    const { login, requestOTP, isLoading, error: authError } = useAuth();

    const [otp, setOtp] = useState('');
    const [isTimerActive, setIsTimerActive] = useState(true);
    const [localError, setLocalError] = useState<string | null>(null);

    const { phone, email } = route.params;
    const identifier = phone || email || '';
    const type = phone ? 'mobile' : 'email';

    const handleVerify = async () => {
        if (otp.length < 6) {
            return;
        }

        setLocalError(null);

        try {
            await login(type, identifier, otp);
            // On success, RootNavigator will automatically switch to Main stack
            // because isAuthenticated becomes true.
        } catch (err) {
            // Error is handled in useAuth but we might want to show it locally too
            let message = t('auth.invalidOtp');
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            setLocalError(message);
        }
    };

    const handleResend = async () => {
        setIsTimerActive(true);
        setOtp('');
        setLocalError(null);
        try {
            await requestOTP(type, identifier);
        } catch (err) {
            let message = 'Resend failed';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            setLocalError(message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.primary.main }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('auth.verifyAccount')}</Text>
                    <Text style={styles.subtitle}>
                        {t('auth.otpSentTo')} {'\n'}
                        <Text style={styles.identifier}>{identifier}</Text>
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    <OTPInput length={6} value={otp} onChangeText={setOtp} />

                    {otp.length === 6 && (authError || localError) && (
                        <Text style={styles.errorText}>{authError || localError}</Text>
                    )}

                    <View style={styles.timerSection}>
                        {isTimerActive ? (
                            <View style={styles.timerRow}>
                                <Text style={styles.resendLabel}>{t('auth.resendCodeIn')}: </Text>
                                <CountdownTimer
                                    initialSeconds={90}
                                    onTimerEnd={() => setIsTimerActive(false)}
                                />
                            </View>
                        ) : (
                            <TouchableOpacity onPress={handleResend}>
                                <Text style={styles.resendText}>{t('auth.resendCodeNow')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <Button
                    title={t('auth.verifyAndLogin')}
                    onPress={handleVerify}
                    disabled={otp.length < 6}
                    loading={isLoading}
                    style={styles.verifyButton}
                />

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        navigation.goBack();
                    }}
                >
                    <Text style={styles.backButtonText}>{t('auth.changeNumber')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingTop: 80,
        marginBottom: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 24,
    },
    identifier: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    otpContainer: {
        marginBottom: 40,
    },
    timerSection: {
        marginTop: 32,
        alignItems: 'center',
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    },
    resendText: {
        color: '#F76C5E', // theme.colors.secondary.light
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    errorText: {
        color: '#E74C3C',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
    verifyButton: {
        marginTop: 20,
    },
    backButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    backButtonText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '600',
    },
});
