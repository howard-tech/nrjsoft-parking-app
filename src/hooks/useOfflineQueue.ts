import { useCallback, useEffect, useMemo } from 'react';
import { NetworkState, useNetworkState } from './useNetworkState';
import { offlineQueue } from '@services/offline/offlineQueue';

export type OfflineHandlers = Record<string, (payload: unknown) => Promise<void>>;

export const useOfflineQueue = (handlers: OfflineHandlers, networkState?: NetworkState) => {
    const internalNetworkState = useNetworkState();
    const resolvedNetworkState = networkState ?? internalNetworkState;
    const { isConnected, isInternetReachable } = resolvedNetworkState;

    const handlerMap = useMemo(() => handlers, [handlers]);

    const enqueue = useCallback(
        async (type: string, payload: unknown) => offlineQueue.add(type, payload),
        []
    );

    const process = useCallback(async () => offlineQueue.processQueue(handlerMap), [handlerMap]);

    useEffect(() => {
        if (isConnected && isInternetReachable !== false) {
            process();
        }
    }, [isConnected, isInternetReachable, process]);

    return { enqueue, process, networkState: resolvedNetworkState };
};
