import React from 'react';
import Icon from 'react-native-vector-icons/Feather';

interface TabBarIconProps {
    name: string;
    color: string;
    size: number;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, size }) => {
    return <Icon name={name} color={color} size={size} />;
};
