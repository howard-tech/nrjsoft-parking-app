import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            tutorial: {
                slide1: {
                    title: 'Choose how you pay.',
                    desc: 'Use NRJ Wallet or go direct with Card, Apple Pay, or Google Pay.',
                },
                slide2: {
                    title: 'Smart City Parking',
                    desc: 'Seamlessly transition between garage and on-street parking.',
                },
                slide3: {
                    title: 'Real-time Occupancy',
                    desc: 'Find the best spots before you even arrive.',
                },
                next: 'Next',
                prev: 'Prev',
                continueToSignIn: 'Continue to Sign In',
                helpHotline: 'Help Hotline',
                supportDesc: 'Need immediate assistance?',
            },
            common: {
                loading: 'Loading...',
            },
            auth: {
                secureSignIn: 'Secure Sign In',
                gdprNotice: 'OTP enforced and GDPR consent required',
                mobileNumber: 'Mobile number',
                corporateEmail: 'Corporate email',
                emailPlaceholder: 'Enter your email',
                iAccept: 'I accept the',
                termsAndConditions: 'Terms and Conditions',
                secureLogin: 'Secure login',
                orContinueWith: 'Or continue with',
                verifyAccount: 'Verify Account',
                otpSentTo: 'An verification code has been sent to',
                invalidOtp: 'Invalid code. Please try again.',
                resendCodeIn: 'Resend code in',
                resendCodeNow: 'Resend code now',
                verifyAndLogin: 'Verify and Login',
                changeNumber: 'Change number or email',
            },
        },
    },
    de: {
        translation: {
            tutorial: {
                slide1: {
                    title: 'Zahlungsmethode wählen.',
                    desc: 'Nutzen Sie die NRJ Wallet oder zahlen Sie direkt mit Karte, Apple Pay oder Google Pay.',
                },
                slide2: {
                    title: 'Smart City Parken',
                    desc: 'Nahtloser Übergang zwischen Parkhaus und Straßenparken.',
                },
                slide3: {
                    title: 'Echtzeit-Belegung',
                    desc: 'Finden Sie die besten Plätze, noch bevor Sie ankommen.',
                },
                next: 'Weiter',
                prev: 'Zurück',
                continueToSignIn: 'Weiter zum Login',
                helpHotline: 'Hilfe-Hotline',
                supportDesc: 'Benötigen Sie sofortige Hilfe?',
            },
            auth: {
                secureSignIn: 'Sichere Anmeldung',
                gdprNotice: 'OTP-erforderlich und GDPR-Zustimmung notwendig',
                mobileNumber: 'Mobilnummer',
                corporateEmail: 'Firmen-E-Mail',
                emailPlaceholder: 'E-Mail eingeben',
                iAccept: 'Ich akzeptiere die',
                termsAndConditions: 'Allgemeinen Geschäftsbedingungen',
                secureLogin: 'Sicher anmelden',
                orContinueWith: 'Oder weiter mit',
                verifyAccount: 'Konto verifizieren',
                otpSentTo: 'Ein Verifizierungscode wurde gesendet an',
                invalidOtp: 'Ungültiger Code. Bitte versuchen Sie es erneut.',
                resendCodeIn: 'Code erneut senden in',
                resendCodeNow: 'Code jetzt erneut senden',
                verifyAndLogin: 'Verifizieren und Anmelden',
                changeNumber: 'Nummer oder E-Mail ändern',
            },
        },
    },
};

i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
