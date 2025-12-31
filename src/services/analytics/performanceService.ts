import perf, { FirebasePerformanceTypes } from '@react-native-firebase/perf';

export const performanceService = {
    initialize: async (): Promise<void> => {
        await perf().setPerformanceCollectionEnabled(!__DEV__);
    },

    startTrace: async (traceName: string): Promise<FirebasePerformanceTypes.Trace> => {
        return perf().startTrace(traceName);
    },

    measureAsync: async <T>(
        traceName: string,
        operation: () => Promise<T>,
        attributes?: Record<string, string>
    ): Promise<T> => {
        const trace = await perf().startTrace(traceName);

        if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => trace.putAttribute(key, value));
        }

        try {
            const result = await operation();
            trace.putMetric('success', 1);
            return result;
        } catch (error) {
            trace.putMetric('success', 0);
            throw error;
        } finally {
            await trace.stop();
        }
    },
};
