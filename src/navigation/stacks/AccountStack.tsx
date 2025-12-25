import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../types';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';

const Stack = createNativeStackNavigator<AccountStackParamList>();

const AccountStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AccountHome" component={PlaceholderScreen} />
            <Stack.Screen name="Profile" component={PlaceholderScreen} />
            <Stack.Screen name="Vehicles" component={PlaceholderScreen} />
            <Stack.Screen name="AddVehicle" component={PlaceholderScreen} />
            <Stack.Screen name="NotificationSettings" component={PlaceholderScreen} />
            <Stack.Screen name="PaymentPreferences" component={PlaceholderScreen} />
            <Stack.Screen name="Help" component={PlaceholderScreen} />
            <Stack.Screen name="DeleteAccount" component={PlaceholderScreen} />
        </Stack.Navigator>
    );
};

export default AccountStack;
