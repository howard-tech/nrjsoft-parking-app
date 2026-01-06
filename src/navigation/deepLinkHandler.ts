import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

type DeepLinkPayload = {
    path: string;
    params: Record<string, string | undefined>;
};

const parseUrl = (url: string): DeepLinkPayload | null => {
    try {
        const parsed = new URL(url);
        const path = parsed.pathname.replace(/^\/+/, '');
        const params: Record<string, string> = {};
        parsed.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return { path, params };
    } catch (e) {
        console.warn('Failed to parse deep link', e);
        return null;
    }
};

export const handleDeepLink = (
    navigationRef: NavigationContainerRef<RootStackParamList> | null,
    url: string
): void => {
    if (!navigationRef) return;
    const payload = parseUrl(url);
    if (!payload) return;

    const { path, params } = payload;

    // Session detail: app.nrjsoft.com/session/123 or nrjsoft://session/123
    if (path.startsWith('session/')) {
        const sessionId = path.replace('session/', '');
        navigationRef.navigate('Main', {
            screen: 'SessionTab',
            params: { screen: 'SessionDetail', params: { sessionId } },
        });
        return;
    }

    // On-street session: app.nrjsoft.com/onstreet/session/123
    if (path.startsWith('onstreet/session/')) {
        const sessionId = path.replace('onstreet/session/', '');
        navigationRef.navigate('OnStreet', {
            screen: 'OnStreetSession',
            params: { sessionId },
        });
        return;
    }

    // Garage detail: app.nrjsoft.com/garage/abc
    if (path.startsWith('garage/')) {
        const garageId = path.replace('garage/', '');
        navigationRef.navigate('Main', {
            screen: 'HomeTab',
            params: { screen: 'GarageDetail', params: { garageId } },
        });
        return;
    }

    // Payment checkout: app.nrjsoft.com/pay?amount=1200
    if (path === 'pay' && params.amount) {
        const amount = Number(params.amount);
        navigationRef.navigate('Main', {
            screen: 'WalletTab',
            params: { screen: 'PaymentCheckout', params: { amount } },
        });
        return;
    }

    // Notifications: app.nrjsoft.com/notifications
    if (path === 'notifications') {
        navigationRef.navigate('Main', {
            screen: 'AccountTab',
            params: { screen: 'Notifications' },
        });
        return;
    }

    // Fallback: home
    navigationRef.navigate('Main', { screen: 'HomeTab' });
};
