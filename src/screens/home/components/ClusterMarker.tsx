import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '@theme';

interface ClusterMarkerProps {
    id: string;
    latitude: number;
    longitude: number;
    count: number;
    onPress: () => void;
}

export const ClusterMarker: React.FC<ClusterMarkerProps> = memo(
    ({ id, latitude, longitude, count, onPress }) => {
        const theme = useTheme();
        const styles = useMemo(() => createStyles(theme), [theme]);

        return (
            <Marker
                identifier={id}
                coordinate={{ latitude, longitude }}
                onPress={onPress}
                tracksViewChanges={false}
            >
                <View style={styles.container}>
                    <Text style={styles.count}>{count}</Text>
                </View>
            </Marker>
        );
    }
);

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.primary.main,
            borderWidth: 2,
            borderColor: theme.colors.neutral.white,
            shadowColor: '#000000',
            shadowOpacity: 0.16,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 6,
        },
        count: {
            color: theme.colors.primary.contrast,
            fontSize: 14,
            fontWeight: '700',
        },
    });
