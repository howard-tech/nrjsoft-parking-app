import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../types';
import { AccountHomeScreen } from '@screens/account/AccountHomeScreen';
import { VehiclesScreen } from '@screens/account/VehiclesScreen';
import { AddVehicleScreen } from '@screens/account/AddVehicleScreen';
import { HistoryScreen } from '@screens/account/HistoryScreen';
import NotificationSettingsScreen from '@screens/account/NotificationSettingsScreen';
import ProfileScreen from '@screens/account/ProfileScreen';
import NotificationsScreen from '@screens/notifications/NotificationsScreen';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';

const Stack = createNativeStackNavigator<AccountStackParamList>();

const AccountStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AccountHome" component={AccountHomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Vehicles" component={VehiclesScreen} />
            <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="PaymentPreferences" component={PlaceholderScreen} />
            <Stack.Screen name="Help" component={PlaceholderScreen} />
            <Stack.Screen name="DeleteAccount" component={PlaceholderScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
    );
};

export default AccountStack;
