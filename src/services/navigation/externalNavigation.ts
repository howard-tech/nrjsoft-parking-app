import { ActionSheetIOS, Alert, Linking, Platform } from 'react-native';

export interface NavigationDestination {
    latitude: number;
    longitude: number;
    label?: string;
    address?: string;
}

export type NavigationApp = 'google' | 'apple' | 'waze' | 'default';

const buildGoogleMapsUrl = (dest: NavigationDestination): string => {
    const baseUrl = Platform.select({
        ios: 'comgooglemaps://',
        android: 'google.navigation:',
    });

    if (Platform.OS === 'ios') {
        return `${baseUrl}?daddr=${dest.latitude},${dest.longitude}&directionsmode=driving`;
    }

    return `${baseUrl}q=${dest.latitude},${dest.longitude}`;
};

const buildAppleMapsUrl = (dest: NavigationDestination): string =>
    `maps://?daddr=${dest.latitude},${dest.longitude}&dirflg=d`;

const buildWazeUrl = (dest: NavigationDestination): string =>
    `waze://?ll=${dest.latitude},${dest.longitude}&navigate=yes`;

const buildWebGoogleMapsUrl = (dest: NavigationDestination): string =>
    `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`;

const testUrls: Record<NavigationApp, string> = {
    google: Platform.OS === 'ios' ? 'comgooglemaps://' : 'google.navigation:',
    apple: 'maps://',
    waze: 'waze://',
    default: '',
};

const appLabels: Record<NavigationApp, string> = {
    google: 'Google Maps',
    apple: 'Apple Maps',
    waze: 'Waze',
    default: 'Open in Browser',
};

export const externalNavigationService = {
    isAppInstalled: async (app: NavigationApp): Promise<boolean> => {
        if (app === 'default' || !testUrls[app]) {
            return true;
        }
        try {
            return await Linking.canOpenURL(testUrls[app]);
        } catch {
            return false;
        }
    },

    getAvailableApps: async (): Promise<NavigationApp[]> => {
        const apps: NavigationApp[] = [];
        if (await externalNavigationService.isAppInstalled('google')) {
            apps.push('google');
        }
        if (Platform.OS === 'ios' && (await externalNavigationService.isAppInstalled('apple'))) {
            apps.push('apple');
        }
        if (await externalNavigationService.isAppInstalled('waze')) {
            apps.push('waze');
        }
        apps.push('default');
        return apps;
    },

    navigateTo: async (dest: NavigationDestination, app: NavigationApp): Promise<boolean> => {
        let url: string;
        switch (app) {
            case 'google':
                url = buildGoogleMapsUrl(dest);
                break;
            case 'apple':
                url = buildAppleMapsUrl(dest);
                break;
            case 'waze':
                url = buildWazeUrl(dest);
                break;
            case 'default':
            default:
                url = buildWebGoogleMapsUrl(dest);
                break;
        }

        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
                return true;
            }
            await Linking.openURL(buildWebGoogleMapsUrl(dest));
            return true;
        } catch (error) {
            console.warn('Navigation error', error);
            return false;
        }
    },

    showNavigationOptions: async (dest: NavigationDestination): Promise<void> => {
        const availableApps = await externalNavigationService.getAvailableApps();

        if (Platform.OS === 'ios') {
            const options = availableApps.map((app) => appLabels[app]);
            options.push('Cancel');
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    title: 'Open directions in...',
                    options,
                    cancelButtonIndex: options.length - 1,
                },
                async (buttonIndex) => {
                    if (buttonIndex < availableApps.length) {
                        await externalNavigationService.navigateTo(dest, availableApps[buttonIndex]);
                    }
                }
            );
            return;
        }

        const buttons = availableApps.map((app) => ({
            text: appLabels[app],
            onPress: () => externalNavigationService.navigateTo(dest, app),
        }));
        buttons.push({ text: 'Cancel', style: 'cancel' as const });
        Alert.alert('Open directions in...', undefined, buttons);
    },
};
