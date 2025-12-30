import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';
import { SmartMapScreen } from '@screens/home';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SmartMap" component={SmartMapScreen} />
            <Stack.Screen name="GarageDetail" component={PlaceholderScreen} />
            <Stack.Screen name="QRScanner" component={PlaceholderScreen} />
            <Stack.Screen name="Search" component={PlaceholderScreen} />
        </Stack.Navigator>
    );
};

export default HomeStack;
