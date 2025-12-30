import { en } from './locales/en';
import { vi } from './locales/vi';
import { de } from './locales/de';
import { fr } from './locales/fr';
import { bg } from './locales/bg';

export const resources = {
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    bg: { translation: bg },
    vi: { translation: vi },
};

export type SupportedLanguage = keyof typeof resources;
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_PREFERENCE_KEY = '@nrjsoft.locale';

export const supportedLanguages = Object.keys(resources) as SupportedLanguage[];

export const isSupportedLanguage = (value?: string | null): value is SupportedLanguage =>
    !!value && supportedLanguages.includes(value as SupportedLanguage);
