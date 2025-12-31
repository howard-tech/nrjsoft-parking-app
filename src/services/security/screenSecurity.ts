import { NativeModules, Platform } from 'react-native';
import { useEffect } from 'react';

const { ScreenSecurity } = NativeModules as {
    ScreenSecurity?: {
        enableSecureView: () => void;
        disableSecureView: () => void;
    };
};

export const screenSecurity = {
    enableSecureMode: (): void => {
        if (Platform.OS === 'android' && ScreenSecurity?.enableSecureView) {
            ScreenSecurity.enableSecureView();
        }
    },
    disableSecureMode: (): void => {
        if (Platform.OS === 'android' && ScreenSecurity?.disableSecureView) {
            ScreenSecurity.disableSecureView();
        }
    },
    useSecureScreen: (): void => {
        useEffect(() => {
            screenSecurity.enableSecureMode();
            return () => screenSecurity.disableSecureMode();
        }, []);
    },
};
