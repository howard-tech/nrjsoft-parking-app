import axios from 'axios';
import i18next from 'i18next';

/**
 * Parses axios errors and returns a user-friendly localized message
 */
export const parseAxiosError = (error: unknown, defaultMessageKey: string): string => {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            // Network error
            return i18next.t('auth.networkError');
        }

        // Server-side error message
        if (error.response.data && typeof error.response.data.message === 'string') {
            return error.response.data.message;
        }

        // Handle specific status codes if needed
        if (error.response.status === 401) {
            return i18next.t('auth.sessionExpired');
        }

        if (error.response.status === 403) {
            return i18next.t('auth.accessDenied');
        }
    }

    return i18next.t(defaultMessageKey);
};
