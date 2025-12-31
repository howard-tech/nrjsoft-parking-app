import { fetch as pinnedFetch } from 'react-native-ssl-pinning';

// Placeholder certificate names bundled in native assets
const CERTS = ['cert1', 'cert2'];

export const createPinnedFetch = () => {
    return async (url: string, options: RequestInit = {}) => {
        const response = await pinnedFetch(url, {
            method: options.method ?? 'GET',
            headers: options.headers as Record<string, string> | undefined,
            body: options.body as string | undefined,
            sslPinning: { certs: CERTS },
            timeoutInterval: 30000,
        });

        return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            json: () => Promise.resolve(response.json()),
            text: () => Promise.resolve(response.bodyString),
            headers: response.headers,
        };
    };
};
