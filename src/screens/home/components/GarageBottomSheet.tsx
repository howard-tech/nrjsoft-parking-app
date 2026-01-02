import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ParkingGarage, parkingService } from '@services/parking/parkingService';
import { useTheme } from '@theme';
import { Button } from '@components/common/Button';
import { NavigateButton } from '@components/map/NavigateButton';

const SNAP_POINTS = [0.45, 0.8];
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
    garage: ParkingGarage | null;
    distanceLabel?: string;
    onClose: () => void;
}

export const GarageBottomSheet: React.FC<Props> = ({ garage, distanceLabel, onClose }) => {
    const theme = useTheme();
    const navigation = useNavigation();
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const currentSnap = useRef<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<ParkingGarage | null>(null);

    const snapTo = useCallback(
        (snapIndex: number | null) => {
            const toValue =
                snapIndex === null
                    ? SCREEN_HEIGHT
                    : SCREEN_HEIGHT * (1 - SNAP_POINTS[snapIndex]);

            Animated.spring(translateY, {
                toValue,
                useNativeDriver: true,
                friction: 8,
            }).start(() => {
                currentSnap.current = snapIndex;
                if (snapIndex === null) {
                    setDetail(null);
                }
            });
        },
        [translateY]
    );

    useEffect(() => {
        if (!garage) {
            snapTo(null);
            return;
        }
        currentSnap.current = 0;
        snapTo(0);

        const loadDetail = async () => {
            setLoading(true);
            const data = await parkingService.fetchDetail(garage.id);
            setDetail({
                ...garage,
                ...data,
            });
            setLoading(false);
        };

        loadDetail();
    }, [garage, snapTo]);

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 6,
                onPanResponderMove: (_, gesture) => {
                    const base = currentSnap.current === null ? SCREEN_HEIGHT : SCREEN_HEIGHT * (1 - SNAP_POINTS[currentSnap.current]);
                    const next = base + gesture.dy;
                    translateY.setValue(Math.max(0, Math.min(next, SCREEN_HEIGHT)));
                },
                onPanResponderRelease: (_, gesture) => {
                    if (gesture.dy > 80) {
                        onClose();
                        snapTo(null);
                        return;
                    }

                    const positions = SNAP_POINTS.map((p) => SCREEN_HEIGHT * (1 - p));
                    const current = translateY.__getValue();
                    const nearestIndex = positions.reduce((closest, value, index) => {
                        const closestValue = positions[closest];
                        return Math.abs(value - current) < Math.abs(closestValue - current) ? index : closest;
                    }, 0);
                    snapTo(nearestIndex);
                },
            }),
        [onClose, snapTo, translateY]
    );

    const handleStartSession = useCallback(() => {
        if (!garage) {
            return;
        }
        navigation.navigate('SessionTab' as never, {
            screen: 'ActiveSession',
            params: { garageId: garage.id },
        } as never);
        onClose();
        snapTo(null);
    }, [garage, navigation, onClose, snapTo]);

    const handleScanQR = useCallback(() => {
        if (!garage) {
            return;
        }
        navigation.navigate('QRScannerModal' as never, { garageId: garage.id } as never);
        onClose();
        snapTo(null);
    }, [garage, navigation, onClose, snapTo]);

    const statusColor = useMemo(() => {
        const currentStatus = detail?.status ?? garage?.status;
        if (currentStatus === 'full') {
            return theme.colors.error.main;
        }
        if (currentStatus === 'limited') {
            return theme.colors.warning.main;
        }
        return theme.colors.success.main;
    }, [detail?.status, garage?.status, theme.colors.error.main, theme.colors.success.main, theme.colors.warning.main]);

    const content = detail ?? garage;
    const isQREntry = content?.entryMethod === 'QR';

    const policiesLabel = useMemo(() => {
        if (!content?.policies) {
            return null;
        }

        if (typeof content.policies === 'string') {
            return content.policies;
        }

        const segments: string[] = [];
        if (content.policies.prepayRequired) {
            segments.push('Prepayment required');
        }
        if (typeof content.policies.badgeAfterHour === 'number') {
            segments.push(`Badge after ${content.policies.badgeAfterHour}h`);
        }
        if (typeof content.policies.overstayPenalty === 'number') {
            segments.push(`Overstay penalty €${content.policies.overstayPenalty}`);
        }

        return segments.length ? segments.join(' • ') : null;
    }, [content?.policies]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                },
            ]}
            pointerEvents={garage ? 'auto' : 'none'}
        >
            <View style={styles.handleZone} {...panResponder.panHandlers}>
                <View style={styles.handle} />
            </View>
            {garage && (
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.title}>{content?.name ?? 'Garage'}</Text>
                            {content?.address ? <Text style={styles.subtitle}>{content.address}</Text> : null}
                            <View style={styles.metaRow}>
                                <View style={[styles.badge, { backgroundColor: statusColor }]}>
                                    <Text style={styles.badgeText}>{content?.status ?? 'available'}</Text>
                                </View>
                                {distanceLabel ? (
                                    <Text style={styles.metaText}>{distanceLabel}</Text>
                                ) : null}
                                {content?.availableSlots !== undefined && content?.totalSlots !== undefined ? (
                                    <Text style={styles.metaText}>
                                        {content.availableSlots}/{content.totalSlots} slots
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => { onClose(); snapTo(null); }}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color={theme.colors.primary.main} />
                            <Text style={styles.loadingText}>Loading details...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Entry</Text>
                                <Text style={styles.infoValue}>{content?.entryMethod ?? 'ANPR'}</Text>
                            </View>
                            {content?.ratePerHour !== undefined && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Rate</Text>
                                    <Text style={styles.infoValue}>€{content.ratePerHour.toFixed(2)}/hr</Text>
                                </View>
                            )}
                            {content?.evChargers !== undefined && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>EV Chargers</Text>
                                    <Text style={styles.infoValue}>{content.evChargers}</Text>
                                </View>
                            )}
                            {content?.policies ? (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Policy</Text>
                                    <Text style={[styles.infoValue, styles.infoMultiline]} numberOfLines={2}>
                                        {policiesLabel ?? 'See garage rules'}
                                    </Text>
                                </View>
                            ) : null}
                        </>
                    )}

                    <View style={styles.actions}>
                        <NavigateButton
                            destination={{
                                latitude: garage.latitude,
                                longitude: garage.longitude,
                                label: garage.name,
                                address: garage.address,
                            }}
                        />
                        {isQREntry ? (
                            <Button title="Scan QR" onPress={handleScanQR} style={styles.actionSpacing} />
                        ) : (
                            <Button
                                title="Start Session"
                                onPress={handleStartSession}
                                style={styles.actionSpacing}
                            />
                        )}
                    </View>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -2 },
        elevation: 12,
        paddingBottom: 24,
    },
    handleZone: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#CBD4E1',
    },
    content: {
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingBottom: 8,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E3A5F',
    },
    subtitle: {
        fontSize: 13,
        color: '#4B5563',
        marginTop: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 8,
    },
    badgeText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    metaText: {
        fontSize: 12,
        color: '#4B5563',
        marginRight: 8,
    },
    closeText: {
        color: '#1E3A5F',
        fontWeight: '700',
        padding: 4,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#2C3E50',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    infoLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E3A5F',
    },
    infoMultiline: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        paddingTop: 16,
    },
    actionSpacing: {
        marginLeft: 12,
        flex: 1,
    },
});
