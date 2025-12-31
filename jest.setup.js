jest.mock('@react-native-firebase/analytics', () => {
    const mock = {
        setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
        logScreenView: jest.fn(() => Promise.resolve()),
        logEvent: jest.fn(() => Promise.resolve()),
        setUserId: jest.fn(() => Promise.resolve()),
        setUserProperty: jest.fn(() => Promise.resolve()),
        setUserProperties: jest.fn(() => Promise.resolve()),
    };
    return () => mock;
});

jest.mock('@react-native-firebase/crashlytics', () => {
    const mock = {
        setCrashlyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
        setUserId: jest.fn(() => Promise.resolve()),
        setAttribute: jest.fn(() => Promise.resolve()),
        setAttributes: jest.fn(() => Promise.resolve()),
        log: jest.fn(),
        recordError: jest.fn(),
    };
    return () => mock;
});

jest.mock('@react-native-firebase/perf', () => {
    const mockTrace = {
        putAttribute: jest.fn(),
        putMetric: jest.fn(),
        stop: jest.fn(() => Promise.resolve()),
    };

    const mock = {
        setPerformanceCollectionEnabled: jest.fn(() => Promise.resolve()),
        startTrace: jest.fn(async () => mockTrace),
        newHttpMetric: jest.fn(() => ({
            start: jest.fn(),
            stop: jest.fn(),
            setHttpResponseCode: jest.fn(),
            setRequestPayloadSize: jest.fn(),
            setResponsePayloadSize: jest.fn(),
            setAttributes: jest.fn(),
        })),
    };
    return () => mock;
});

jest.mock('react-native-device-info', () => ({
    __esModule: true,
    default: {
        getUniqueId: jest.fn(() => Promise.resolve('device-id')),
    },
}));

jest.mock('react-native-biometrics', () => {
    return function () {
        return {
            isSensorAvailable: jest.fn(() => Promise.resolve({ available: true, biometryType: 'TouchID' })),
            simplePrompt: jest.fn(() => Promise.resolve({ success: true })),
        };
    };
});

jest.mock('jail-monkey', () => ({
    isJailBroken: jest.fn(() => false),
    canMockLocation: jest.fn(() => false),
    isDebuggedMode: jest.fn(() => false),
    hookDetected: jest.fn(() => false),
    isOnExternalStorage: jest.fn(() => false),
    AdbEnabled: jest.fn(() => false),
}));

jest.mock('react-native-ssl-pinning', () => ({
    fetch: jest.fn(() =>
        Promise.resolve({
            status: 200,
            bodyString: '',
            headers: {},
            json: () => Promise.resolve({}),
        })
    ),
}));

jest.mock('react-native-vision-camera', () => {
    const mockCamera = jest.fn(() => null);
    return {
        Camera: mockCamera,
        useCameraDevice: jest.fn(() => ({ id: 'back', name: 'Back Camera', position: 'back' })),
        useCodeScanner: jest.fn(() => ({})),
        CameraPermissionStatus: {
            AUTHORIZED: 'authorized',
            DENIED: 'denied',
        },
        requestCameraPermission: jest.fn(async () => 'authorized'),
    };
});
