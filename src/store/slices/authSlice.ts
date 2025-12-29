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
    requestOtpLoading: boolean;
    verifyOtpLoading: boolean;
    checkSessionLoading: boolean;
    logoutLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    requestOtpLoading: false,
    verifyOtpLoading: false,
    checkSessionLoading: false,
    logoutLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setRequestOtpLoading: (state, action: PayloadAction<boolean>) => {
            state.requestOtpLoading = action.payload;
        },
        setVerifyOtpLoading: (state, action: PayloadAction<boolean>) => {
            state.verifyOtpLoading = action.payload;
        },
        setCheckSessionLoading: (state, action: PayloadAction<boolean>) => {
            state.checkSessionLoading = action.payload;
        },
        setLogoutLoading: (state, action: PayloadAction<boolean>) => {
            state.logoutLoading = action.payload;
        },
        setCredentials: (state, action: PayloadAction<{ user: User | null; isAuthenticated: boolean }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = action.payload.isAuthenticated;
            state.error = null;
            state.checkSessionLoading = false;
            state.verifyOtpLoading = false;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.requestOtpLoading = false;
            state.verifyOtpLoading = false;
            state.checkSessionLoading = false;
            state.logoutLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.requestOtpLoading = false;
            state.verifyOtpLoading = false;
            state.checkSessionLoading = false;
            state.logoutLoading = false;
        },
    },
});

export const {
    setRequestOtpLoading,
    setVerifyOtpLoading,
    setCheckSessionLoading,
    setLogoutLoading,
    setCredentials,
    setError,
    logout,
} = authSlice.actions;
export default authSlice.reducer;
export type { AuthState, User };
