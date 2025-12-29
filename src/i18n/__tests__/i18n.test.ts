import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import i18n from '../';
import { changeAppLanguage, initLanguage, LANGUAGE_PREFERENCE_KEY } from '../';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('i18n configuration', () => {
    const originalDateTimeFormat = Intl.DateTimeFormat;
    const originalI18nManager = NativeModules.I18nManager;
    const originalSettingsManager = NativeModules.SettingsManager;

    beforeEach(async () => {
        jest.clearAllMocks();
        await AsyncStorage.clear();
    });

    afterEach(() => {
        Intl.DateTimeFormat = originalDateTimeFormat;
        NativeModules.I18nManager = originalI18nManager;
        NativeModules.SettingsManager = originalSettingsManager;
    });

    it('uses stored language when available', async () => {
        await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, 'vi');
        const lang = await initLanguage();
        expect(lang).toBe('vi');
        expect(i18n.language).toBe('vi');
    });

    it('falls back to device language when storage is empty', async () => {
        NativeModules.I18nManager = { localeIdentifier: 'vi_VN' } as unknown as typeof NativeModules.I18nManager;
        NativeModules.SettingsManager = {
            settings: { AppleLocale: 'vi_VN', AppleLanguages: ['vi-VN'] },
        } as unknown as typeof NativeModules.SettingsManager;
        Intl.DateTimeFormat = jest.fn(() => ({
            resolvedOptions: () => ({ locale: 'vi-VN' }),
        })) as unknown as typeof Intl.DateTimeFormat;

        const lang = await initLanguage();
        expect(lang).toBe('vi');
        expect(i18n.language).toBe('vi');
    });

    it('changes language and persists preference', async () => {
        await changeAppLanguage('en');
        expect(i18n.language).toBe('en');
        expect(await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBe('en');
    });
});
