import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setCredentials: (state, action: PayloadAction<{ user: User | null; isAuthenticated: boolean }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = action.payload.isAuthenticated;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.isLoading = false;
        },
    },
});

export const { setLoading, setCredentials, setError, logout } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState, User };
