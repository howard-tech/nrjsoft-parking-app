import React, { useState } from 'react';
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
import { SocialLoginButtons } from './components/SocialLoginButtons';

export const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
    const { t } = useTranslation();
    const theme = useTheme();
    const { requestOTP, isLoading, error: authError } = useAuth();

    const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
    const [identifier, setIdentifier] = useState('');
    const [gdprConsent, setGdprConsent] = useState(false);

    const handleLogin = async () => {
        if (!identifier || !gdprConsent) {
            return;
        }

        try {
            await requestOTP(authMethod === 'phone' ? 'mobile' : 'email', identifier);
            navigation.navigate('OTPVerification', {
                phone: authMethod === 'phone' ? identifier : undefined,
                email: authMethod === 'email' ? identifier : undefined,
            });
        } catch (error) {
            // Error is handled in useAuth hook (stored in state)
            console.error('Login request failed:', error);
        }
    };

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
                    <Text style={styles.subtitle}>{t('auth.gdprNotice')}</Text>
                </View>

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, authMethod === 'phone' && styles.activeTab]}
                        onPress={() => {
                            setAuthMethod('phone');
                            setIdentifier('');
                        }}
                    >
                        <Text style={[styles.tabText, authMethod === 'phone' && styles.activeTabText]}>
                            {t('auth.mobileNumber')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, authMethod === 'email' && styles.activeTab]}
                        onPress={() => {
                            setAuthMethod('email');
                            setIdentifier('');
                        }}
                    >
                        <Text style={[styles.tabText, authMethod === 'email' && styles.activeTabText]}>
                            {t('auth.corporateEmail')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <View style={styles.formContainer}>
                    {authMethod === 'phone' ? (
                        <PhoneInput value={identifier} onChangeText={setIdentifier} />
                    ) : (
                        <View style={styles.inputBox}>
                            <TextInput
                                style={styles.emailInput}
                                placeholder={t('auth.emailPlaceholder')}
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={identifier}
                                onChangeText={setIdentifier}
                            />
                        </View>
                    )}

                    <Checkbox
                        checked={gdprConsent}
                        onChange={setGdprConsent}
                        style={styles.checkbox}
                        label={
                            <Text style={styles.checkboxLabel}>
                                {t('auth.iAccept')}{' '}
                                <Text style={styles.linkText}>{t('auth.termsAndConditions')}</Text>
                            </Text>
                        }
                    />

                    <Button
                        title={t('auth.secureLogin')}
                        onPress={handleLogin}
                        variant="secondary"
                        disabled={!identifier || !gdprConsent}
                        loading={isLoading}
                        style={styles.loginButton}
                    />

                    {authError && (
                        <Text style={styles.errorText}>{authError}</Text>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social Login */}
                <SocialLoginButtons />
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
        color: '#FFFFFF',
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
    activeTab: {
        backgroundColor: '#FFFFFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    activeTabText: {
        color: '#1E3A5F',
    },
    formContainer: {
        marginBottom: 40,
    },
    inputBox: {
        height: 56,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    emailInput: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    checkbox: {
        marginTop: 24,
    },
    checkboxLabel: {
        color: '#FFFFFF',
        fontSize: 13,
        lineHeight: 18,
    },
    linkText: {
        color: '#FFFFFF',
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
        color: '#FF4D4D',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
});
