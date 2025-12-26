import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';

import { TutorialScreen } from '@screens/auth/tutorial/TutorialScreen';
import { LoginScreen } from '@screens/auth/LoginScreen';
import { OTPVerificationScreen } from '@screens/auth/OTPVerificationScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tutorial" component={TutorialScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack;
