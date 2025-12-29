import { useCallback } from 'react';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { notificationService } from '../services/notifications/notificationService';
import { useAppDispatch, useAppSelector } from '../store';
import {
    setFcmToken,
    setLastNotification,
    setPermissionStatus,
    setRegistrationInProgress,
} from '../store/slices/notificationsSlice';

export const useNotifications = () => {
    const dispatch = useAppDispatch();
    const notifications = useAppSelector((state) => state.notifications);

    const checkPermission = useCallback(async () => {
        const status = await notificationService.checkPermission();
        dispatch(setPermissionStatus(status));
        return status;
    }, [dispatch]);

    const requestPermission = useCallback(async () => {
        const status = await notificationService.requestPermission();
        dispatch(setPermissionStatus(status));
        return status;
    }, [dispatch]);

    const registerToken = useCallback(async () => {
        dispatch(setRegistrationInProgress(true));
        try {
            await notificationService.ensureAutoInit();
            const token = await notificationService.getFcmToken();
            dispatch(setFcmToken(token));
            return token;
        } finally {
            dispatch(setRegistrationInProgress(false));
        }
    }, [dispatch]);

    const subscribeToForeground = useCallback(
        (handler?: (message: FirebaseMessagingTypes.RemoteMessage) => void) =>
            notificationService.onForegroundMessage((message) => {
                dispatch(setLastNotification(message));
                handler?.(message);
            }),
        [dispatch]
    );

    const onNotificationOpenedApp = useCallback(
        (handler: (message: FirebaseMessagingTypes.RemoteMessage) => void) =>
            notificationService.onNotificationOpenedApp(handler),
        []
    );

    const getInitialNotification = useCallback(
        () => notificationService.getInitialNotification(),
        []
    );

    const isAuthorized = useCallback(
        (status?: FirebaseMessagingTypes.AuthorizationStatus | null) =>
            notificationService.isAuthorizedStatus(status ?? notifications.permissionStatus),
        [notifications.permissionStatus]
    );

    return {
        ...notifications,
        checkPermission,
        requestPermission,
        registerToken,
        subscribeToForeground,
        onNotificationOpenedApp,
        getInitialNotification,
        isAuthorized,
    };
};
