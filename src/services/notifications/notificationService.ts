import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

const FCM_TOKEN_KEY = '@nrjsoft.fcm_token';

const storeToken = async (token: string | null): Promise<void> => {
    if (token) {
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    }
};

const getStoredToken = async (): Promise<string | null> => AsyncStorage.getItem(FCM_TOKEN_KEY);

const isAuthorizedStatus = (status?: FirebaseMessagingTypes.AuthorizationStatus | null): boolean =>
    status === messaging.AuthorizationStatus.AUTHORIZED || status === messaging.AuthorizationStatus.PROVISIONAL;

const checkPermission = async (): Promise<FirebaseMessagingTypes.AuthorizationStatus> => messaging().hasPermission();

const requestPermission = async (): Promise<FirebaseMessagingTypes.AuthorizationStatus> =>
    messaging().requestPermission();

const getFcmToken = async (): Promise<string | null> => {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    await storeToken(token);
    return token;
};

const clearStoredToken = async (): Promise<void> => AsyncStorage.removeItem(FCM_TOKEN_KEY);

const onForegroundMessage = (
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => void
): (() => void) => messaging().onMessage(handler);

const setBackgroundHandler = (
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<void>
): void => {
    messaging().setBackgroundMessageHandler(handler);
};

const onNotificationOpenedApp = (
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => void
): (() => void) => messaging().onNotificationOpenedApp(handler);

const getInitialNotification = (): Promise<FirebaseMessagingTypes.RemoteMessage | null> =>
    messaging().getInitialNotification();

const ensureAutoInit = async (): Promise<void> => {
    await messaging().setAutoInitEnabled(true);
};

export const notificationService = {
    checkPermission,
    requestPermission,
    getFcmToken,
    getStoredToken,
    clearStoredToken,
    onForegroundMessage,
    onNotificationOpenedApp,
    setBackgroundHandler,
    getInitialNotification,
    ensureAutoInit,
    isAuthorizedStatus,
};
