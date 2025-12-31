import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParkingGarage } from '@services/parking/parkingService';

export interface SearchResult extends ParkingGarage {
    addressLabel?: string;
}

const HISTORY_KEY = 'search_history_v1';
const HISTORY_LIMIT = 6;

export const useSearch = (garages: ParkingGarage[], query: string) => {
    const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            setLoadingHistory(true);
            try {
                const raw = await AsyncStorage.getItem(HISTORY_KEY);
                if (raw) {
                    setRecentSearches(JSON.parse(raw));
                }
            } catch {
                // ignore
            } finally {
                setLoadingHistory(false);
            }
        };

        loadHistory();
    }, []);

    const results = useMemo(() => {
        if (!query.trim()) {
            return [];
        }
        const lower = query.toLowerCase();
        return garages
            .filter((garage) => {
                const nameMatch = garage.name.toLowerCase().includes(lower);
                const addressMatch = (garage.address ?? '').toLowerCase().includes(lower);
                return nameMatch || addressMatch;
            })
            .slice(0, 8)
            .map((garage) => ({
                ...garage,
                addressLabel: garage.address,
            }));
    }, [garages, query]);

    const persistHistory = useCallback(async (items: SearchResult[]) => {
        setRecentSearches(items);
        try {
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
        } catch {
            // ignore
        }
    }, []);

    const recordSelection = useCallback(
        (result: SearchResult) => {
            const next = [result, ...recentSearches.filter((item) => item.id !== result.id)].slice(
                0,
                HISTORY_LIMIT
            );
            persistHistory(next);
        },
        [persistHistory, recentSearches]
    );

    const clearHistory = useCallback(() => {
        persistHistory([]);
    }, [persistHistory]);

    return {
        results,
        recentSearches,
        isLoading: loadingHistory,
        recordSelection,
        clearHistory,
    };
};
