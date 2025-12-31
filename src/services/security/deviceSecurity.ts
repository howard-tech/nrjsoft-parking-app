import { Alert, Platform } from 'react-native';
import JailMonkey from 'jail-monkey';

export interface SecurityStatus {
    isJailbroken: boolean;
    canMockLocation: boolean;
    isDebugged: boolean;
    hookDetected: boolean;
    isOnExternalStorage: boolean;
    adbEnabled: boolean;
}

export const deviceSecurity = {
    isDeviceSecure: (): boolean => {
        if (__DEV__) {
            return true;
        }

        const rooted = JailMonkey.isJailBroken();
        const mockLocation = JailMonkey.canMockLocation();
        const debugged = JailMonkey.isDebuggedMode();
        const hooked = JailMonkey.hookDetected();

        return !rooted && !mockLocation && !debugged && !hooked;
    },

    getSecurityStatus: (): SecurityStatus => ({
        isJailbroken: JailMonkey.isJailBroken(),
        canMockLocation: JailMonkey.canMockLocation(),
        isDebugged: JailMonkey.isDebuggedMode(),
        hookDetected: JailMonkey.hookDetected(),
        isOnExternalStorage: Platform.OS === 'android' ? JailMonkey.isOnExternalStorage() : false,
        adbEnabled: Platform.OS === 'android' ? JailMonkey.AdbEnabled() : false,
    }),

    showSecurityWarning: (): void => {
        Alert.alert(
            'Security Warning',
            'This device appears to be rooted or jailbroken. Some features may be limited for your safety.',
            [{ text: 'I understand', style: 'default' }]
        );
    },
};
