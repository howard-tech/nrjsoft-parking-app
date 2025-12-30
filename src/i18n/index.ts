import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, LANGUAGE_PREFERENCE_KEY, resources, SupportedLanguage, isSupportedLanguage } from './resources';

const getDeviceLanguage = (): SupportedLanguage => {
    const locale =
        Platform.OS === 'ios'
            ? NativeModules.SettingsManager?.settings?.AppleLocale ||
              NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
            : NativeModules.I18nManager?.localeIdentifier || Intl.DateTimeFormat().resolvedOptions().locale;

    const normalized = (locale || DEFAULT_LANGUAGE).split(/[_-]/)[0].toLowerCase();
    return isSupportedLanguage(normalized) ? normalized : DEFAULT_LANGUAGE;
};

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
        escapeValue: false,
    },
});

export const initLanguage = async (): Promise<SupportedLanguage> => {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    const language = isSupportedLanguage(storedLanguage) ? storedLanguage : getDeviceLanguage();
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
    return language;
};

export const changeAppLanguage = async (language: SupportedLanguage): Promise<void> => {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
};

export { resources, SupportedLanguage, DEFAULT_LANGUAGE, LANGUAGE_PREFERENCE_KEY };
export default i18n;
