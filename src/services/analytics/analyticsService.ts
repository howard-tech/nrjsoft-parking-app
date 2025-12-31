import analytics from '@react-native-firebase/analytics';

export interface AnalyticsEvent {
    name: string;
    params?: Record<string, string | number | boolean | null>;
}

export const analyticsService = {
    initialize: async (): Promise<void> => {
        await analytics().setAnalyticsCollectionEnabled(!__DEV__);
    },

    logScreenView: async (screenName: string, screenClass?: string): Promise<void> => {
        await analytics().logScreenView({
            screen_name: screenName,
            screen_class: screenClass ?? screenName,
        });
    },

    logEvent: async (eventName: string, params?: Record<string, unknown>): Promise<void> => {
        await analytics().logEvent(eventName, params);
    },

    setUserId: async (userId: string | null): Promise<void> => {
        await analytics().setUserId(userId);
    },

    setUserProperty: async (name: string, value: string): Promise<void> => {
        await analytics().setUserProperty(name, value);
    },

    setUserProperties: async (properties: Record<string, string>): Promise<void> => {
        await analytics().setUserProperties(properties);
    },

    events: {
        login: (method: string) => analyticsService.logEvent('login', { method }),
        logout: () => analyticsService.logEvent('logout'),
        signUp: (method: string) => analyticsService.logEvent('sign_up', { method }),
        garageView: (garageId: string, garageName: string) =>
            analyticsService.logEvent('garage_view', { garage_id: garageId, garage_name: garageName }),
        searchPerformed: (query: string, resultsCount: number) =>
            analyticsService.logEvent('search', { query, results_count: resultsCount }),
        navigationStarted: (garageId: string, app: string) =>
            analyticsService.logEvent('navigation_started', { garage_id: garageId, app }),
    },
};
