import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@theme';
import { AppHeader } from '@components/common/AppHeader';
import { useNavigation } from '@react-navigation/native';

const extractPlateCandidate = (text: string): string | null => {
    const upper = text.toUpperCase();
    const matches = upper.match(/[A-Z0-9]{5,10}/g);
    if (!matches || matches.length === 0) return null;
    const sorted = matches.sort((a, b) => b.length - a.length);
    return sorted[0];
};

export const LicensePlateScannerScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const device = useCameraDevice('back');
    const cameraRef = useRef<Camera | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [processing, setProcessing] = useState(false);

    const checkPermission = useCallback(async () => {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'granted');
    }, []);

    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    const handleCapture = useCallback(async () => {
        if (!cameraRef.current || processing) return;
        setProcessing(true);
        try {
            const photo = await cameraRef.current.takePhoto({ flash: 'off' });
            const result = await TextRecognition.recognize(photo.path);
            const candidate = extractPlateCandidate(result.text);
            if (!candidate) {
                Alert.alert('No plate found', 'Try again with a clearer image.');
                setProcessing(false);
                return;
            }
            navigation.navigate('AddVehicle' as never, { scannedPlate: candidate } as never);
        } catch (err) {
            console.warn('Failed to recognize plate', err);
            Alert.alert('Error', 'Unable to scan plate. Please try again.');
        } finally {
            setProcessing(false);
        }
    }, [navigation, processing]);

    const header = useMemo(() => <AppHeader title="Scan Plate" showBack />, []);

    if (hasPermission === null) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.neutral.background }]}>
                {header}
                <ActivityIndicator color={theme.colors.primary.main} />
                <Text style={[styles.statusText, { color: theme.colors.neutral.textSecondary }]}>
                    Requesting camera permission…
                </Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.neutral.background }]}>
                {header}
                <Text style={[styles.statusText, { color: theme.colors.neutral.textSecondary }]}>
                    Camera access is required to scan plates.
                </Text>
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.colors.primary.main }]}
                    onPress={checkPermission}
                    accessibilityRole="button"
                    accessibilityLabel="Grant camera permission"
                >
                    <Text style={styles.primaryButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.neutral.background }]}>
                {header}
                <Text style={[styles.statusText, { color: theme.colors.neutral.textSecondary }]}>
                    No camera device available.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {header}
            <View style={styles.cameraContainer}>
                <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={!processing} photo />
                <View style={styles.overlay}>
                    <Text style={styles.overlayText}>Align plate within frame</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.captureButton, { backgroundColor: theme.colors.primary.main }]}
                    onPress={handleCapture}
                    disabled={processing}
                    accessibilityRole="button"
                    accessibilityLabel="Capture plate"
                >
                    {processing ? (
                        <ActivityIndicator color={theme.colors.neutral.white} />
                    ) : (
                        <Icon name="camera" size={26} color={theme.colors.neutral.white} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    cameraContainer: { flex: 1 },
    overlay: {
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    overlayText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    footer: {
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#000',
    },
    captureButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    statusText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
    primaryButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    primaryButtonText: { color: '#FFF', fontWeight: '700' },
});

export default LicensePlateScannerScreen;
