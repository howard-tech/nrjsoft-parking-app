import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tutorial" component={PlaceholderScreen} />
            <Stack.Screen name="Login" component={PlaceholderScreen} />
            <Stack.Screen name="OTPVerification" component={PlaceholderScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack;
