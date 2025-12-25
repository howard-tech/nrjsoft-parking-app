import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnStreetStackParamList } from '../types';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';

const Stack = createNativeStackNavigator<OnStreetStackParamList>();

const OnStreetStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="OnStreetParking" component={PlaceholderScreen} />
            <Stack.Screen name="ZoneSelection" component={PlaceholderScreen} />
            <Stack.Screen name="DurationSelection" component={PlaceholderScreen} />
            <Stack.Screen name="OnStreetPayment" component={PlaceholderScreen} />
            <Stack.Screen name="OnStreetSession" component={PlaceholderScreen} />
        </Stack.Navigator>
    );
};

export default OnStreetStack;
