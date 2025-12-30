import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { ThemeProvider } from '@theme';
import RNBootSplash from 'react-native-bootsplash';
import './i18n';

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
});

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store';
import { RootNavigator } from './navigation/RootNavigator';
import { useAuth } from './hooks/useAuth';
import { useLocalization } from './hooks/useLocalization';
import { useNotifications } from './hooks/useNotifications';

const AppContent = () => {
    const { checkSession } = useAuth();
    const { bootstrapLanguage } = useLocalization();
    const {
        checkPermission,
        registerToken,
        subscribeToForeground,
        isAuthorized,
        handleInitialNotification,
        registerBackgroundHandler,
        onNotificationOpenedApp,
    } = useNotifications();

    useEffect(() => {
        let unsubscribeForeground: (() => void) | undefined;
        let unsubscribeOpened: (() => void) | undefined;

        const init = async () => {
            try {
                await bootstrapLanguage();
                await checkSession();

                const permissionStatus = await checkPermission();

                if (isAuthorized(permissionStatus)) {
                    await registerToken();
                    registerBackgroundHandler();
                    unsubscribeForeground = subscribeToForeground();
                    unsubscribeOpened = onNotificationOpenedApp();
                    await handleInitialNotification();
                }
            } catch (error) {
                console.error('App bootstrap error', error);
            } finally {
                await RNBootSplash.hide({ fade: true });
            }
        };

        init();

        return () => {
            if (unsubscribeForeground) {
                unsubscribeForeground();
            }
            if (unsubscribeOpened) {
                unsubscribeOpened();
            }
        };
    }, [
        bootstrapLanguage,
        checkSession,
        checkPermission,
        handleInitialNotification,
        isAuthorized,
        onNotificationOpenedApp,
        registerBackgroundHandler,
        registerToken,
        subscribeToForeground,
    ]);

    return (
        <GestureHandlerRootView style={styles.root}>
            <ThemeProvider>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <RootNavigator />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};

const App = (): JSX.Element => (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <AppContent />
        </PersistGate>
    </Provider>
);


export default App;
