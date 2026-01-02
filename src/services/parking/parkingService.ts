import { apiClient } from '@services/api';
import { sessionService } from '@services/session/sessionService';

type SortBy = 'nearest' | 'cheapest' | 'ev_ready' | 'max_time';

export interface ParkingGarage {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    distanceMeters?: number;
    availableSlots?: number;
    status?: 'available' | 'limited' | 'full';
    totalSlots?: number;
    address?: string;
    ratePerHour?: number;
    entryMethod?: 'QR' | 'ANPR';
    evChargers?: number;
    securityFeatures?: string[];
    features?: {
        evChargers?: number;
        security?: string;
        coveredParking?: boolean;
        disabledAccess?: boolean;
    };
    policies?:
        | string
        | {
              prepayRequired?: boolean;
              badgeAfterHour?: number | null;
              overstayPenalty?: number;
          };
}

export interface ParkingSession {
    id: string;
    garageId: string;
    startedAt: string;
    status: 'active' | 'pending' | 'completed';
}

export const parkingService = {
    async fetchNearby(
        lat: number,
        lng: number,
        options?: { sortBy?: SortBy | null; query?: string }
    ): Promise<ParkingGarage[]> {
        const { sortBy, query } = options || {};
        const response = await apiClient.get<{ data?: ParkingGarage[]; garages?: ParkingGarage[] } | ParkingGarage[]>(
            '/parking/nearby',
            {
                params: {
                    lat,
                    lng,
                    ...(sortBy ? { sortBy } : {}),
                    ...(query ? { q: query } : {}),
                },
            }
        );

        const payload = response.data;
        const items = Array.isArray(payload) ? payload : payload?.data ?? payload?.garages ?? [];

        return (items ?? []).map((garage) => ({
            ...garage,
            status: garage.status ?? 'available',
            evChargers: garage.evChargers ?? garage.features?.evChargers,
        }));
    },

    async fetchDetail(id: string): Promise<ParkingGarage> {
        try {
            const response = await apiClient.get<{ data?: ParkingGarage; garage?: ParkingGarage }>(
                `/parking/${id}`
            );
            const payload = response.data?.data ?? response.data?.garage ?? response.data;
            if (payload) {
                return {
                    ...payload,
                    status: payload.status ?? 'available',
                };
            }
        } catch (err) {
            console.warn('Failed to fetch garage detail', err);
        }

        // Fallback: return minimal info so UI can still render
        return {
            id,
            name: 'Garage',
            latitude: 0,
            longitude: 0,
            status: 'available',
        };
    },

    async startSessionWithQR(garageId: string, qrData: string): Promise<ParkingSession> {
        return sessionService.startSessionWithQR(garageId, qrData);
    },
};
