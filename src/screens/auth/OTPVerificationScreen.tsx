import React, { useState } from 'react';
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
import { AuthStackParamList } from '../../navigation/types';
import { OTPInput } from '../../components/common/OTPInput';
import { Button } from '../../components/common/Button';
import { CountdownTimer } from './components/CountdownTimer';

type OTPRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;

export const OTPVerificationScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>>();
    const route = useRoute<OTPRouteProp>();
    const { t } = useTranslation();
    const theme = useTheme();

    const [otp, setOtp] = useState('');
    const [isTimerActive, setIsTimerActive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { phone, email } = route.params;
    const identifier = phone || email || '';

    const handleVerify = () => {
        if (otp.length < 4) return;

        setIsLoading(true);
        setError(null);

        // Simulate OTP verification
        setTimeout(() => {
            setIsLoading(false);
            if (otp === '1234') { // Mock success code
                // In a real app, this would update auth state or navigate to Main
                // For now, we simulate navigation to Main app stack
                // We'll use navigation.replace if the navigator structure allows, 
                // but since we are in AuthStack, we'll navigate to the Root Navigator's 'Main'
                (navigation as any).navigate('Main');
            } else {
                setError(t('auth.invalidOtp'));
            }
        }, 1500);
    };

    const handleResend = () => {
        setIsTimerActive(true);
        setOtp('');
        setError(null);
        // Simulate resend API call
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
                    <OTPInput value={otp} onChangeText={setOtp} />

                    {error && <Text style={styles.errorText}>{error}</Text>}

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
                    disabled={otp.length < 4}
                    loading={isLoading}
                    style={styles.verifyButton}
                />

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
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
