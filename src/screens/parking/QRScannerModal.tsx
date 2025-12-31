import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useTheme } from '@theme';
import { Button } from '@components/common/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { parkingService } from '@services/parking/parkingService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ViewfinderOverlay } from './components/ViewfinderOverlay';

type Props = NativeStackScreenProps<RootStackParamList, 'QRScannerModal'>;

export const QRScannerModal: React.FC<Props> = ({ navigation, route }) => {
    const theme = useTheme();
    const { garageId, garageName, garageAddress } = route.params;
    const device = useCameraDevice('back');

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [manualInput, setManualInput] = useState('');
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const successScale = useRef(new Animated.Value(0)).current;

    const checkPermission = useCallback(async () => {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'granted');
    }, []);

    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    const startSuccessAnimation = useCallback(() => {
        Animated.spring(successScale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
    }, [successScale]);

    const handleStartSession = useCallback(
        async (qrPayload: string) => {
            setIsProcessing(true);
            setError(null);
            setScannedData(qrPayload);

            try {
                const session = await parkingService.startSessionWithQR(garageId, qrPayload);
                setScanSuccess(true);
                startSuccessAnimation();

                setTimeout(() => {
                    navigation.replace('Main', {
                        screen: 'SessionTab',
                        params: { screen: 'ActiveSession', params: { sessionId: session.id } },
                    });
                }, 1400);
            } catch (err) {
                console.warn('QR scan failed', err);
                setError('Invalid or expired QR code. Please try again.');
                setScannedData(null);
                setIsProcessing(false);
            }
        },
        [garageId, navigation, startSuccessAnimation]
    );

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            if (codes.length === 0 || isProcessing || scannedData || scanSuccess) {
                return;
            }
            const qrValue = codes[0]?.value;
            if (qrValue) {
                handleStartSession(qrValue);
            }
        },
    });

    const handleManualSubmit = useCallback(() => {
        if (manualInput.trim() && !isProcessing) {
            handleStartSession(manualInput.trim());
        }
    }, [handleStartSession, isProcessing, manualInput]);

    const handleClose = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const Header = useMemo(
        () => (
            <View style={[styles.header, { backgroundColor: theme.colors.neutral.surface }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>
                            Scan QR to enter
                        </Text>
                        {garageName ? (
                            <Text style={[styles.garageName, { color: theme.colors.neutral.textPrimary }]}>
                                {garageName}
                            </Text>
                        ) : null}
                        {garageAddress ? (
                            <Text style={[styles.garageAddress, { color: theme.colors.neutral.textSecondary }]}>
                                {garageAddress}
                            </Text>
                        ) : null}
                    </View>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Icon name="close" size={22} color={theme.colors.error.main} />
                    </TouchableOpacity>
                </View>
            </View>
        ),
        [garageAddress, garageName, handleClose, theme.colors.error.main, theme.colors.neutral.surface, theme.colors.neutral.textPrimary, theme.colors.neutral.textSecondary]
    );

    if (hasPermission === null) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
                <ActivityIndicator color={theme.colors.primary.main} />
                <Text style={styles.statusText}>Requesting camera permission…</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
                {Header}
                <View style={styles.permissionBox}>
                    <Icon name="camera-off" size={42} color={theme.colors.error.main} />
                    <Text style={[styles.permissionText, { color: theme.colors.neutral.textPrimary }]}>
                        Camera access is required to scan the QR code.
                    </Text>
                    <Button title="Grant permission" onPress={checkPermission} />
                    <Button title="Cancel" variant="secondary" onPress={handleClose} style={styles.permissionCancel} />
                </View>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
                {Header}
                <View style={styles.permissionBox}>
                    <Text style={[styles.permissionText, { color: theme.colors.neutral.textPrimary }]}>
                        No camera device available.
                    </Text>
                    <Button title="Close" variant="secondary" onPress={handleClose} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {Header}
            <View style={styles.cameraContainer}>
                {!scanSuccess ? (
                    <>
                        <Camera
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={!isProcessing}
                            codeScanner={codeScanner}
                        />
                        <ViewfinderOverlay />
                    </>
                ) : (
                    <View style={styles.successContainer}>
                        <Animated.View style={{ transform: [{ scale: successScale }] }}>
                            <Icon name="check-circle" size={84} color={theme.colors.success.main} />
                        </Animated.View>
                        <Text style={[styles.successText, { color: theme.colors.success.main }]}>
                            QR accepted. Starting session...
                        </Text>
                    </View>
                )}
                {error ? (
                    <View style={[styles.errorBanner, { backgroundColor: theme.colors.error.light }]}>
                        <Text style={[styles.errorText, { color: theme.colors.error.main }]}>{error}</Text>
                    </View>
                ) : null}
            </View>

            {!scanSuccess && (
                <View style={[styles.manualSection, { backgroundColor: theme.colors.neutral.surface }]}>
                    <Text style={[styles.manualLabel, { color: theme.colors.neutral.textSecondary }]}>
                        Manual fallback
                    </Text>
                    <View style={styles.manualInputRow}>
                        <TextInput
                            style={[
                                styles.manualInput,
                                {
                                    backgroundColor: theme.colors.neutral.background,
                                    color: theme.colors.neutral.textPrimary,
                                    borderColor: theme.colors.neutral.border,
                                },
                            ]}
                            placeholder="Paste QR data"
                            placeholderTextColor={theme.colors.neutral.textSecondary}
                            value={manualInput}
                            onChangeText={setManualInput}
                            editable={!isProcessing}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            title="Cancel"
                            variant="secondary"
                            onPress={handleClose}
                            style={styles.button}
                            disabled={isProcessing}
                        />
                        <Button
                            title="Submit"
                            variant="primary"
                            onPress={handleManualSubmit}
                            style={styles.button}
                            loading={isProcessing}
                            disabled={!manualInput.trim() || isProcessing}
                        />
                    </View>
                    {Platform.OS === 'android' && (
                        <Text style={[styles.hintText, { color: theme.colors.neutral.textSecondary }]}>
                            Tip: increase brightness for faster scans.
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
    },
    garageName: {
        fontSize: 20,
        fontWeight: '700',
    },
    garageAddress: {
        fontSize: 14,
        marginTop: 2,
    },
    closeButton: {
        padding: 8,
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successText: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
    },
    errorBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '600',
    },
    manualSection: {
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    manualLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    manualInputRow: {
        marginBottom: 12,
    },
    manualInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    buttonRow: {
        flexDirection: 'row',
        columnGap: 12,
    },
    button: {
        flex: 1,
    },
    permissionBox: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    permissionText: {
        fontSize: 14,
        textAlign: 'center',
    },
    permissionCancel: {
        marginTop: 8,
    },
    statusText: {
        marginTop: 12,
        color: '#2C3E50',
    },
    hintText: {
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
});
