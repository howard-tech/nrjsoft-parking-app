import { useCallback } from 'react';
import { changeAppLanguage, initLanguage } from '../i18n';
import { SupportedLanguage } from '../i18n/types';
import { useAppDispatch, useAppSelector } from '../store';
import { setLanguage } from '../store/slices/localizationSlice';

export const useLocalization = () => {
    const dispatch = useAppDispatch();
    const language = useAppSelector((state) => state.localization.language);

    const bootstrapLanguage = useCallback(async (): Promise<SupportedLanguage> => {
        const detected = await initLanguage();
        dispatch(setLanguage(detected));
        return detected;
    }, [dispatch]);

    const updateLanguage = useCallback(
        async (locale: SupportedLanguage) => {
            await changeAppLanguage(locale);
            dispatch(setLanguage(locale));
        },
        [dispatch]
    );

    return {
        language,
        bootstrapLanguage,
        updateLanguage,
    };
};
