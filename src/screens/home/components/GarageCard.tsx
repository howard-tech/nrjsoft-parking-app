import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ParkingGarage } from '@services/parking/parkingService';
import { Theme, useTheme } from '@theme';

interface Props {
    garage: ParkingGarage;
    isSelected?: boolean;
}

export const GarageCard: React.FC<Props> = ({ garage, isSelected }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const badgeColor =
        garage.status === 'full'
            ? theme.colors.error.main
            : garage.status === 'limited'
                ? theme.colors.warning.main
                : theme.colors.success.main;

    return (
        <View
            style={[
                styles.card,
                { borderColor: isSelected ? theme.colors.primary.main : theme.colors.neutral.border },
            ]}
        >
            <View style={styles.row}>
                <Text style={styles.name}>{garage.name}</Text>
                <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.badgeText}>{garage.status || 'available'}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <Text style={styles.meta}>
                    {garage.distanceMeters ? `${(garage.distanceMeters / 1000).toFixed(1)} km` : ''}
                </Text>
                {garage.availableSlots !== undefined && (
                    <Text style={styles.meta}>{garage.availableSlots} slots</Text>
                )}
            </View>
        </View>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        card: {
            width: 260,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            backgroundColor: theme.colors.neutral.surface,
            marginRight: 12,
            shadowColor: '#000000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        name: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.primary.main,
        },
        badge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 10,
        },
        badgeText: {
            fontSize: 12,
            fontWeight: '700',
            color: theme.colors.neutral.white,
            textTransform: 'capitalize',
        },
        meta: {
            fontSize: 12,
            color: theme.colors.neutral.textSecondary,
        },
    });
