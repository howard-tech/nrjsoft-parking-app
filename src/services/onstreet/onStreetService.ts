import { apiClient } from '@services/api';
import { ParkingSession } from '@services/session/types';

export type OnStreetZoneStatus = 'available' | 'limited' | 'full';

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
    status?: OnStreetZoneStatus;
    distanceMeters?: number;
}

export interface OnStreetQuote {
    zoneId: string;
    zoneName: string;
    zoneType?: string;
    duration: number;
    hourlyRate: number;
    totalFee: number;
    currency: string;
}

export interface OnStreetSession extends ParkingSession {
    zoneId?: string;
    remainingMinutes?: number;
}

const mapZone = (zone: any): OnStreetZone => ({
    id: zone.id,
    name: zone.name,
    latitude: zone.location?.lat ?? zone.latitude,
    longitude: zone.location?.lng ?? zone.longitude,
    type: zone.type,
    hourlyRate: zone.hourlyRate,
    maxDuration: zone.maxDuration,
    currency: zone.currency,
    restrictions: zone.restrictions,
    status: zone.status,
    distanceMeters: zone.distanceMeters ?? zone.distance,
});

const mapSession = (session: any): OnStreetSession => ({
    id: session.id,
    zoneId: session.zoneId,
    zoneName: session.zoneName,
    vehiclePlate: session.vehiclePlate,
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status,
    hourlyRate: session.hourlyRate,
    currency: session.currency,
    elapsedMinutes: session.elapsedMinutes,
    totalFee: session.totalFee,
    paymentStatus: session.paymentStatus,
    remainingMinutes: session.remainingMinutes,
});

export const onStreetService = {
    async fetchZones(lat: number, lng: number, radius = 2000): Promise<OnStreetZone[]> {
        const response = await apiClient.get<{ zones?: any[]; data?: any[] } | any[]>(
            '/onstreet/zones',
            {
                params: { lat, lng, radius },
            }
        );
        const payload = Array.isArray(response.data) ? response.data : response.data?.zones ?? response.data?.data ?? [];
        return (payload ?? []).map(mapZone);
    },

    async getZone(id: string): Promise<OnStreetZone | null> {
        try {
            const response = await apiClient.get<{ data?: any } | any>(`/onstreet/zones/${id}`);
            const zone = response.data?.data ?? response.data;
            return zone ? mapZone(zone) : null;
        } catch (error) {
            console.warn('Failed to fetch on-street zone', error);
            return null;
        }
    },

    async getQuote(zoneId: string, durationMinutes: number): Promise<OnStreetQuote | null> {
        try {
            const response = await apiClient.post<{ data?: any } | any>('/onstreet/quote', {
                zoneId,
                duration: durationMinutes,
            });
            const payload = response.data?.data ?? response.data;
            if (!payload) {
                return null;
            }
            return {
                zoneId: payload.zoneId,
                zoneName: payload.zoneName,
                zoneType: payload.zoneType,
                duration: payload.duration,
                hourlyRate: payload.hourlyRate,
                totalFee: payload.totalFee,
                currency: payload.currency,
            };
        } catch (error) {
            console.warn('Failed to fetch on-street quote', error);
            return null;
        }
    },

    async startSession(params: { zoneId: string; vehiclePlate: string; duration: number }): Promise<OnStreetSession> {
        const response = await apiClient.post<{ data?: any } | any>('/onstreet/sessions', {
            zoneId: params.zoneId,
            vehiclePlate: params.vehiclePlate,
            duration: params.duration,
        });
        const payload = response.data?.data ?? response.data;
        return mapSession(payload);
    },

    async getActiveSession(): Promise<OnStreetSession | null> {
        try {
            const response = await apiClient.get<{ hasActiveSession?: boolean; session?: any; data?: any }>(
                '/onstreet/sessions/active'
            );
            const hasSession = response.data?.hasActiveSession;
            if (!hasSession) {
                return null;
            }
            const session = response.data?.session ?? response.data?.data;
            return session ? mapSession(session) : null;
        } catch (error) {
            console.warn('Failed to fetch active on-street session', error);
            return null;
        }
    },

    async extendSession(sessionId: string, duration: number): Promise<OnStreetSession | null> {
        try {
            const response = await apiClient.post<{ data?: any; session?: any }>(
                `/onstreet/sessions/${sessionId}/extend`,
                { duration }
            );
            const session = response.data?.session ?? response.data?.data ?? response.data;
            return session ? mapSession(session) : null;
        } catch (error) {
            console.warn('Failed to extend on-street session', error);
            return null;
        }
    },

    async stopSession(sessionId: string): Promise<OnStreetSession | null> {
        try {
            const response = await apiClient.post<{ data?: any; session?: any }>(
                `/onstreet/sessions/${sessionId}/stop`
            );
            const session = response.data?.session ?? response.data?.data ?? response.data;
            return session ? mapSession(session) : null;
        } catch (error) {
            console.warn('Failed to stop on-street session', error);
            return null;
        }
    },
};
