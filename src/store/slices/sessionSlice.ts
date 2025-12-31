import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sessionService } from '@services/session/sessionService';
import { ParkingSession, SessionReceipt } from '@services/session/types';

interface SessionState {
    activeSession: ParkingSession | null;
    history: ParkingSession[];
    isLoading: boolean;
    error: string | null;
    lastReceipt: SessionReceipt | null;
}

const initialState: SessionState = {
    activeSession: null,
    history: [],
    isLoading: false,
    error: null,
    lastReceipt: null,
};

export const fetchActiveSession = createAsyncThunk('session/fetchActive', async () => {
    return sessionService.getActiveSession();
});

export const fetchSessionHistory = createAsyncThunk('session/history', async () => {
    return sessionService.getHistory();
});

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setActiveSession: (state, action: PayloadAction<ParkingSession | null>) => {
            state.activeSession = action.payload;
            state.error = null;
        },
        updateSessionCost: (
            state,
            action: PayloadAction<{ sessionId: string; currentCost: number; endTime?: string }>
        ) => {
            if (state.activeSession && state.activeSession.id === action.payload.sessionId) {
                state.activeSession.currentCost = action.payload.currentCost;
                if (action.payload.endTime) {
                    state.activeSession.endTime = action.payload.endTime;
                }
            }
        },
        clearSession: (state) => {
            state.activeSession = null;
        },
        setHistory: (state, action: PayloadAction<ParkingSession[]>) => {
            state.history = action.payload;
        },
        setReceipt: (state, action: PayloadAction<SessionReceipt | null>) => {
            state.lastReceipt = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchActiveSession.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchActiveSession.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeSession = action.payload ?? null;
            })
            .addCase(fetchActiveSession.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message ?? 'Failed to load session';
            })
            .addCase(fetchSessionHistory.fulfilled, (state, action) => {
                state.history = action.payload ?? [];
            });
    },
});

export const { setActiveSession, updateSessionCost, clearSession, setHistory, setReceipt } =
    sessionSlice.actions;
export default sessionSlice.reducer;
export type { SessionState };
