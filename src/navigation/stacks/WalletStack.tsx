import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../types';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';

const Stack = createNativeStackNavigator<WalletStackParamList>();

const WalletStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WalletHome" component={PlaceholderScreen} />
            <Stack.Screen name="TopUp" component={PlaceholderScreen} />
            <Stack.Screen name="PaymentMethods" component={PlaceholderScreen} />
            <Stack.Screen name="AddPaymentMethod" component={PlaceholderScreen} />
            <Stack.Screen name="Subscriptions" component={PlaceholderScreen} />
        </Stack.Navigator>
    );
};

export default WalletStack;
