import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '@theme';
import { OnStreetZone } from '@types';

interface OnStreetMarkerProps {
    zone: OnStreetZone;
    isSelected?: boolean;
    onPress: () => void;
}

export const OnStreetMarker: React.FC<OnStreetMarkerProps> = memo(
    ({ zone, isSelected = false, onPress }) => {
        const theme = useTheme();
        const styles = useMemo(() => createStyles(theme), [theme]);

        return (
            <Marker
                identifier={zone.id}
                coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
                onPress={onPress}
                tracksViewChanges={false}
                accessibilityLabel={`On-street zone ${zone.name}`}
                accessibilityRole="button"
            >
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: isSelected
                                ? theme.colors.secondary.light
                                : theme.colors.secondary.main,
                        },
                        isSelected && styles.selected,
                    ]}
                >
                    <Text style={styles.icon}>🅿️</Text>
                    <Text style={styles.label} numberOfLines={1}>
                        {zone.name}
                    </Text>
                </View>
            </Marker>
        );
    }
);

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 14,
            maxWidth: 140,
            shadowColor: '#000000',
            shadowOpacity: 0.14,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
        },
        selected: {
            transform: [{ scale: 1.05 }],
        },
        icon: {
            marginRight: 6,
            fontSize: 14,
        },
        label: {
            color: theme.colors.neutral.white,
            fontSize: 12,
            fontWeight: '700',
        },
    });
