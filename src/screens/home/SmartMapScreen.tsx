import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useTheme } from '@theme';
import { mapStyle } from '@theme/mapStyle';
import { useLocation } from '@hooks/useLocation';
import { useSearch } from '@hooks/useSearch';
import { useFilters } from '@hooks/useFilters';
import { useNetworkState, useOfflineQueue } from '@hooks';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { parkingService, ParkingGarage } from '@services/parking/parkingService';
import { offlineCache } from '@services/offline/offlineCache';
import { clusterItems, distanceInMeters, formatDistance } from '@utils/mapUtils';
import { OnStreetZone } from '@types';
import { GarageCard } from './components/GarageCard';
import { GarageMarker } from './components/GarageMarker';
import { ClusterMarker } from './components/ClusterMarker';
import { OnStreetMarker } from './components/OnStreetMarker';
import { GarageBottomSheet } from './components/GarageBottomSheet';
import { SearchBar } from './components/SearchBar';
import { FilterChips } from './components/FilterChips';

const DEFAULT_REGION: Region = {
    latitude: 52.52,
    longitude: 13.405,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

const DEMO_CENTER: Region = {
    latitude: 43.8505,
    longitude: 25.919,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
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
    const [activeGarage, setActiveGarage] = useState<ParkingGarage | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [recenterLoading, setRecenterLoading] = useState(false);
    const [onStreetZones] = useState<OnStreetZone[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { activeFilter, setActiveFilter, applyFilters } = useFilters(coords);
    const networkState = useNetworkState();
    const isOffline = !networkState.isConnected || networkState.isInternetReachable === false;
    const lastFetchRef = useRef<{ key: string; ts: number }>({ key: '', ts: 0 });
    const MIN_FETCH_INTERVAL = 800; // ms guard to avoid rapid refetch jitter
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

    const updateSelection = useCallback((data: ParkingGarage[]) => {
        setSelectedId((previousSelected) => {
            if (!data.length) {
                setActiveGarage(null);
                return null;
            }

            const stillSelected = data.find((garage) => garage.id === previousSelected);
            if (stillSelected) {
                setActiveGarage(stillSelected);
                return stillSelected.id;
            }
            setActiveGarage(null);
            return data[0].id;
        });
    }, []);

    const fetchGarages = useCallback(
        async (
            lat: number,
            lng: number,
            regionOverride?: Region,
            options?: { query?: string; sortBy?: typeof activeFilter }
        ) => {
            const key = `${lat.toFixed(4)}|${lng.toFixed(4)}|${options?.sortBy ?? activeFilter ?? ''}|${
                options?.query ?? searchQuery.trim()
            }`;
            const now = Date.now();
            if (lastFetchRef.current.key === key && now - lastFetchRef.current.ts < MIN_FETCH_INTERVAL) {
                return;
            }
            lastFetchRef.current = { key, ts: now };
            setLoadingGarages(true);
            setFetchError(null);
            try {
                if (isOffline) {
                    const cached = await offlineCache.loadGarages();
                    if (cached?.garages?.length) {
                        setGarages(cached.garages);
                        updateSelection(cached.garages);
                        if (cached.region) {
                            setMapRegion((prev) => ({
                                ...prev,
                                ...cached.region,
                            }));
                        }
                        setFetchError('Offline. Showing last known results.');
                        return;
                    }
                    throw new Error('offline');
                }

                const data = await parkingService.fetchNearby(lat, lng, {
                    sortBy: options?.sortBy ?? activeFilter,
                    query: options?.query ?? (searchQuery.trim() || undefined),
                });
                setGarages(data);
                updateSelection(data);

                const regionToPersist =
                    regionOverride ??
                    {
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: mapRegion.latitudeDelta,
                        longitudeDelta: mapRegion.longitudeDelta,
                    };
                await offlineCache.saveGarages(data, regionToPersist);
            } catch (err) {
                console.warn('Failed to load garages', err);
                setFetchError(
                    isOffline
                        ? 'Offline and no cached data available.'
                        : 'Unable to load nearby garages. Try again in a moment.'
                );
                setGarages([]);
                setSelectedId(null);
                setActiveGarage(null);
            } finally {
                setLoadingGarages(false);
            }
        },
        [MIN_FETCH_INTERVAL, activeFilter, isOffline, mapRegion.latitudeDelta, mapRegion.longitudeDelta, searchQuery, updateSelection]
    );

    useEffect(() => {
        const loadCached = async () => {
            const cached = await offlineCache.loadGarages();
            if (cached?.garages?.length) {
                setGarages(cached.garages);
                updateSelection(cached.garages);
                if (cached.region) {
                    setMapRegion((prev) => ({
                        ...prev,
                        ...cached.region,
                    }));
                }
            }
        };

        loadCached();
    }, [updateSelection]);

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
        fetchGarages(nextRegion.latitude, nextRegion.longitude, nextRegion);
    }, [coords, fetchGarages]);

    useEffect(() => {
        if (!coords) {
            return;
        }
        fetchGarages(coords.latitude, coords.longitude, mapRegion, { sortBy: activeFilter });
    }, [activeFilter, coords, fetchGarages, mapRegion]);

    useEffect(() => {
        if (!coords) {
            return;
        }
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }
        searchDebounceRef.current = setTimeout(() => {
            fetchGarages(coords.latitude, coords.longitude, mapRegion, {
                sortBy: activeFilter,
                query: searchQuery.trim() || undefined,
            });
        }, 500);

        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, [activeFilter, coords, fetchGarages, mapRegion, searchQuery]);

    const mapProps = useMemo(
        () => ({
            provider: PROVIDER_GOOGLE,
            customMapStyle: mapStyle,
        }),
        []
    );

    const offlineHandlers = useMemo(
        () => ({
            refreshNearby: async (payload: unknown) => {
                const coordsPayload = payload as { lat: number; lng: number };
                await fetchGarages(coordsPayload.lat, coordsPayload.lng);
            },
        }),
        [fetchGarages]
    );

    const { enqueue: enqueueOfflineAction } = useOfflineQueue(offlineHandlers, networkState);

    const garagesWithDistance = useMemo(
        () =>
            garages.map((garage) => {
                const computedDistance =
                    garage.distanceMeters ??
                    (coords
                        ? distanceInMeters(coords.latitude, coords.longitude, garage.latitude, garage.longitude)
                        : undefined);
                return { ...garage, distanceMeters: computedDistance };
            }),
        [coords, garages]
    );

    const { results: searchResults, recentSearches, recordSelection, clearHistory } = useSearch(
        garagesWithDistance,
        searchQuery
    );

    const filteredGarages = useMemo(() => {
        const base = searchQuery.trim() ? searchResults : garagesWithDistance;
        return applyFilters(base);
    }, [applyFilters, garagesWithDistance, searchQuery, searchResults]);

    useEffect(() => {
        if (filteredGarages.length === 0) {
            setSelectedId(null);
            setActiveGarage(null);
            return;
        }

        if (selectedId && filteredGarages.some((g: ParkingGarage) => g.id === selectedId)) {
            const found = filteredGarages.find((g: ParkingGarage) => g.id === selectedId) ?? null;
            setActiveGarage(found);
            return;
        }

        setSelectedId(filteredGarages[0].id);
        setActiveGarage(filteredGarages[0]);
    }, [filteredGarages, selectedId]);

    const clusteredGarages = useMemo(
        () => clusterItems(filteredGarages, mapRegion),
        [filteredGarages, mapRegion]
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

    const shouldShowLocationOverlay =
        !coords && permission !== 'blocked' && permission !== 'denied';

    const themedStyles = useMemo(
        () =>
            StyleSheet.create({
                overlayBg: { backgroundColor: theme.colors.neutral.surface },
                statusTitle: { color: theme.colors.primary.main },
                statusText: { color: theme.colors.neutral.textSecondary },
                clearFiltersText: { color: theme.colors.primary.main },
                controlsSurface: {
                    backgroundColor: theme.colors.neutral.surface,
                    borderColor: theme.colors.neutral.border,
                },
                overlayBase: {
                    backgroundColor: theme.colors.neutral.surface,
                }
            }),
        [theme.colors]
    );

    const handleSelect = useCallback(
        (garage: ParkingGarage) => {
            setSelectedId(garage.id);
            setActiveGarage(garage);
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
        if (isOffline) {
            enqueueOfflineAction('refreshNearby', {
                lat: mapRegion.latitude,
                lng: mapRegion.longitude,
            });
            setFetchError('Offline. Refresh will retry automatically once online.');
            return;
        }

        const targetLat = coords?.latitude ?? mapRegion.latitude;
        const targetLng = coords?.longitude ?? mapRegion.longitude;
        fetchGarages(targetLat, targetLng, mapRegion, { sortBy: activeFilter, query: searchQuery.trim() || undefined });
    }, [
        coords,
        enqueueOfflineAction,
        fetchGarages,
        getCurrentPosition,
        isOffline,
        mapRegion,
        activeFilter,
        searchQuery,
    ]);

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
            fetchGarages(current.latitude, current.longitude, undefined, {
                sortBy: activeFilter,
                query: searchQuery.trim() || undefined,
            });
        }
        setRecenterLoading(false);
    }, [activeFilter, fetchGarages, getCurrentPosition, searchQuery]);

    const handleJumpToDemo = useCallback(() => {
        mapRef.current?.animateToRegion(DEMO_CENTER, 500);
        setMapRegion(DEMO_CENTER);
        fetchGarages(DEMO_CENTER.latitude, DEMO_CENTER.longitude, DEMO_CENTER, {
            sortBy: activeFilter,
            query: searchQuery.trim() || undefined,
        });
    }, [activeFilter, fetchGarages, searchQuery]);

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

    const handleCloseSheet = useCallback(() => {
        setActiveGarage(null);
    }, []);

    const handleSearchSubmit = useCallback(() => {
        if (searchQuery.trim() && filteredGarages.length > 0) {
            handleSelect(filteredGarages[0]);
        }
    }, [filteredGarages, handleSelect, searchQuery]);

    const handleSearchSelect = useCallback(
        (result: ParkingGarage) => {
            recordSelection(result);
            handleSelect(result);
            mapRef.current?.animateToRegion(
                {
                    latitude: result.latitude,
                    longitude: result.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                300
            );
            fetchGarages(result.latitude, result.longitude, undefined, {
                sortBy: activeFilter,
                query: searchQuery.trim() || undefined,
            });
        },
        [activeFilter, fetchGarages, handleSelect, recordSelection, searchQuery]
    );

    const handleClearFilters = useCallback(() => {
        setActiveFilter(null);
    }, [setActiveFilter]);

    return (
        <View style={styles.container}>
            <View style={[styles.searchArea, theme.shadows.md]}>
                <SearchBar
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                    results={searchResults}
                    recentSearches={recentSearches}
                    onSelect={handleSearchSelect}
                    onSubmit={handleSearchSubmit}
                    onClearRecent={clearHistory}
                />
                <FilterChips activeFilter={activeFilter} onChange={setActiveFilter} />
                {(searchQuery.length > 0 || activeFilter) && (
                    <TouchableOpacity
                        style={styles.clearFilters}
                        onPress={() => { setSearchQuery(''); handleClearFilters(); }}
                        accessibilityRole="button"
                        accessibilityLabel="Clear search and filters"
                    >
                        <Text style={[styles.clearFiltersText, themedStyles.clearFiltersText]}>
                            Clear search & filters
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {shouldShowLocationOverlay && (
                <Overlay>
                    {locationError ? (
                        <>
                            <Text style={[styles.statusTitle, themedStyles.statusTitle]}>Unable to get location</Text>
                            <Text style={[styles.statusText, themedStyles.statusText]}>{locationError}</Text>
                            <Button title="Try again" onPress={getCurrentPosition} />
                        </>
                    ) : (
                        <>
                            <ActivityIndicator color={theme.colors.primary.main} size="large" />
                            <Text style={[styles.statusText, themedStyles.statusText]}>Getting your location...</Text>
                        </>
                    )}
                </Overlay>
            )}
            {(permission === 'denied' || permission === 'blocked') && (
                <Overlay>
                    <Text style={[styles.statusTitle, themedStyles.statusTitle]}>Location access needed</Text>
                    <Text style={[styles.statusText, themedStyles.statusText]}>Allow location to show nearby parking.</Text>
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
                    style={[styles.controlButton, themedStyles.controlsSurface, theme.shadows.md]}
                    disabled={recenterLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Recenter map to my location"
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
                    onPress={handleJumpToDemo}
                    style={[styles.controlButton, themedStyles.controlsSurface, styles.controlSpacing, theme.shadows.md]}
                    accessibilityRole="button"
                    accessibilityLabel="Jump to demo center"
                >
                    <Text style={[styles.controlText, { color: theme.colors.primary.main }]}>
                        Demo center
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleRefreshGarages}
                    style={[styles.controlButton, themedStyles.controlsSurface, styles.controlSpacing, theme.shadows.md]}
                    disabled={loadingGarages}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh nearby garages"
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
                    data={filteredGarages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderGarageCard}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        !loadingGarages ? (
                            <EmptyState
                                title={coords ? 'No garages match your search' : 'Location required'}
                                description={
                                    coords
                                        ? 'Try clearing filters or searching another area.'
                                        : 'Enable location services to see nearby parking.'
                                }
                                icon={
                                    <Icon
                                        name={coords ? 'map-search-outline' : 'map-marker-off'}
                                        size={28}
                                        color={theme.colors.neutral.textSecondary}
                                    />
                                }
                                actionLabel={coords ? 'Clear search & filters' : 'Refresh'}
                                onAction={
                                    coords
                                        ? () => {
                                            setSearchQuery('');
                                            handleClearFilters();
                                        }
                                        : handleRefreshGarages
                                }
                            />
                        ) : null
                    }
                />
            </View>
            <GarageBottomSheet
                garage={activeGarage}
                distanceLabel={activeGarage ? computeDistanceLabel(activeGarage) : undefined}
                onClose={handleCloseSheet}
            />
        </View>
    );
};

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = useTheme();
    return (
        <View style={[styles.overlay, { backgroundColor: theme.colors.neutral.surface }]}>
            {children}
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
        textAlign: 'center',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
    },
    controls: {
        position: 'absolute',
        top: 140,
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
    searchArea: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 5,
    },
    clearFilters: {
        marginTop: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    clearFiltersText: {
        fontSize: 12,
        fontWeight: '600',
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
});

export default SmartMapScreen;
