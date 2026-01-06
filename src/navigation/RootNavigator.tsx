import React, { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, NavigationContainerRef, Linking } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@theme';
import { LoadingState } from '@components/common/LoadingState';
import { analyticsService } from '@services/analytics';
import { QRScannerModal } from '@screens/parking/QRScannerModal';
import { linking } from './linking';

// Import navigators
import AuthStack from './stacks/AuthStack';
import { MainTabNavigator } from './MainTabNavigator';
import OnStreetStack from './stacks/OnStreetStack';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';
import { SessionReceiptScreen } from '@screens/parking/SessionReceiptScreen';
import NotificationsScreen from '@screens/notifications/NotificationsScreen';
import { handleDeepLink } from './deepLinkHandler';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
    const { isAuthenticated, checkSessionLoading } = useAuth();
    const theme = useTheme();
    const navigationRef = useRef<NavigationContainerRef<RootStackParamList> | null>(null);
    const routeNameRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const subscription = Linking.addEventListener('url', (event) => {
            handleDeepLink(navigationRef.current, event.url);
        });
        return () => subscription.remove();
    }, []);

    if (checkSessionLoading) {
        return <LoadingState fullScreen message="Loading your session..." />;
    }

    return (
        <NavigationContainer
            ref={navigationRef}
            linking={linking}
            onReady={() => {
                const currentRoute = navigationRef.current?.getCurrentRoute();
                routeNameRef.current = currentRoute?.name;
                if (currentRoute?.name) {
                    analyticsService.logScreenView(currentRoute.name);
                }
                // Handle initial URL
                Linking.getInitialURL().then((url) => {
                    if (url) {
                        handleDeepLink(navigationRef.current, url);
                    }
                });
            }}
            onStateChange={() => {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
                if (currentRouteName && previousRouteName !== currentRouteName) {
                    routeNameRef.current = currentRouteName;
                    analyticsService.logScreenView(currentRouteName);
                }
            }}
        >
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.neutral.background },
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabNavigator} />
                        <Stack.Screen
                            name="OnStreet"
                            component={OnStreetStack}
                            options={{ presentation: 'card' }}
                        />
                        <Stack.Screen
                            name="Notifications"
                            component={NotificationsScreen}
                            options={{
                                presentation: 'modal',
                                headerShown: true,
                                headerTitle: 'Notifications',
                            }}
                        />
                        {/* Modal screens */}
                        <Stack.Group screenOptions={{ presentation: 'modal' }}>
                            <Stack.Screen name="PaymentModal" component={PlaceholderScreen} />
                            <Stack.Screen
                                name="QRScannerModal"
                                component={QRScannerModal}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="ReceiptModal"
                                component={SessionReceiptScreen}
                                options={{ headerShown: true, headerTitle: 'Receipt' }}
                            />
                        </Stack.Group>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
