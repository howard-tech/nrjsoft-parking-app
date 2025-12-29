import { parseAxiosError } from '../errorParser';
import axios from 'axios';
import i18next from 'i18next';

jest.mock('i18next', () => ({
    t: (key: string) => key,
}));

describe('parseAxiosError', () => {
    it('returns network error when there is no response', () => {
        const error = {
            isAxiosError: true,
            response: undefined,
        };
        const result = parseAxiosError(error, 'auth.defaultError');
        expect(result).toBe('auth.networkError');
    });

    it('returns server-side message if available', () => {
        const error = {
            isAxiosError: true,
            response: {
                data: {
                    message: 'Custom server error',
                },
            },
        };
        const result = parseAxiosError(error, 'auth.defaultError');
        expect(result).toBe('Custom server error');
    });

    it('returns session expired for 401 status', () => {
        const error = {
            isAxiosError: true,
            response: {
                status: 401,
                data: {},
            },
        };
        const result = parseAxiosError(error, 'auth.defaultError');
        expect(result).toBe('auth.sessionExpired');
    });

    it('returns access denied for 403 status', () => {
        const error = {
            isAxiosError: true,
            response: {
                status: 403,
                data: {},
            },
        };
        const result = parseAxiosError(error, 'auth.defaultError');
        expect(result).toBe('auth.accessDenied');
    });

    it('returns default message key if no specific error matched', () => {
        const error = new Error('Generic error');
        const result = parseAxiosError(error, 'auth.defaultError');
        expect(result).toBe('auth.defaultError');
    });
});
