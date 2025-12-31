import crashlytics from '@react-native-firebase/crashlytics';

export const crashReportingService = {
    initialize: async (): Promise<void> => {
        await crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
    },

    setUserId: async (userId: string | null): Promise<void> => {
        if (userId) {
            await crashlytics().setUserId(userId);
            return;
        }
        await crashlytics().setUserId('');
    },

    setAttribute: async (key: string, value: string): Promise<void> => {
        await crashlytics().setAttribute(key, value);
    },

    setAttributes: async (attributes: Record<string, string>): Promise<void> => {
        await crashlytics().setAttributes(attributes);
    },

    log: (message: string): void => {
        crashlytics().log(message);
    },

    recordError: (error: Error, context?: Record<string, string>): void => {
        if (context) {
            crashlytics().setAttributes(context);
        }
        crashlytics().recordError(error);
    },
};
