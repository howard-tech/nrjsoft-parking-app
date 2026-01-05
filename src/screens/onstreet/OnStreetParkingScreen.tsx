import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@theme';
import { useLocation } from '@hooks/useLocation';
import { onStreetService, OnStreetSession, OnStreetZone } from '@services/onstreet/onStreetService';

const DEFAULT_DURATION = 60;
const DEFAULT_PLATE = 'DEMO-123';

export const OnStreetParkingScreen: React.FC = () => {
    const theme = useTheme();
    const { coords, permission, getCurrentPosition, requestPermission, openPermissionSettings, error: locationError } =
        useLocation();

    const [zones, setZones] = useState<OnStreetZone[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeZone, setActiveZone] = useState<OnStreetZone | null>(null);
    const [vehiclePlate, setVehiclePlate] = useState(DEFAULT_PLATE);
    const [duration, setDuration] = useState<number>(DEFAULT_DURATION);
    const [activeSession, setActiveSession] = useState<OnStreetSession | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const themedStyles = useMemo(
        () =>
            StyleSheet.create({
                card: {
                    backgroundColor: theme.colors.neutral.surface,
                    borderColor: theme.colors.neutral.border,
                },
                primary: {
                    color: theme.colors.primary.main,
                },
            }),
        [theme.colors]
    );

    const fetchZones = useCallback(
        async (force?: boolean) => {
            if (!coords) return;
            if (loading && !force) return;
            setLoading(true);
            setError(null);
            try {
                const data = await onStreetService.fetchZones(coords.latitude, coords.longitude);
                setZones(data);
                if (!activeZone && data.length) {
                    setActiveZone(data[0]);
                }
            } catch (err) {
                console.warn('Failed to load on-street zones', err);
                setError('Unable to load zones. Pull to retry.');
            } finally {
                setLoading(false);
            }
        },
        [activeZone, coords, loading]
    );

    const fetchActiveSession = useCallback(async () => {
        const session = await onStreetService.getActiveSession();
        setActiveSession(session);
    }, []);

    useEffect(() => {
        if (permission === 'denied' || permission === 'blocked') return;
        if (!coords) {
            getCurrentPosition();
        }
    }, [coords, getCurrentPosition, permission]);

    useEffect(() => {
        if (coords) {
            fetchZones(true);
            fetchActiveSession();
        }
    }, [coords, fetchActiveSession, fetchZones]);

    const handleStart = useCallback(async () => {
        if (!activeZone) return;
        setActionLoading(true);
        try {
            const session = await onStreetService.startSession({
                zoneId: activeZone.id,
                vehiclePlate: vehiclePlate.trim() || DEFAULT_PLATE,
                duration: duration || DEFAULT_DURATION,
            });
            setActiveSession(session);
            Alert.alert('On-Street Parking', 'Session started successfully.');
        } catch (err) {
            console.warn('Failed to start on-street session', err);
            Alert.alert('Error', 'Could not start session. Please try again.');
        } finally {
            setActionLoading(false);
        }
    }, [activeZone, duration, vehiclePlate]);

    const handleExtend = useCallback(async () => {
        if (!activeSession) return;
        setActionLoading(true);
        try {
            const session = await onStreetService.extendSession(activeSession.id, 15);
            if (session) {
                setActiveSession(session);
                Alert.alert('Extended', 'Session extended by 15 minutes.');
            }
        } catch (err) {
            console.warn('Failed to extend on-street session', err);
            Alert.alert('Error', 'Could not extend session.');
        } finally {
            setActionLoading(false);
        }
    }, [activeSession]);

    const handleStop = useCallback(async () => {
        if (!activeSession) return;
        setActionLoading(true);
        try {
            const session = await onStreetService.stopSession(activeSession.id);
            if (session) {
                setActiveSession(null);
                Alert.alert('Stopped', 'Session ended.');
            }
        } catch (err) {
            console.warn('Failed to stop on-street session', err);
            Alert.alert('Error', 'Could not stop session.');
        } finally {
            setActionLoading(false);
        }
    }, [activeSession]);

    const renderZone = ({ item }: { item: OnStreetZone }) => {
        const selected = activeZone?.id === item.id;
        return (
            <TouchableOpacity
                onPress={() => setActiveZone(item)}
                style={[
                    styles.zoneCard,
                    themedStyles.card,
                    selected && { borderColor: theme.colors.primary.main, borderWidth: 1.5 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Zone ${item.name}`}
            >
                <Text style={styles.zoneName}>{item.name}</Text>
                <Text style={styles.zoneMeta}>
                    {item.type} • €{item.hourlyRate?.toFixed(2) ?? '--'} /h • Max {item.maxDuration ?? '--'} min
                </Text>
                {item.restrictions ? <Text style={styles.zoneRestrictions}>{item.restrictions}</Text> : null}
            </TouchableOpacity>
        );
    };

    if (permission === 'denied' || permission === 'blocked') {
        return (
            <View style={[styles.centered]}>
                <Text style={styles.title}>Location access needed</Text>
                <Text style={styles.subtitle}>Allow location to load nearby zones.</Text>
                <TouchableOpacity onPress={permission === 'denied' ? requestPermission : openPermissionSettings}>
                    <Text style={[styles.link, themedStyles.primary]}>
                        {permission === 'denied' ? 'Allow location' : 'Open settings'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
            <View style={styles.header}>
                <Text style={styles.title}>On-Street Parking</Text>
                <TouchableOpacity onPress={() => fetchZones(true)} accessibilityLabel="Refresh zones">
                    <Text style={[styles.link, themedStyles.primary]}>Refresh</Text>
                </TouchableOpacity>
            </View>

            {locationError ? (
                <Text style={styles.errorText}>{locationError}</Text>
            ) : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <FlatList
                data={zones}
                keyExtractor={(item) => item.id}
                renderItem={renderZone}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchZones(true)} />}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator color={theme.colors.primary.main} />
                    ) : (
                        <Text style={styles.subtitle}>No zones found. Pull to refresh.</Text>
                    )
                }
                contentContainerStyle={styles.listContent}
            />

            <View style={[styles.card, themedStyles.card, theme.shadows.md]}>
                <Text style={styles.sectionTitle}>Start a session</Text>
                <Text style={styles.subtitle}>{activeZone ? activeZone.name : 'Select a zone'}</Text>
                <View style={styles.formRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle plate</Text>
                        <TextInput
                            value={vehiclePlate}
                            onChangeText={setVehiclePlate}
                            style={[styles.input, { borderColor: theme.colors.neutral.border }]}
                            autoCapitalize="characters"
                            accessibilityLabel="Vehicle plate"
                        />
                    </View>
                    <View style={[styles.inputGroup, styles.inputCompact]}>
                        <Text style={styles.label}>Minutes</Text>
                        <TextInput
                            value={String(duration)}
                            onChangeText={(text) => setDuration(Number(text) || DEFAULT_DURATION)}
                            keyboardType="numeric"
                            style={[styles.input, { borderColor: theme.colors.neutral.border }]}
                            accessibilityLabel="Duration in minutes"
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={[
                        styles.primaryButton,
                        { backgroundColor: theme.colors.primary.main },
                        !activeZone && { opacity: 0.6 },
                    ]}
                    onPress={handleStart}
                    disabled={!activeZone || actionLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Start on-street session"
                >
                    {actionLoading ? (
                        <ActivityIndicator color={theme.colors.neutral.white} />
                    ) : (
                        <Text style={styles.primaryButtonText}>Start session</Text>
                    )}
                </TouchableOpacity>
            </View>

            {activeSession && (
                <View style={[styles.card, themedStyles.card, theme.shadows.md]}>
                    <Text style={styles.sectionTitle}>Active session</Text>
                    <Text style={styles.subtitle}>{activeSession.zoneName ?? activeSession.zoneId}</Text>
                    <Text style={styles.subtitle}>
                        Remaining: {activeSession.remainingMinutes ?? '--'} min • Total €{activeSession.totalFee ?? 0}
                    </Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.secondaryButton, { borderColor: theme.colors.primary.main }]}
                            onPress={handleExtend}
                            disabled={actionLoading}
                            accessibilityRole="button"
                            accessibilityLabel="Extend session by 15 minutes"
                        >
                            <Text style={[styles.secondaryButtonText, themedStyles.primary]}>+15 min</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                styles.buttonFlexible,
                                { backgroundColor: theme.colors.error.main },
                            ]}
                            onPress={handleStop}
                            disabled={actionLoading}
                            accessibilityRole="button"
                            accessibilityLabel="Stop session"
                        >
                            {actionLoading ? (
                                <ActivityIndicator color={theme.colors.neutral.white} />
                            ) : (
                                <Text style={styles.primaryButtonText}>Stop</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        color: '#6C727F',
        marginTop: 4,
    },
    link: {
        fontSize: 14,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    zoneCard: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    zoneName: {
        fontSize: 16,
        fontWeight: '700',
    },
    zoneMeta: {
        fontSize: 13,
        color: '#6C727F',
        marginTop: 4,
    },
    zoneRestrictions: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    card: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    formRow: {
        flexDirection: 'row',
        marginTop: 12,
    },
    inputGroup: {
        flex: 1,
        marginRight: 8,
    },
    inputCompact: {
        maxWidth: 100,
        marginRight: 0,
    },
    label: {
        fontSize: 12,
        color: '#6C727F',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#FFF',
    },
    primaryButton: {
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    secondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        marginRight: 8,
        flex: 1,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    buttonFlexible: {
        flex: 1,
    },
    errorText: {
        color: '#B91C1C',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
});

export default OnStreetParkingScreen;
