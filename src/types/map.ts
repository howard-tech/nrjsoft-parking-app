import { ParkingGarage } from '@services/parking/parkingService';

export interface OnStreetZone {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type?: string;
    hourlyRate?: number;
    maxDuration?: number;
    currency?: string;
    restrictions?: string;
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
