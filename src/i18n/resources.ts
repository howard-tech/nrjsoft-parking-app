import { en } from './locales/en';
import { vi } from './locales/vi';

export const resources = {
    en: { translation: en },
    vi: { translation: vi },
};

export type SupportedLanguage = keyof typeof resources;
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_PREFERENCE_KEY = '@nrjsoft.locale';

export const isSupportedLanguage = (value?: string | null): value is SupportedLanguage =>
    !!value && Object.keys(resources).includes(value);
