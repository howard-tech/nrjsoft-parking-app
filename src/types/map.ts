import { ParkingGarage } from '@services/parking/parkingService';

export interface OnStreetZone {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status?: 'available' | 'limited' | 'full';
    distanceMeters?: number;
    ratePerHour?: number;
}

export interface GarageCluster {
    id: string;
    coordinate: { latitude: number; longitude: number };
    count: number;
    items: ParkingGarage[];
}
