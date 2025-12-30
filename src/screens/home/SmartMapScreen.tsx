import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useTheme } from '@theme';
import { mapStyle } from '@theme/mapStyle';
import { useLocation } from '@hooks/useLocation';
import { Button } from '@components/common/Button';

const DEFAULT_REGION: Region = {
    latitude: 52.52,
    longitude: 13.405,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export const SmartMapScreen: React.FC = () => {
    const theme = useTheme();
    const { coords, getCurrentPosition, permission, requestPermission, openPermissionSettings } = useLocation();
    const [region, setRegion] = useState<Region>(DEFAULT_REGION);
    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
        getCurrentPosition();
    }, [getCurrentPosition]);

    useEffect(() => {
        if (coords) {
            const nextRegion = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            };
            setRegion(nextRegion);
            mapRef.current?.animateToRegion(nextRegion);
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
            {!coords && permission !== 'blocked' && permission !== 'denied' && (
                <Overlay>
                    <ActivityIndicator color={theme.colors.primary.main} size="large" />
                    <Text style={styles.statusText}>Getting your location...</Text>
                </Overlay>
            )}
            {(permission === 'denied' || permission === 'blocked') && (
                <Overlay>
                    <Text style={styles.statusTitle}>Location access needed</Text>
                    <Text style={styles.statusText}>\nAllow location to show nearby parking.</Text>
                    {permission === 'denied' ? (
                        <Button title="Allow location" onPress={requestPermission} />
                    ) : (
                        <Button title="Open settings" onPress={openPermissionSettings} />
                    )}
                </Overlay>
            )}
            <MapView
                style={styles.map}
                {...mapProps}
                ref={mapRef}
                initialRegion={DEFAULT_REGION}
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

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <View style={styles.overlay}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        backgroundColor: 'rgba(255,255,255,0.85)',
        paddingHorizontal: 24,
        gap: 12,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E3A5F',
        textAlign: 'center',
    },
    statusText: {
        fontSize: 14,
        color: '#2C3E50',
        textAlign: 'center',
    },
});

export default SmartMapScreen;
