import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SessionStackParamList } from '../types';
import { PlaceholderScreen } from '@screens/common/PlaceholderScreen';
import { ActiveSessionScreen } from '@screens/parking/ActiveSessionScreen';

const Stack = createNativeStackNavigator<SessionStackParamList>();

const SessionStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} />
            <Stack.Screen name="SessionHistory" component={PlaceholderScreen} />
            <Stack.Screen name="SessionDetail" component={PlaceholderScreen} />
        </Stack.Navigator>
    );
};

export default SessionStack;
