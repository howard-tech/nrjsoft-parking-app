import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { ParkingGarage } from '@services/parking/parkingService';
import { useTheme } from '@theme';

interface GarageMarkerProps {
    garage: ParkingGarage;
    isSelected: boolean;
    distanceLabel?: string;
    onPress: () => void;
}

export const GarageMarker: React.FC<GarageMarkerProps> = memo(
    ({ garage, isSelected, distanceLabel, onPress }) => {
        const theme = useTheme();
        const scale = useRef(new Animated.Value(isSelected ? 1.1 : 1)).current;
        const styles = useMemo(() => createStyles(), []);

        useEffect(() => {
            Animated.spring(scale, {
                toValue: isSelected ? 1.1 : 1,
                friction: 6,
                useNativeDriver: true,
            }).start();
        }, [isSelected, scale]);

        const statusColor =
            garage.status === 'full'
                ? theme.colors.map.full
                : garage.status === 'limited'
                    ? theme.colors.map.limited
                    : theme.colors.map.available;

        return (
            <Marker
                coordinate={{ latitude: garage.latitude, longitude: garage.longitude }}
                onPress={onPress}
                tracksViewChanges={false}
                identifier={garage.id}
                accessibilityLabel={`Garage ${garage.name ?? garage.id}${distanceLabel ? `, ${distanceLabel}` : ''}`}
                accessibilityRole="button"
            >
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ scale }] },
                        isSelected && styles.containerSelected,
                    ]}
                >
                    <View
                        style={[
                            styles.markerBody,
                            {
                                backgroundColor: isSelected
                                    ? theme.colors.primary.main
                                    : theme.colors.neutral.surface,
                                borderColor: isSelected
                                    ? theme.colors.primary.main
                                    : theme.colors.neutral.border,
                            },
                        ]}
                    >
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text
                            style={[
                                styles.distance,
                                {
                                    color: isSelected
                                        ? theme.colors.primary.contrast
                                        : theme.colors.neutral.textPrimary,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {distanceLabel ?? ''}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.pointer,
                            {
                                borderTopColor: isSelected
                                    ? theme.colors.primary.main
                                    : theme.colors.neutral.surface,
                            },
                        ]}
                    />
                </Animated.View>
            </Marker>
        );
    }
);

const createStyles = () =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        containerSelected: {
            shadowColor: '#000000',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 6,
        },
        markerBody: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 16,
            borderWidth: 1,
            shadowColor: '#000000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
            minWidth: 68,
        },
        statusDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 6,
        },
        distance: {
            fontSize: 13,
            fontWeight: '700',
        },
        pointer: {
            width: 0,
            height: 0,
            borderLeftWidth: 8,
            borderRightWidth: 8,
            borderTopWidth: 8,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            marginTop: -1,
        },
    });
