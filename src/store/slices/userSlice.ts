import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string | null;
}

export interface UserState {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    profile: null,
    isLoading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<UserProfile | null>) => {
            state.profile = action.payload;
        },
        setUserLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setUserError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearUser: (state) => {
            state.profile = null;
            state.isLoading = false;
            state.error = null;
        },
    },
});

export const { setProfile, setUserError, setUserLoading, clearUser } = userSlice.actions;

export default userSlice.reducer;
