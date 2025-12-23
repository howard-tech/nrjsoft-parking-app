# TASK-015: QR Scanner Modal

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-015 |
| **Module** | Parking Entry |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-003 |
| **Status** | 🔴 Not Started |

## Description

Implement the QR code scanner modal for garages that require QR-based entry. Users scan the QR code displayed at the garage entry kiosk to start their parking session.

## Context from Technical Proposal (Page 7)

- QR codes support deep linking
- Scanner screen shows garage name and address
- Camera viewfinder with alignment frame
- Manual fallback option to paste QR data
- "QR accepted. Starting session..." confirmation

## Acceptance Criteria

- [ ] Camera permission request
- [ ] QR code scanning with viewfinder
- [ ] Alignment frame overlay
- [ ] Garage info header
- [ ] Manual QR data input fallback
- [ ] Success state with animation
- [ ] Error handling for invalid QR
- [ ] Session start on valid scan
- [ ] Close/cancel functionality

## Technical Implementation

### 1. QR Scanner Modal

```typescript
// src/screens/parking/QRScannerModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@theme';
import { parkingService } from '@services/api/parkingService';

// Components
import { Button } from '@components/common/Button';
import { CloseIcon, CheckCircleIcon } from '@components/icons';

interface RouteParams {
  garageId: string;
  garageName: string;
  garageAddress?: string;
}

export const QRScannerModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { garageId, garageName, garageAddress } = route.params as RouteParams;
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const device = useCameraDevice('back');
  
  // Success animation
  const successScale = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'granted');
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && !isProcessing && !scannedData) {
        const qrData = codes[0].value;
        if (qrData) {
          handleQRScanned(qrData);
        }
      }
    },
  });

  const handleQRScanned = async (data: string) => {
    setScannedData(data);
    setIsProcessing(true);
    setError(null);

    try {
      // Validate QR and start session
      const session = await parkingService.startSessionWithQR(garageId, data);
      
      // Show success animation
      setScanSuccess(true);
      Animated.spring(successScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();

      // Navigate to active session after delay
      setTimeout(() => {
        navigation.replace('SessionTab', {
          screen: 'ActiveSession',
          params: { sessionId: session.id },
        });
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Invalid QR code. Please try again.');
      setScannedData(null);
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleQRScanned(manualInput.trim());
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
        <Text style={styles.permissionText}>Camera permission is required to scan QR codes.</Text>
        <Button title="Grant Permission" onPress={checkPermission} />
        <Button title="Cancel" variant="secondary" onPress={handleClose} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.neutral.surface }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>
              SCAN QR
            </Text>
            <Text style={[styles.garageName, { color: theme.colors.neutral.textPrimary }]}>
              {garageName}
            </Text>
            {garageAddress && (
              <Text style={[styles.garageAddress, { color: theme.colors.neutral.textSecondary }]}>
                {garageAddress}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: theme.colors.error.main }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera View */}
      {device && !scanSuccess && (
        <View style={styles.cameraContainer}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={!isProcessing}
            codeScanner={codeScanner}
          />
          
          {/* Viewfinder Overlay */}
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom}>
              <Text style={styles.instruction}>
                Align the QR frame with the code near the entry kiosk.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Success State */}
      {scanSuccess && (
        <View style={styles.successContainer}>
          <Animated.View style={{ transform: [{ scale: successScale }] }}>
            <CheckCircleIcon color={theme.colors.success.main} size={80} />
          </Animated.View>
          <Text style={[styles.successText, { color: theme.colors.success.main }]}>
            QR accepted. Starting session...
          </Text>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: theme.colors.error.light }]}>
          <Text style={[styles.errorText, { color: theme.colors.error.main }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Manual Fallback */}
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
                }
              ]}
              placeholder="Paste scanned QR data"
              placeholderTextColor={theme.colors.neutral.textSecondary}
              value={manualInput}
              onChangeText={setManualInput}
              editable={!isProcessing}
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
              title="Scan QR"
              variant="primary"
              onPress={handleManualSubmit}
              style={styles.button}
              loading={isProcessing}
              disabled={!manualInput.trim()}
            />
          </View>
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
    paddingTop: 60,
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
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  viewfinder: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 20,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  errorBanner: {
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  manualSection: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  manualLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  manualInputRow: {
    marginBottom: 16,
  },
  manualInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/parking/QRScannerModal.tsx` | QR scanner screen |
| `src/screens/parking/components/ViewfinderOverlay.tsx` | Camera overlay |

## Dependencies

```bash
npm install react-native-vision-camera
cd ios && pod install
```

## Testing Checklist

- [ ] Camera permission request works
- [ ] QR codes scan correctly
- [ ] Viewfinder aligns properly
- [ ] Success animation plays
- [ ] Manual input fallback works
- [ ] Invalid QR shows error
- [ ] Close button works
- [ ] Session starts on valid scan

## Related Tasks

- **Previous**: [TASK-014](task-014.md) - Search & Filters
- **Next**: [TASK-016](task-016.md) - Session Service
