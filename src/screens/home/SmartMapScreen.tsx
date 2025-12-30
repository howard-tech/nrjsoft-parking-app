import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text, FlatList, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useTheme } from '@theme';
import { mapStyle } from '@theme/mapStyle';
import { useLocation } from '@hooks/useLocation';
import { Button } from '@components/common/Button';
import { parkingService, ParkingGarage } from '@services/parking/parkingService';
import { clusterItems, distanceInMeters, formatDistance } from '@utils/mapUtils';
import { OnStreetZone } from '@types';
import { GarageCard } from './components/GarageCard';
import { GarageMarker } from './components/GarageMarker';
import { ClusterMarker } from './components/ClusterMarker';
import { OnStreetMarker } from './components/OnStreetMarker';

const DEFAULT_REGION: Region = {
    latitude: 52.52,
    longitude: 13.405,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export const SmartMapScreen: React.FC = () => {
    const theme = useTheme();
    const {
        coords,
        getCurrentPosition,
        permission,
        requestPermission,
        openPermissionSettings,
        error: locationError,
    } = useLocation();
    const mapRef = useRef<MapView | null>(null);
    const listRef = useRef<FlatList<ParkingGarage> | null>(null);
    const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);
    const [garages, setGarages] = useState<ParkingGarage[]>([]);
    const [loadingGarages, setLoadingGarages] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [recenterLoading, setRecenterLoading] = useState(false);
    const [onStreetZones] = useState<OnStreetZone[]>([]);

    const fetchGarages = useCallback(async (lat: number, lng: number) => {
        setLoadingGarages(true);
        setFetchError(null);
        try {
            const data = await parkingService.fetchNearby(lat, lng);
            setGarages(data);
            setSelectedId((previousSelected) => {
                if (!data.length) {
                    return null;
                }

                const stillSelected = data.find((garage) => garage.id === previousSelected);
                return stillSelected ? stillSelected.id : data[0].id;
            });
        } catch (err) {
            console.warn('Failed to load garages', err);
            setFetchError('Unable to load nearby garages. Try again in a moment.');
            setGarages([]);
            setSelectedId(null);
        } finally {
            setLoadingGarages(false);
        }
    }, []);

    useEffect(() => {
        getCurrentPosition();
    }, [getCurrentPosition]);

    useEffect(() => {
        if ((permission === 'granted' || permission === 'limited') && !coords) {
            getCurrentPosition();
        }
    }, [coords, getCurrentPosition, permission]);

    useEffect(() => {
        if (!coords) {
            return;
        }

        const nextRegion = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
        };
        setMapRegion(nextRegion);
        mapRef.current?.animateToRegion(nextRegion, 500);
        fetchGarages(nextRegion.latitude, nextRegion.longitude);
    }, [coords, fetchGarages]);

    const mapProps = useMemo(
        () => ({
            provider: PROVIDER_GOOGLE,
            customMapStyle: mapStyle,
        }),
        []
    );

    const computeDistanceLabel = useCallback(
        (garage: ParkingGarage) => {
            const meters =
                garage.distanceMeters ??
                (coords
                    ? distanceInMeters(coords.latitude, coords.longitude, garage.latitude, garage.longitude)
                    : undefined);
            return formatDistance(meters);
        },
        [coords]
    );

    const clusteredGarages = useMemo(
        () => clusterItems(garages, mapRegion),
        [garages, mapRegion]
    );

    const shouldShowLocationOverlay =
        !coords && permission !== 'blocked' && permission !== 'denied';

    const controlSurfaceStyle = useMemo(
        () => ({
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: theme.colors.neutral.border,
        }),
        [theme.colors.neutral.border]
    );

    const handleSelect = useCallback(
        (garage: ParkingGarage) => {
            setSelectedId(garage.id);
            mapRef.current?.animateToRegion(
                {
                    latitude: garage.latitude,
                    longitude: garage.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                350
            );

            const targetIndex = garages.findIndex((item) => item.id === garage.id);
            if (targetIndex >= 0) {
                listRef.current?.scrollToIndex({ index: targetIndex, animated: true });
            }
        },
        [garages]
    );

    const handleClusterPress = useCallback(
        (latitude: number, longitude: number) => {
            const nextDelta = {
                latitudeDelta: Math.max(mapRegion.latitudeDelta * 0.5, 0.005),
                longitudeDelta: Math.max(mapRegion.longitudeDelta * 0.5, 0.005),
            };

            mapRef.current?.animateToRegion(
                {
                    latitude,
                    longitude,
                    ...nextDelta,
                },
                250
            );
        },
        [mapRegion.latitudeDelta, mapRegion.longitudeDelta]
    );

    const renderGarageCard = ({ item }: { item: ParkingGarage }) => (
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleSelect(item)}>
            <GarageCard garage={item} isSelected={item.id === selectedId} />
        </TouchableOpacity>
    );

    const handleRefreshGarages = useCallback(() => {
        if (coords) {
            fetchGarages(coords.latitude, coords.longitude);
            return;
        }

        getCurrentPosition();
    }, [coords, fetchGarages, getCurrentPosition]);

    const handleRecenter = useCallback(async () => {
        setRecenterLoading(true);
        const current = await getCurrentPosition();
        if (current) {
            mapRef.current?.animateToRegion(
                {
                    latitude: current.latitude,
                    longitude: current.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                },
                350
            );
        }
        setRecenterLoading(false);
    }, [getCurrentPosition]);

    const handleZonePress = useCallback(
        (zone: OnStreetZone) => {
            mapRef.current?.animateToRegion(
                {
                    latitude: zone.latitude,
                    longitude: zone.longitude,
                    latitudeDelta: Math.max(mapRegion.latitudeDelta * 0.8, 0.01),
                    longitudeDelta: Math.max(mapRegion.longitudeDelta * 0.8, 0.01),
                },
                250
            );
        },
        [mapRegion.latitudeDelta, mapRegion.longitudeDelta]
    );

    return (
        <View style={styles.container}>
            {shouldShowLocationOverlay && (
                <Overlay>
                    {locationError ? (
                        <>
                            <Text style={styles.statusTitle}>Unable to get location</Text>
                            <Text style={styles.statusText}>{locationError}</Text>
                            <Button title="Try again" onPress={getCurrentPosition} />
                        </>
                    ) : (
                        <>
                            <ActivityIndicator color={theme.colors.primary.main} size="large" />
                            <Text style={styles.statusText}>Getting your location...</Text>
                        </>
                    )}
                </Overlay>
            )}
            {(permission === 'denied' || permission === 'blocked') && (
                <Overlay>
                    <Text style={styles.statusTitle}>Location access needed</Text>
                    <Text style={styles.statusText}>Allow location to show nearby parking.</Text>
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
                region={mapRegion}
                showsUserLocation
                showsMyLocationButton={Platform.OS === 'android'}
                onRegionChangeComplete={setMapRegion}
            >
                {clusteredGarages.map((item) => {
                    if (item.type === 'cluster') {
                        return (
                            <ClusterMarker
                                key={item.cluster.id}
                                id={item.cluster.id}
                                latitude={item.cluster.coordinate.latitude}
                                longitude={item.cluster.coordinate.longitude}
                                count={item.cluster.count}
                                onPress={() =>
                                    handleClusterPress(
                                        item.cluster.coordinate.latitude,
                                        item.cluster.coordinate.longitude
                                    )
                                }
                            />
                        );
                    }

                    const garage = item.item;
                    return (
                        <GarageMarker
                            key={garage.id}
                            garage={garage}
                            isSelected={garage.id === selectedId}
                            distanceLabel={computeDistanceLabel(garage)}
                            onPress={() => handleSelect(garage)}
                        />
                    );
                })}
                {onStreetZones.map((zone) => (
                    <OnStreetMarker key={zone.id} zone={zone} onPress={() => handleZonePress(zone)} />
                ))}
            </MapView>
            <View style={styles.controls}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleRecenter}
                    style={[styles.controlButton, controlSurfaceStyle]}
                    disabled={recenterLoading}
                >
                    {recenterLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary.main} />
                    ) : (
                        <Text style={[styles.controlText, { color: theme.colors.primary.main }]}>
                            My location
                        </Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleRefreshGarages}
                    style={[styles.controlButton, controlSurfaceStyle, styles.controlSpacing]}
                    disabled={loadingGarages}
                >
                    {loadingGarages ? (
                        <ActivityIndicator size="small" color={theme.colors.primary.main} />
                    ) : (
                        <Text style={[styles.controlText, { color: theme.colors.primary.main }]}>
                            Refresh
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.carouselContainer}>
                {loadingGarages && (
                    <ActivityIndicator color={theme.colors.primary.main} />
                )}
                {fetchError && !loadingGarages && (
                    <Text style={[styles.errorText, { color: theme.colors.error.main }]}>{fetchError}</Text>
                )}
                <FlatList
                    ref={listRef}
                    data={garages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderGarageCard}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        !loadingGarages ? (
                            <Text style={styles.emptyText}>
                                {coords
                                    ? 'No nearby garages found yet.'
                                    : 'Enable location to load nearby garages.'}
                            </Text>
                        ) : null
                    }
                />
            </View>
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
        zIndex: 4,
        backgroundColor: 'rgba(255,255,255,0.85)',
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E3A5F',
        textAlign: 'center',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 12,
    },
    controls: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        zIndex: 3,
    },
    controlButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        minWidth: 96,
    },
    controlText: {
        fontSize: 12,
        fontWeight: '700',
    },
    controlSpacing: {
        marginLeft: 8,
    },
    carouselContainer: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        paddingLeft: 16,
        paddingVertical: 8,
        zIndex: 2,
    },
    listContent: {
        paddingRight: 16,
        paddingVertical: 4,
    },
    errorText: {
        marginBottom: 8,
        fontSize: 12,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 12,
        color: '#2C3E50',
        paddingVertical: 4,
    },
});

export default SmartMapScreen;
