import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useTheme } from '@theme';
import { mapStyle } from '@theme/mapStyle';
import { useLocation } from '@hooks/useLocation';

const DEFAULT_REGION: Region = {
    latitude: 52.52,
    longitude: 13.405,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export const SmartMapScreen: React.FC = () => {
    const theme = useTheme();
    const { coords, getCurrentPosition, permission } = useLocation();
    const [region, setRegion] = useState<Region>(DEFAULT_REGION);

    useEffect(() => {
        getCurrentPosition();
    }, [getCurrentPosition]);

    useEffect(() => {
        if (coords) {
            setRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            });
        }
    }, [coords]);

    const mapProps = useMemo(
        () => ({
            provider: PROVIDER_GOOGLE,
            customMapStyle: mapStyle,
        }),
        []
    );

    return (
        <View style={styles.container}>
            {!coords && permission !== 'blocked' && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator color={theme.colors.primary.main} size="large" />
                </View>
            )}
            <MapView
                style={styles.map}
                {...mapProps}
                region={region}
                showsUserLocation
                showsMyLocationButton={Platform.OS === 'android'}
                onRegionChangeComplete={(next) => setRegion(next)}
            >
                <Marker
                    coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                    title="You"
                    pinColor={theme.colors.primary.main}
                />
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
});

export default SmartMapScreen;
