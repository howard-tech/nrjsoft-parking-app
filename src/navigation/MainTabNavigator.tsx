import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { useTheme } from '@theme';

// Import stack navigators
import HomeStack from './stacks/HomeStack';
import SessionStack from './stacks/SessionStack';
import WalletStack from './stacks/WalletStack';
import HistoryStack from './stacks/HistoryStack';
import AccountStack from './stacks/AccountStack';

// Import components
import { TabBarIcon } from '@components/common/TabBarIcon';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary.main,
                tabBarInactiveTintColor: theme.colors.neutral.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.neutral.surface,
                    borderTopColor: theme.colors.neutral.border,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="map" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="SessionTab"
                component={SessionStack}
                options={{
                    tabBarLabel: 'Session',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="clock" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="WalletTab"
                component={WalletStack}
                options={{
                    tabBarLabel: 'Wallet',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="credit-card" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="HistoryTab"
                component={HistoryStack}
                options={{
                    tabBarLabel: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="list" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="AccountTab"
                component={AccountStack}
                options={{
                    tabBarLabel: 'Account',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="user" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
