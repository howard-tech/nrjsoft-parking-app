import { apiClient } from '../../api';
import { onStreetService } from '../onStreetService';

jest.mock('../../api', () => ({
    apiClient: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

describe('onStreetService', () => {
    const mockGet = apiClient.get as jest.Mock;
    const mockPost = apiClient.post as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches zones with coordinates and maps location', async () => {
        mockGet.mockResolvedValueOnce({
            data: {
                zones: [
                    {
                        id: 'zone_1',
                        name: 'Blue Zone',
                        location: { lat: 1, lng: 2 },
                        hourlyRate: 1.5,
                        maxDuration: 120,
                        currency: 'EUR',
                        restrictions: 'Mon-Fri',
                        status: 'available',
                        distanceMeters: 150,
                    },
                ],
            },
        });

        const zones = await onStreetService.fetchZones(1, 2);
        expect(mockGet).toHaveBeenCalledWith('/onstreet/zones', {
            params: { lat: 1, lng: 2, radius: 2000 },
        });
        expect(zones[0]).toMatchObject({
            id: 'zone_1',
            name: 'Blue Zone',
            latitude: 1,
            longitude: 2,
            hourlyRate: 1.5,
            maxDuration: 120,
            currency: 'EUR',
            restrictions: 'Mon-Fri',
            status: 'available',
            distanceMeters: 150,
        });
    });

    it('gets a quote and maps fields', async () => {
        mockPost.mockResolvedValueOnce({
            data: {
                zoneId: 'zone_1',
                zoneName: 'Blue Zone',
                zoneType: 'BLUE',
                duration: 60,
                hourlyRate: 2,
                totalFee: 2,
                currency: 'EUR',
            },
        });

        const quote = await onStreetService.getQuote('zone_1', 60);
        expect(mockPost).toHaveBeenCalledWith('/onstreet/quote', {
            zoneId: 'zone_1',
            duration: 60,
        });
        expect(quote).toEqual({
            zoneId: 'zone_1',
            zoneName: 'Blue Zone',
            zoneType: 'BLUE',
            duration: 60,
            hourlyRate: 2,
            totalFee: 2,
            currency: 'EUR',
        });
    });

    it('starts a session and returns mapped data', async () => {
        mockPost.mockResolvedValueOnce({
            data: {
                id: 'session_1',
                zoneId: 'zone_1',
                zoneName: 'Blue Zone',
                startTime: '2024-01-01T00:00:00Z',
                status: 'active',
                hourlyRate: 2,
                currency: 'EUR',
                totalFee: 2,
                paymentStatus: 'paid',
            },
        });

        const session = await onStreetService.startSession({
            zoneId: 'zone_1',
            vehiclePlate: 'ABC123',
            duration: 60,
        });

        expect(mockPost).toHaveBeenCalledWith('/onstreet/sessions', {
            zoneId: 'zone_1',
            vehiclePlate: 'ABC123',
            duration: 60,
        });
        expect(session).toMatchObject({
            id: 'session_1',
            zoneId: 'zone_1',
            status: 'active',
            hourlyRate: 2,
            currency: 'EUR',
            totalFee: 2,
        });
    });

    it('returns null when no active session', async () => {
        mockGet.mockResolvedValueOnce({ data: { hasActiveSession: false } });
        const session = await onStreetService.getActiveSession();
        expect(mockGet).toHaveBeenCalledWith('/onstreet/sessions/active');
        expect(session).toBeNull();
    });

    it('extends and stops session', async () => {
        mockPost
            .mockResolvedValueOnce({
                data: {
                    id: 'session_1',
                    zoneId: 'zone_1',
                    status: 'active',
                    hourlyRate: 2,
                    currency: 'EUR',
                },
            })
            .mockResolvedValueOnce({
                data: {
                    id: 'session_1',
                    zoneId: 'zone_1',
                    status: 'completed',
                },
            });

        const extended = await onStreetService.extendSession('session_1', 30);
        expect(mockPost).toHaveBeenCalledWith('/onstreet/sessions/session_1/extend', { duration: 30 });
        expect(extended?.status).toBe('active');

        const stopped = await onStreetService.stopSession('session_1');
        expect(mockPost).toHaveBeenCalledWith('/onstreet/sessions/session_1/stop');
        expect(stopped?.status).toBe('completed');
    });
});
