import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../types';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';
import { PaymentMethodsScreen } from '@screens/payment/PaymentMethodsScreen';
import { CardPaymentScreen } from '@screens/payment/CardPaymentScreen';
import { PaymentHistoryScreen } from '@screens/payment/PaymentHistoryScreen';
import { PaymentCheckoutScreen } from '@screens/payment/PaymentCheckoutScreen';

const Stack = createNativeStackNavigator<WalletStackParamList>();

const WalletStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WalletHome" component={PlaceholderScreen} />
            <Stack.Screen name="TopUp" component={PlaceholderScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="AddPaymentMethod" component={CardPaymentScreen} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
            <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
            <Stack.Screen name="Subscriptions" component={PlaceholderScreen} />
        </Stack.Navigator>
    );
};

export default WalletStack;
