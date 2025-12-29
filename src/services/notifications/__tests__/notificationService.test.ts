import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { notificationService } from '../notificationService';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-firebase/messaging', () => {
    const mockMessagingModule = {
        AuthorizationStatus: {
            NOT_DETERMINED: 0,
            DENIED: 1,
            AUTHORIZED: 2,
            PROVISIONAL: 3,
        },
        hasPermission: jest.fn().mockResolvedValue(2),
        requestPermission: jest.fn().mockResolvedValue(2),
        registerDeviceForRemoteMessages: jest.fn().mockResolvedValue(undefined),
        getToken: jest.fn().mockResolvedValue('test-token'),
        setAutoInitEnabled: jest.fn().mockResolvedValue(undefined),
        onMessage: jest.fn((handler) => {
            mockMessagingModule._onMessage = handler;
            return jest.fn();
        }),
        onNotificationOpenedApp: jest.fn((handler) => {
            mockMessagingModule._onNotificationOpenedApp = handler;
            return jest.fn();
        }),
        setBackgroundMessageHandler: jest.fn(),
        getInitialNotification: jest.fn().mockResolvedValue(null),
        _onMessage: undefined as (() => void) | undefined,
        _onNotificationOpenedApp: undefined as (() => void) | undefined,
    };

    const messagingFn = () => mockMessagingModule;
    messagingFn.AuthorizationStatus = mockMessagingModule.AuthorizationStatus;
    messagingFn.__mock = mockMessagingModule;
    return messagingFn;
});

type MockMessagingModule = ReturnType<typeof messaging> & {
    AuthorizationStatus: {
        NOT_DETERMINED: number;
        DENIED: number;
        AUTHORIZED: number;
        PROVISIONAL: number;
    };
    _onMessage?: (message: FirebaseMessagingTypes.RemoteMessage) => void;
    _onNotificationOpenedApp?: (message: FirebaseMessagingTypes.RemoteMessage) => void;
};

describe('notificationService', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await AsyncStorage.clear();
    });

    it('checks permission without requesting it', async () => {
        const mockModule = messaging() as unknown as MockMessagingModule;
        const status = await notificationService.checkPermission();
        expect(mockModule.hasPermission).toHaveBeenCalled();
        expect(status).toBe(mockModule.AuthorizationStatus.AUTHORIZED);
    });

    it('requests permission when prompted', async () => {
        const mockModule = messaging() as unknown as MockMessagingModule;
        const status = await notificationService.requestPermission();
        expect(mockModule.requestPermission).toHaveBeenCalled();
        expect(status).toBe(mockModule.AuthorizationStatus.AUTHORIZED);
    });

    it('registers device and stores token', async () => {
        const mockModule = messaging() as unknown as MockMessagingModule;
        const token = await notificationService.getFcmToken();
        expect(mockModule.registerDeviceForRemoteMessages).toHaveBeenCalled();
        expect(mockModule.getToken).toHaveBeenCalled();
        expect(token).toBe('test-token');
        expect(await AsyncStorage.getItem('@nrjsoft.fcm_token')).toBe('test-token');
    });

    it('registers foreground listener', () => {
        const unsubscribe = notificationService.onForegroundMessage(jest.fn());
        const mockModule = messaging() as unknown as MockMessagingModule;
        expect(mockModule.onMessage).toHaveBeenCalled();
        expect(typeof unsubscribe).toBe('function');
    });

    it('sets background handler', () => {
        const handler = jest.fn();
        notificationService.setBackgroundHandler(async () => handler());
        const mockModule = messaging() as unknown as MockMessagingModule;
        expect(mockModule.setBackgroundMessageHandler).toHaveBeenCalled();
    });

    it('detects authorized status', () => {
        const mockModule = messaging() as unknown as MockMessagingModule;
        expect(notificationService.isAuthorizedStatus(mockModule.AuthorizationStatus.AUTHORIZED)).toBe(true);
        expect(notificationService.isAuthorizedStatus(mockModule.AuthorizationStatus.PROVISIONAL)).toBe(true);
        expect(notificationService.isAuthorizedStatus(mockModule.AuthorizationStatus.DENIED)).toBe(false);
    });
});
