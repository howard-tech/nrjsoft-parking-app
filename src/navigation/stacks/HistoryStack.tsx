import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HistoryStackParamList } from '../types';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';
import { HistoryScreen } from '@screens/account/HistoryScreen';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

const HistoryStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HistoryList" component={HistoryScreen} />
            <Stack.Screen name="HistoryDetail" component={PlaceholderScreen} />
            <Stack.Screen name="Receipt" component={PlaceholderScreen} />
        </Stack.Navigator>
    );
};

export default HistoryStack;
