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
