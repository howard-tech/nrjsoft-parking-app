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
import { OfflineBanner } from '@components/common/OfflineBanner';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { analyticsService, crashReportingService, performanceService } from '@services/analytics';

const AppContent = () => {
    const { checkSession, user } = useAuth();
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
                await Promise.all([
                    analyticsService.initialize(),
                    crashReportingService.initialize(),
                    performanceService.initialize(),
                ]);
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

    useEffect(() => {
        const syncUserContext = async () => {
            try {
                await analyticsService.setUserId(user?.id ?? null);
                await crashReportingService.setUserId(user?.id ?? null);
                if (user?.email) {
                    await crashReportingService.setAttributes({ email: user.email });
                }
            } catch (error) {
                console.warn('Failed to sync analytics user', error);
            }
        };

        syncUserContext();
    }, [user]);

    return (
        <GestureHandlerRootView style={styles.root}>
            <ThemeProvider>
                <ErrorBoundary>
                    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                    <OfflineBanner />
                    <RootNavigator />
                </ErrorBoundary>
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
