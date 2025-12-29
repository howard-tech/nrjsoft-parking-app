import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

type AuthorizationStatus = FirebaseMessagingTypes.AuthorizationStatus;

export interface NotificationsState {
    permissionStatus: AuthorizationStatus | null;
    fcmToken: string | null;
    lastNotification: FirebaseMessagingTypes.RemoteMessage | null;
    registrationInProgress: boolean;
}

const initialState: NotificationsState = {
    permissionStatus: null,
    fcmToken: null,
    lastNotification: null,
    registrationInProgress: false,
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setPermissionStatus: (state, action: PayloadAction<AuthorizationStatus | null>) => {
            state.permissionStatus = action.payload;
        },
        setFcmToken: (state, action: PayloadAction<string | null>) => {
            state.fcmToken = action.payload;
        },
        setLastNotification: (state, action: PayloadAction<FirebaseMessagingTypes.RemoteMessage | null>) => {
            state.lastNotification = action.payload;
        },
        setRegistrationInProgress: (state, action: PayloadAction<boolean>) => {
            state.registrationInProgress = action.payload;
        },
        resetNotifications: () => initialState,
    },
});

export const {
    setPermissionStatus,
    setFcmToken,
    setLastNotification,
    setRegistrationInProgress,
    resetNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
