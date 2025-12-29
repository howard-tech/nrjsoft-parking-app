import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SupportedLanguage } from '../../i18n/types';

export interface LocalizationState {
    language: SupportedLanguage;
}

const initialState: LocalizationState = {
    language: 'en',
};

const localizationSlice = createSlice({
    name: 'localization',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
            state.language = action.payload;
        },
    },
});

export const { setLanguage } = localizationSlice.actions;
export default localizationSlice.reducer;
