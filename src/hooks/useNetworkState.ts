import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkState {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: NetInfoState['type'];
    isWifi: boolean;
}

export const useNetworkState = (): NetworkState => {
    const [networkState, setNetworkState] = useState<NetworkState>({
        isConnected: true,
        isInternetReachable: null,
        type: 'unknown',
        isWifi: false,
    });

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setNetworkState({
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
                isWifi: state.type === 'wifi',
            });
        });

        return () => unsubscribe();
    }, []);

    return networkState;
};
