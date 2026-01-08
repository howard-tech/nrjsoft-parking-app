import { apiClient } from '@services/api';
import { store } from '@store';
import {
    setActiveSession,
    updateSessionCost,
    clearSession,
    setHistory,
} from '@store/slices/sessionSlice';
import { sessionService } from '@services/session/sessionService';

jest.mock('@services/api', () => ({
    apiClient: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

jest.mock('@store', () => ({
    store: {
        dispatch: jest.fn(),
    },
}));

jest.mock('@store/slices/sessionSlice', () => ({
    setActiveSession: jest.fn((payload) => ({ type: 'session/setActiveSession', payload })),
    updateSessionCost: jest.fn((payload) => ({ type: 'session/updateSessionCost', payload })),
    clearSession: jest.fn(() => ({ type: 'session/clearSession' })),
    setHistory: jest.fn((payload) => ({ type: 'session/setHistory', payload })),
}));

describe('sessionService', () => {
    const mockGet = apiClient.get as jest.Mock;
    const mockPost = apiClient.post as jest.Mock;
    const mockDispatch = store.dispatch as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads active session and dispatches to store', async () => {
        const session = { id: 'session-1', garageId: 'garage-1', startTime: new Date().toISOString() };
        mockGet.mockResolvedValueOnce({ data: { session } });

        const result = await sessionService.getActiveSession();

        expect(mockGet).toHaveBeenCalledWith('/sessions/active');
        expect(setActiveSession).toHaveBeenCalledWith(session);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'session/setActiveSession', payload: session });
        expect(result).toEqual(session);
    });

    it('returns null if active session fetch fails', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGet.mockRejectedValueOnce(new Error('network'));

        const result = await sessionService.getActiveSession();

        expect(result).toBeNull();
        expect(setActiveSession).not.toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    it('starts session with QR and dispatches active session', async () => {
        const session = { id: 'session-2', garageId: 'garage-2', startTime: new Date().toISOString() };
        mockPost.mockResolvedValueOnce({ data: { data: session } });

        const result = await sessionService.startSessionWithQR('garage-2', 'qr-data');

        expect(mockPost).toHaveBeenCalledWith('/sessions/start-qr', { garageId: 'garage-2', qrData: 'qr-data' });
        expect(setActiveSession).toHaveBeenCalledWith(session);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'session/setActiveSession', payload: session });
        expect(result).toEqual(session);
    });

    it('extends session and updates store', async () => {
        const session = { id: 'session-3', garageId: 'garage-3', startTime: new Date().toISOString() };
        mockPost.mockResolvedValueOnce({ data: { session } });

        const result = await sessionService.extendSession('session-3', 15);

        expect(mockPost).toHaveBeenCalledWith('/sessions/session-3/extend', { minutes: 15 });
        expect(setActiveSession).toHaveBeenCalledWith(session);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'session/setActiveSession', payload: session });
        expect(result).toEqual(session);
    });

    it('ends session and clears store', async () => {
        const session = { id: 'session-4', garageId: 'garage-4', startTime: new Date().toISOString() };
        mockPost.mockResolvedValueOnce({ data: { session } });

        const result = await sessionService.endSession('session-4');

        expect(mockPost).toHaveBeenCalledWith('/sessions/session-4/end');
        expect(clearSession).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'session/clearSession' });
        expect(result).toEqual(session);
    });

    it('handles session start payload', () => {
        sessionService.handleSessionStart({
            sessionId: 'session-5',
            garageId: 'garage-5',
            startTime: new Date().toISOString(),
            hourlyRate: 4,
        });

        expect(setActiveSession).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'session-5', garageId: 'garage-5', status: 'active' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'session/setActiveSession' })
        );
    });

    it('handles session update payload', () => {
        sessionService.handleSessionUpdate({ sessionId: 'session-6', currentCost: 12.5 });
        expect(updateSessionCost).toHaveBeenCalledWith({ sessionId: 'session-6', currentCost: 12.5, endTime: undefined });
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'session/updateSessionCost' })
        );
    });

    it('handles session end payload', () => {
        const receipt = { sessionId: 'session-7', totalCost: 10, currency: 'EUR' };
        const result = sessionService.handleSessionEnd(receipt);

        expect(clearSession).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'session/clearSession' });
        expect(result).toEqual(receipt);
    });

    it('loads session history and dispatches to store', async () => {
        const history = [{ id: 'session-8', garageId: 'garage-8', startTime: new Date().toISOString() }];
        mockGet.mockResolvedValueOnce({ data: { data: history } });

        const result = await sessionService.getHistory(1, 10);

        expect(mockGet).toHaveBeenCalledWith('/sessions/history', { params: { page: 1, limit: 10 } });
        expect(setHistory).toHaveBeenCalledWith(history);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'session/setHistory', payload: history });
        expect(result).toEqual(history);
    });
});
