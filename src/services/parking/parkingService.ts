import { apiClient } from '@services/api';

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
    policies?: string;
}

export interface ParkingSession {
    id: string;
    garageId: string;
    startedAt: string;
    status: 'active' | 'pending' | 'completed';
}

export const parkingService = {
    async fetchNearby(lat: number, lng: number): Promise<ParkingGarage[]> {
        const response = await apiClient.get<{ data?: ParkingGarage[]; garages?: ParkingGarage[] } | ParkingGarage[]>(
            '/parking/nearby',
            {
            params: { lat, lng },
            }
        );

        const payload = response.data;
        const items = Array.isArray(payload) ? payload : payload?.data ?? payload?.garages ?? [];

        return (items ?? []).map((garage) => ({
            ...garage,
            status: garage.status ?? 'available',
        }));
    },

    async fetchDetail(id: string): Promise<ParkingGarage> {
        try {
            const response = await apiClient.get<{ data?: ParkingGarage; garage?: ParkingGarage }>(
                `/parking/garage/${id}`
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
        const response = await apiClient.post<{ data?: ParkingSession; session?: ParkingSession }>(
            '/parking/session/start',
            { garageId, qrData }
        );
        const payload = response.data?.data ?? response.data?.session ?? response.data;
        return (
            payload ?? {
                id: `session-${Date.now()}`,
                garageId,
                startedAt: new Date().toISOString(),
                status: 'pending',
            }
        );
    },
};
