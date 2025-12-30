import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ParkingSession {
    id: string;
    status: 'active' | 'completed' | 'expired';
    startedAt?: string;
    endsAt?: string | null;
    totalCost?: number;
}

export interface SessionState {
    activeSession: ParkingSession | null;
    history: ParkingSession[];
    isLoading: boolean;
    error: string | null;
}

const initialState: SessionState = {
    activeSession: null,
    history: [],
    isLoading: false,
    error: null,
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setActiveSession: (state, action: PayloadAction<ParkingSession | null>) => {
            state.activeSession = action.payload;
        },
        upsertSessionHistory: (state, action: PayloadAction<ParkingSession>) => {
            const existingIndex = state.history.findIndex((item) => item.id === action.payload.id);
            if (existingIndex >= 0) {
                state.history[existingIndex] = action.payload;
            } else {
                state.history.unshift(action.payload);
            }
        },
        setSessionLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setSessionError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearSessions: (state) => {
            state.activeSession = null;
            state.history = [];
        },
    },
});

export const {
    setActiveSession,
    upsertSessionHistory,
    setSessionLoading,
    setSessionError,
    clearSessions,
} = sessionSlice.actions;

export default sessionSlice.reducer;
