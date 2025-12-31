import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface QueuedAction {
    id: string;
    type: string;
    payload: unknown;
    timestamp: number;
    retryCount: number;
}

const QUEUE_KEY = '@offline_queue';
const MAX_RETRIES = 3;

const getAll = async (): Promise<QueuedAction[]> => {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
};

const persist = async (queue: QueuedAction[]): Promise<void> =>
    AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

export const offlineQueue = {
    add: async (type: string, payload: unknown): Promise<string> => {
        const action: QueuedAction = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            type,
            payload,
            timestamp: Date.now(),
            retryCount: 0,
        };
        const queue = await getAll();
        queue.push(action);
        await persist(queue);
        return action.id;
    },

    getAll,

    remove: async (id: string): Promise<void> => {
        const queue = await getAll();
        const filtered = queue.filter((action) => action.id !== id);
        await persist(filtered);
    },

    clear: async (): Promise<void> => {
        await AsyncStorage.removeItem(QUEUE_KEY);
    },

    processQueue: async (
        handlers: Record<string, (payload: unknown) => Promise<void>>
    ): Promise<{ success: number; failed: number }> => {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected || netState.isInternetReachable === false) {
            return { success: 0, failed: 0 };
        }

        const queue = await getAll();
        let success = 0;
        let failed = 0;

        for (const action of queue) {
            const handler = handlers[action.type];
            if (!handler) {
                await offlineQueue.remove(action.id);
                continue;
            }

            try {
                await handler(action.payload);
                await offlineQueue.remove(action.id);
                success++;
            } catch (error) {
                console.warn('Offline queue action failed', error);
                action.retryCount++;
                if (action.retryCount >= MAX_RETRIES) {
                    await offlineQueue.remove(action.id);
                    failed++;
                } else {
                    const updated = await getAll();
                    const idx = updated.findIndex((q) => q.id === action.id);
                    if (idx >= 0) {
                        updated[idx] = action;
                        await persist(updated);
                    }
                }
            }
        }

        return { success, failed };
    },
};
