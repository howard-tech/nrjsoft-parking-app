import { useCallback, useMemo, useState } from 'react';
import { ParkingGarage } from '@services/parking/parkingService';
import { distanceInMeters } from '@utils/mapUtils';

export type FilterType = 'nearest' | 'cheapest' | 'ev_ready' | 'max_time';

export const useFilters = (coords?: { latitude: number; longitude: number } | null) => {
    const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);

    const applyFilters = useCallback(
        (garages: ParkingGarage[]): ParkingGarage[] => {
            if (!activeFilter) {
                return garages;
            }

            const copy = [...garages];
            switch (activeFilter) {
                case 'nearest':
                    return copy.sort((a, b) => {
                        const aDistance =
                            a.distanceMeters ??
                            (coords ? distanceInMeters(coords.latitude, coords.longitude, a.latitude, a.longitude) : 0);
                        const bDistance =
                            b.distanceMeters ??
                            (coords ? distanceInMeters(coords.latitude, coords.longitude, b.latitude, b.longitude) : 0);
                        return aDistance - bDistance;
                    });
                case 'cheapest':
                    return copy.sort((a, b) => {
                        const aRate = a.ratePerHour ?? Number.MAX_SAFE_INTEGER;
                        const bRate = b.ratePerHour ?? Number.MAX_SAFE_INTEGER;
                        return aRate - bRate;
                    });
                case 'ev_ready':
                    return copy.sort((a, b) => (b.evChargers ?? 0) - (a.evChargers ?? 0));
                case 'max_time':
                    // Fallback: prioritize higher available slots if max duration not provided
                    return copy.sort((a, b) => (b.availableSlots ?? 0) - (a.availableSlots ?? 0));
                default:
                    return garages;
            }
        },
        [activeFilter, coords]
    );

    const clearFilter = useCallback(() => setActiveFilter(null), []);

    return useMemo(
        () => ({
            activeFilter,
            setActiveFilter,
            applyFilters,
            clearFilter,
        }),
        [activeFilter, applyFilters, clearFilter]
    );
};
