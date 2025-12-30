import { apiClient } from '@services/api';

export interface ParkingGarage {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    distanceMeters?: number;
    availableSlots?: number;
    status?: 'available' | 'limited' | 'full';
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
};
