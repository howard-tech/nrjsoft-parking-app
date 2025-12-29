import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@theme';

// Import navigators
import AuthStack from './stacks/AuthStack';
import { MainTabNavigator } from './MainTabNavigator';
import OnStreetStack from './stacks/OnStreetStack';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const theme = useTheme();

    if (isLoading) {
        return null;
    }

    return (
        <NavigationContainer>
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
                            component={PlaceholderScreen}
                            options={{
                                presentation: 'modal',
                                headerShown: true,
                                headerTitle: 'Notifications',
                            }}
                        />
                        {/* Modal screens */}
                        <Stack.Group screenOptions={{ presentation: 'modal' }}>
                            <Stack.Screen name="PaymentModal" component={PlaceholderScreen} />
                            <Stack.Screen name="QRScannerModal" component={PlaceholderScreen} />
                        </Stack.Group>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
