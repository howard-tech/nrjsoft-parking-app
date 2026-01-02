import { apiClient } from '@services/api';
import { store } from '@store';
import { setActiveSession, updateSessionCost, clearSession, setHistory } from '@store/slices/sessionSlice';
import { ParkingSession, SessionReceipt } from './types';
import { calculateCurrentCost, calculateSessionCost } from './costCalculator';

export const sessionService = {
    async getActiveSession(): Promise<ParkingSession | null> {
        try {
            const response = await apiClient.get<{ data?: ParkingSession | null; session?: ParkingSession | null }>(
                '/sessions/active'
            );
            const session = response.data?.data ?? response.data?.session ?? null;
            if (session) {
                store.dispatch(setActiveSession(session));
            }
            return session;
        } catch (error) {
            console.error('Failed to fetch active session', error);
            return null;
        }
    },

    async getSession(sessionId: string): Promise<ParkingSession | null> {
        try {
            const response = await apiClient.get<{ data?: ParkingSession; session?: ParkingSession }>(
                `/sessions/${sessionId}`
            );
            return response.data?.data ?? response.data?.session ?? null;
        } catch (error) {
            console.error('Failed to fetch session', error);
            return null;
        }
    },

    async startSessionWithQR(garageId: string, qrData: string): Promise<ParkingSession> {
        const response = await apiClient.post<{ data?: ParkingSession; session?: ParkingSession }>(
            '/sessions/start-qr',
            { garageId, qrData }
        );
        const session =
            response.data?.data ??
            response.data?.session ?? {
                id: `session-${Date.now()}`,
                garageId,
                startTime: new Date().toISOString(),
                status: 'pending',
            };
        store.dispatch(setActiveSession(session));
        return session;
    },

    async extendSession(sessionId: string, minutes: number): Promise<ParkingSession | null> {
        try {
            const response = await apiClient.post<{ data?: ParkingSession; session?: ParkingSession }>(
                `/sessions/${sessionId}/extend`,
                { minutes }
            );
            const session = response.data?.data ?? response.data?.session ?? null;
            if (session) {
                store.dispatch(setActiveSession(session));
            }
            return session;
        } catch (error) {
            console.error('Failed to extend session', error);
            return null;
        }
    },

    async endSession(sessionId: string): Promise<ParkingSession | null> {
        try {
            const response = await apiClient.post<{ data?: ParkingSession; session?: ParkingSession }>(
                `/sessions/${sessionId}/end`
            );
            const session = response.data?.data ?? response.data?.session ?? null;
            if (session) {
                store.dispatch(clearSession());
            }
            return session;
        } catch (error) {
            console.error('Failed to end session', error);
            return null;
        }
    },

    handleSessionStart(payload: {
        sessionId: string;
        garageId: string;
        garageName?: string;
        address?: string;
        startTime: string;
        hourlyRate?: number;
        vehiclePlate?: string;
        entryMethod?: 'ANPR' | 'QR';
    }): void {
        const session: ParkingSession = {
            id: payload.sessionId,
            garageId: payload.garageId,
            garageName: payload.garageName,
            address: payload.address,
            startTime: payload.startTime,
            status: 'active',
            hourlyRate: payload.hourlyRate,
            vehiclePlate: payload.vehiclePlate,
            entryMethod: payload.entryMethod,
            currentCost: 0,
        };
        store.dispatch(setActiveSession(session));
    },

    handleSessionUpdate(payload: { sessionId: string; currentCost: number; endTime?: string }): void {
        store.dispatch(updateSessionCost({ sessionId: payload.sessionId, currentCost: payload.currentCost, endTime: payload.endTime }));
    },

    handleSessionEnd(payload: SessionReceipt): SessionReceipt {
        store.dispatch(clearSession());
        return payload;
    },

    calculateCurrentCost,
    calculateSessionCost,

    async getHistory(page = 1, limit = 20): Promise<ParkingSession[]> {
        try {
            const response = await apiClient.get<{ data?: ParkingSession[]; sessions?: ParkingSession[] }>(
                '/sessions/history',
                { params: { page, limit } }
            );
            const items = response.data?.data ?? response.data?.sessions ?? [];
            store.dispatch(setHistory(items));
            return items;
        } catch (error) {
            console.error('Failed to fetch session history', error);
            return [];
        }
    },
};
