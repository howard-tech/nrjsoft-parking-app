import AsyncStorage from '@react-native-async-storage/async-storage';
import { Region } from 'react-native-maps';
import { ParkingGarage } from '@services/parking/parkingService';

const CACHED_GARAGES_KEY = '@cached_garages';

export interface CachedGaragesPayload {
    garages: ParkingGarage[];
    region?: Region;
    timestamp: number;
}

export const offlineCache = {
    saveGarages: async (garages: ParkingGarage[], region?: Region): Promise<void> => {
        const payload: CachedGaragesPayload = {
            garages,
            region,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(CACHED_GARAGES_KEY, JSON.stringify(payload));
    },

    loadGarages: async (): Promise<CachedGaragesPayload | null> => {
        const stored = await AsyncStorage.getItem(CACHED_GARAGES_KEY);
        if (!stored) {
            return null;
        }
        try {
            return JSON.parse(stored) as CachedGaragesPayload;
        } catch (error) {
            console.warn('Failed to parse cached garages', error);
            return null;
        }
    },

    clearGarages: async (): Promise<void> => {
        await AsyncStorage.removeItem(CACHED_GARAGES_KEY);
    },
};
