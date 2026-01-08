# TASK-047: OCR License Plate Scanning

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-047 |
| **Module** | Account |
| **Priority** | Medium |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-031 |
| **Status** | 🟢 Completed |

## Description

Implement OCR-based license plate scanning to simplify vehicle registration.

## Context from Technical Proposal (Page 17-18)

- "OCR-based plate scanning simplifies vehicle registration"
- "Scan plate (OCR)" button in Vehicle Management screen

## Acceptance Criteria

- [ ] Camera permission handling
- [ ] License plate scanner modal
- [ ] Real-time OCR detection
- [ ] Auto-populate plate number field
- [ ] Country code detection (EU plates)
- [ ] Manual fallback input
- [ ] Validation of detected plates

## Technical Implementation

### Dependencies

```bash
npm install react-native-vision-camera
npm install react-native-text-recognition
# or use ML Kit directly
npm install @react-native-ml-kit/text-recognition
```

### Camera Permissions

```typescript
// src/hooks/useCameraPermission.ts
import { useState, useEffect } from 'react';
import { Camera } from 'react-native-vision-camera';
import { Alert, Linking, Platform } from 'react-native';

export const useCameraPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    setIsChecking(true);
    const status = await Camera.getCameraPermissionStatus();
    setHasPermission(status === 'granted');
    setIsChecking(false);
  };

  const requestPermission = async () => {
    const status = await Camera.requestCameraPermission();
    
    if (status === 'denied') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in Settings to scan license plates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
    
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  return { hasPermission, isChecking, requestPermission, checkPermission };
};
```

### License Plate Scanner

```typescript
// src/components/vehicles/LicensePlateScanner.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useTheme } from '@theme';
import { useCameraPermission } from '@hooks/useCameraPermission';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LicensePlateScannerProps {
  visible: boolean;
  onClose: () => void;
  onPlateDetected: (plate: string, countryCode?: string) => void;
}

// EU license plate regex patterns
const PLATE_PATTERNS = {
  EU: /^[A-Z]{1,3}[-\s]?[A-Z0-9]{1,4}[-\s]?[A-Z0-9]{1,4}$/i,
  DE: /^[A-ZÄÖÜ]{1,3}[-\s]?[A-Z]{1,2}[-\s]?\d{1,4}[EH]?$/i,
  BG: /^[АВЕКМНОРСТУХ]{1,2}[-\s]?\d{4}[-\s]?[АВЕКМНОРСТУХ]{2}$/i,
  // Add more country patterns as needed
};

export const LicensePlateScanner: React.FC<LicensePlateScannerProps> = ({
  visible,
  onClose,
  onPlateDetected,
}) => {
  const theme = useTheme();
  const { hasPermission, requestPermission, isChecking } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedPlate, setDetectedPlate] = useState<string | null>(null);
  const [lastProcessTime, setLastProcessTime] = useState(0);

  const processFrame = useCallback(async (frame: any) => {
    // Throttle processing to every 500ms
    const now = Date.now();
    if (now - lastProcessTime < 500 || isProcessing) return;
    
    setLastProcessTime(now);
    setIsProcessing(true);

    try {
      const result = await TextRecognition.recognize(frame);
      
      for (const block of result.blocks) {
        const text = block.text.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Check against patterns
        for (const [country, pattern] of Object.entries(PLATE_PATTERNS)) {
          if (pattern.test(block.text)) {
            setDetectedPlate(block.text);
            return;
          }
        }
        
        // Generic plate detection (alphanumeric, 5-10 chars)
        if (text.length >= 5 && text.length <= 10 && /^[A-Z0-9]+$/.test(text)) {
          setDetectedPlate(text);
          return;
        }
      }
    } catch (error) {
      console.error('OCR Error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [lastProcessTime, isProcessing]);

  const handleCapture = async () => {
    if (!camera.current) return;
    
    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
      });
      
      const result = await TextRecognition.recognize(photo.path);
      
      // Find best plate match
      for (const block of result.blocks) {
        const cleanText = block.text.toUpperCase().trim();
        if (cleanText.length >= 4 && cleanText.length <= 12) {
          // Detect country code from plate format
          let countryCode = 'EU';
          if (PLATE_PATTERNS.DE.test(cleanText)) countryCode = 'DE';
          if (PLATE_PATTERNS.BG.test(cleanText)) countryCode = 'BG';
          
          onPlateDetected(cleanText, countryCode);
          onClose();
          return;
        }
      }
      
      // If no valid plate found
      Alert.alert(
        'No Plate Detected',
        'Could not detect a license plate. Please try again or enter manually.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Capture error:', error);
    }
  };

  const handleConfirmDetected = () => {
    if (detectedPlate) {
      onPlateDetected(detectedPlate);
      onClose();
    }
  };

  if (!visible) return null;

  if (isChecking) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Checking camera permission...</Text>
        </View>
      </Modal>
    );
  }

  if (!hasPermission) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={64} color={theme.colors.neutral.textSecondary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To scan your license plate, please allow camera access.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.colors.primary.main }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelButtonText, { color: theme.colors.neutral.textSecondary }]}>
              Enter Manually
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (!device) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.errorContainer}>
          <Text>No camera device found</Text>
          <TouchableOpacity onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={visible}
          photo={true}
        />

        {/* Overlay with cutout */}
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Scan License Plate</Text>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.hint}>
              Position the license plate within the frame
            </Text>
          </View>

          {detectedPlate && (
            <View style={styles.detectedContainer}>
              <Text style={styles.detectedLabel}>Detected:</Text>
              <Text style={styles.detectedPlate}>{detectedPlate}</Text>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.colors.success.main }]}
                onPress={handleConfirmDetected}
              >
                <Text style={styles.confirmButtonText}>Use This Plate</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const SCAN_WIDTH = width * 0.85;
const SCAN_HEIGHT = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  scanArea: {
    alignItems: 'center',
  },
  scanFrame: {
    width: SCAN_WIDTH,
    height: SCAN_HEIGHT,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  hint: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 14,
  },
  detectedContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detectedLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  detectedPlate: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 8,
    letterSpacing: 2,
  },
  confirmButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    textAlign: 'center',
    color: '#666666',
    marginBottom: 24,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/vehicles/LicensePlateScanner.tsx` | Scanner component |
| `src/hooks/useCameraPermission.ts` | Permission hook |
| Update `src/screens/account/VehicleManagementScreen.tsx` | Add scan button |

## Testing Checklist

- [ ] Camera permission request works
- [ ] Scanner modal opens correctly
- [ ] OCR detects plates in good lighting
- [ ] Manual capture works
- [ ] Detected plate auto-fills form
- [ ] Close button works
- [ ] Permission denied handling

## Related Tasks

- **Previous**: [TASK-031](task-031.md)
- **Next**: [TASK-048](task-048.md)
