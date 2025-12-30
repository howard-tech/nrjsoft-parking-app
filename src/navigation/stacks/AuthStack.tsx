import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';

import { TutorialScreen } from '@screens/auth/tutorial/TutorialScreen';
import { LoginScreen } from '@screens/auth/LoginScreen';
import { OTPVerificationScreen } from '@screens/auth/OTPVerificationScreen';
import { isOnboardingComplete } from '@services/storage';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
    const [initialRoute, setInitialRoute] = useState<keyof AuthStackParamList | null>(null);

    useEffect(() => {
        const bootstrap = async () => {
            const completed = await isOnboardingComplete();
            setInitialRoute(completed ? 'Login' : 'Tutorial');
        };

        bootstrap();
    }, []);

    if (!initialRoute) {
        return null;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="Tutorial" component={TutorialScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack;
