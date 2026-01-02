import React, { useMemo, useState } from 'react';
import axios from 'axios';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme';
import { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import { OTPInput } from '../../components/common/OTPInput';
import { Button } from '../../components/common/Button';
import { CountdownTimer } from './components/CountdownTimer';
import { useAuth } from '../../hooks/useAuth';

type OTPRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;

export const OTPVerificationScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<OTPRouteProp>();
    const { t } = useTranslation();
    const theme = useTheme();
    const { login, requestOTP, verifyOtpLoading, requestOtpLoading, error: authError } = useAuth();

    const [otp, setOtp] = useState('');
    const [isTimerActive, setIsTimerActive] = useState(true);
    const [localError, setLocalError] = useState<string | null>(null);
    const { phone, email } = route.params;
    const identifier = phone || email || '';
    const type = phone ? 'mobile' : 'email';
    const themedStyles = useMemo(
        () =>
            StyleSheet.create({
                containerBg: { backgroundColor: theme.colors.primary.main },
                titleColor: { color: theme.colors.neutral.white },
                subtitleMuted: { color: 'rgba(255, 255, 255, 0.7)' },
                identifierColor: { color: theme.colors.neutral.white },
                devHint: { color: 'rgba(255, 255, 255, 0.8)' },
                resendLabelMuted: { color: 'rgba(255, 255, 255, 0.6)' },
                resendAccent: { color: theme.colors.secondary.light },
                backTextMuted: { color: 'rgba(255, 255, 255, 0.6)' },
                errorColor: { color: theme.colors.error.main },
            }),
        [theme.colors]
    );

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
                if (!err.response) {
                    Alert.alert(t('common.error'), t('auth.networkError'));
                    return;
                }
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
                if (!err.response) {
                    Alert.alert(t('common.error'), t('auth.networkError'));
                    return;
                }
                message = err.response?.data?.message || message;
            }
            setLocalError(message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, themedStyles.containerBg]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, themedStyles.titleColor]}>{t('auth.verifyAccount')}</Text>
                    <Text style={[styles.subtitle, themedStyles.subtitleMuted]}>
                        {t('auth.otpSentTo')} {'\n'}
                        <Text style={[styles.identifier, themedStyles.identifierColor]}>{identifier}</Text>
                        {__DEV__ && (
                            <>
                                {'\n'}
                                <Text style={[styles.devHint, themedStyles.devHint]}>{t('auth.devOtpHint', { defaultValue: 'Use mock OTP 123456' })}</Text>
                            </>
                        )}
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    <OTPInput length={6} value={otp} onChangeText={setOtp} />

                    {otp.length === 6 && (authError || localError) && (
                        <Text style={[styles.errorText, themedStyles.errorColor]}>{authError || localError}</Text>
                    )}

                    <View style={styles.timerSection}>
                        {isTimerActive ? (
                            <View style={styles.timerRow}>
                                <Text style={[styles.resendLabel, themedStyles.resendLabelMuted]}>{t('auth.resendCodeIn')}: </Text>
                                <CountdownTimer
                                    initialSeconds={90}
                                    onTimerEnd={() => setIsTimerActive(false)}
                                />
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={requestOtpLoading}
                                accessibilityRole="button"
                                accessibilityLabel={t('auth.resendCodeNow')}
                                accessibilityState={{ disabled: requestOtpLoading }}
                            >
                                <Text style={[styles.resendText, themedStyles.resendAccent, requestOtpLoading && styles.disabledText]}>
                                    {requestOtpLoading ? t('common.loading') : t('auth.resendCodeNow')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <Button
                    title={t('auth.verifyAndLogin')}
                    onPress={handleVerify}
                    disabled={otp.length < 6}
                    loading={verifyOtpLoading}
                    style={styles.verifyButton}
                />

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        navigation.goBack();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t('auth.changeNumber')}
                >
                    <Text style={[styles.backButtonText, themedStyles.backTextMuted]}>{t('auth.changeNumber')}</Text>
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
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    identifier: {
        fontWeight: '600',
    },
    devHint: {
        fontSize: 12,
        fontWeight: '400',
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
        fontSize: 14,
    },
    resendText: {
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    disabledText: {
        opacity: 0.5,
    },
    errorText: {
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
        fontSize: 14,
        fontWeight: '600',
    },
});
