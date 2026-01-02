import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    Alert,
    Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@theme';
import { AuthStackParamList } from '../../navigation/types';
import { PhoneInput } from '../../components/common/PhoneInput';
import { Checkbox } from '../../components/common/Checkbox';
import { Button } from '../../components/common/Button';
import { SocialLoginButtons } from '@components/auth/SocialLoginButtons';
import axios from 'axios';

export const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
    const { t } = useTranslation();
    const theme = useTheme();
    const { requestOTP, requestOtpLoading, error: authError } = useAuth();

    const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
    const [identifier, setIdentifier] = useState('888123456');
    const [countryCode, setCountryCode] = useState('+359');
    const [gdprConsent, setGdprConsent] = useState(false);

    const handleLogin = async () => {
        if (!identifier || !gdprConsent) {
            return;
        }

        try {
            const cleanedIdentifier = identifier.trim();
            const finalIdentifier =
                authMethod === 'phone'
                    ? cleanedIdentifier.startsWith('+')
                        ? cleanedIdentifier
                        : `${countryCode}${cleanedIdentifier}`
                    : cleanedIdentifier;

            Keyboard.dismiss();
            await requestOTP(authMethod === 'phone' ? 'mobile' : 'email', finalIdentifier);
            if (__DEV__) {
                Alert.alert('OTP sent', 'Use mock OTP: 123456');
            }
            navigation.push('OTPVerification', {
                phone: authMethod === 'phone' ? finalIdentifier : undefined,
                email: authMethod === 'email' ? finalIdentifier : undefined,
            });
        } catch (error) {
            console.error('Login request failed:', error);
            // Handle transient errors like network issues with an Alert
            if (axios.isAxiosError(error) && !error.response) {
                Alert.alert(t('common.error'), t('auth.networkError'));
            }
        }
    };

    const handleSocialError = (message: string) => {
        Alert.alert(t('common.error'), message);
    };

    const themedStyles = useMemo(
        () =>
            StyleSheet.create({
                tabContainerBg: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                tabSelected: { backgroundColor: theme.colors.neutral.white },
                tabTextActive: { color: theme.colors.primary.main },
                tabTextInactive: { color: 'rgba(255, 255, 255, 0.6)' },
                emailBox: {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                subtitleMuted: { color: 'rgba(255, 255, 255, 0.6)' },
            }),
        [theme.colors.neutral.white, theme.colors.primary.main]
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.primary.main }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/images/nrj-logo.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.title}>{t('auth.secureSignIn')}</Text>
                    <Text style={[styles.subtitle, themedStyles.subtitleMuted]}>{t('auth.gdprNotice')}</Text>
                </View>

                {/* Tab Selector */}
                <View style={[styles.tabContainer, themedStyles.tabContainerBg]}>
                    <TouchableOpacity
                        style={[styles.tab, authMethod === 'phone' && themedStyles.tabSelected]}
                        onPress={() => {
                            setAuthMethod('phone');
                            setIdentifier('');
                        }}
                        accessibilityLabel={t('auth.mobileNumber')}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: authMethod === 'phone' }}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                authMethod === 'phone' ? themedStyles.tabTextActive : themedStyles.tabTextInactive,
                            ]}
                        >
                            {t('auth.mobileNumber')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, authMethod === 'email' && themedStyles.tabSelected]}
                        onPress={() => {
                            setAuthMethod('email');
                            setIdentifier('');
                        }}
                        accessibilityLabel={t('auth.corporateEmail')}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: authMethod === 'email' }}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                authMethod === 'email' ? themedStyles.tabTextActive : themedStyles.tabTextInactive,
                            ]}
                        >
                            {t('auth.corporateEmail')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <View style={styles.formContainer}>
                    {authMethod === 'phone' ? (
                        <PhoneInput
                            value={identifier}
                            onChangeText={setIdentifier}
                            countryCode={countryCode}
                            onCountryChange={setCountryCode}
                            accessibilityLabel={t('auth.mobileNumber')}
                        />
                    ) : (
                        <View style={[styles.inputBox, themedStyles.emailBox]}>
                            <TextInput
                                style={[styles.emailInput, { color: theme.colors.neutral.white }]}
                                placeholder={t('auth.emailPlaceholder')}
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={identifier}
                                onChangeText={setIdentifier}
                                accessibilityLabel={t('auth.corporateEmail')}
                            />
                        </View>
                    )}

                    <Checkbox
                        checked={gdprConsent}
                        onChange={setGdprConsent}
                        style={styles.checkbox}
                        accessibilityLabel={t('auth.iAccept')}
                        label={
                            <Text style={[styles.checkboxLabel, { color: theme.colors.neutral.white }]}>
                                {t('auth.iAccept')}{' '}
                                <Text style={[styles.linkText, { color: theme.colors.neutral.white }]}>{t('auth.termsAndConditions')}</Text>
                            </Text>
                        }
                    />

                    <Button
                        title={t('auth.secureLogin')}
                        onPress={handleLogin}
                        variant="secondary"
                        disabled={!identifier || !gdprConsent}
                        loading={requestOtpLoading}
                        style={styles.loginButton}
                        accessibilityLabel={t('auth.secureLogin')}
                    />

                    {authError && (
                        <Text style={[styles.errorText, { color: theme.colors.secondary.light }]}>{authError}</Text>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social Login */}
                <SocialLoginButtons onError={handleSocialError} />
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
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 32,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    formContainer: {
        marginBottom: 40,
    },
    inputBox: {
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    emailInput: {
        fontSize: 16,
        fontWeight: '500',
    },
    checkbox: {
        marginTop: 24,
    },
    checkboxLabel: {
        fontSize: 13,
        lineHeight: 18,
    },
    linkText: {
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    loginButton: {
        marginTop: 32,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    dividerText: {
        color: 'rgba(255, 255, 255, 0.4)',
        paddingHorizontal: 16,
        fontSize: 12,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
});
