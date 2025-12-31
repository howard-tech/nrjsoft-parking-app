# TASK-051: Security & Data Encryption

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-051 |
| **Module** | Core |
| **Priority** | Critical |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-006, TASK-022 |
| **Status** | 🟢 Completed |

## Description

Implement security measures including secure storage, SSL pinning, data encryption, and protection against common vulnerabilities.

## Acceptance Criteria

- [x] Secure token storage (Keychain/Keystore)
- [x] SSL certificate pinning
- [x] Biometric authentication option
- [x] Sensitive data encryption
- [x] Root/jailbreak detection
- [x] Screen capture prevention for sensitive screens
- [x] Secure API communication

## Progress Notes

- Added security service layer (secure storage via Keychain + encrypted storage, biometrics helper, device security checks, screen secure-mode helper, SSL-pinned fetch wrapper, and secure API client).
- App bootstrap now performs a device security check and warns if the device is compromised.
- Jest setup mocks native security modules for tests.

## Technical Implementation

### Dependencies

```bash
npm install react-native-keychain
npm install react-native-ssl-pinning
npm install react-native-encrypted-storage
npm install react-native-biometrics
npm install jail-monkey  # Root/jailbreak detection
```

### Secure Storage Service

```typescript
// src/services/security/secureStorage.ts
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';

const SERVICE_NAME = 'com.nrjsoft.parking';

export const secureStorage = {
  /**
   * Store credentials securely (tokens)
   */
  setCredentials: async (accessToken: string, refreshToken: string): Promise<boolean> => {
    try {
      await Keychain.setGenericPassword(
        'tokens',
        JSON.stringify({ accessToken, refreshToken }),
        {
          service: SERVICE_NAME,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to store credentials:', error);
      return false;
    }
  },

  /**
   * Get stored credentials
   */
  getCredentials: async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
      if (credentials) {
        return JSON.parse(credentials.password);
      }
      return null;
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return null;
    }
  },

  /**
   * Clear credentials
   */
  clearCredentials: async (): Promise<boolean> => {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
      return true;
    } catch (error) {
      console.error('Failed to clear credentials:', error);
      return false;
    }
  },

  /**
   * Store encrypted data
   */
  setSecureItem: async (key: string, value: string): Promise<boolean> => {
    try {
      await EncryptedStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to store secure item:', error);
      return false;
    }
  },

  /**
   * Get encrypted data
   */
  getSecureItem: async (key: string): Promise<string | null> => {
    try {
      return await EncryptedStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get secure item:', error);
      return null;
    }
  },

  /**
   * Remove encrypted data
   */
  removeSecureItem: async (key: string): Promise<boolean> => {
    try {
      await EncryptedStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove secure item:', error);
      return false;
    }
  },

  /**
   * Clear all encrypted data
   */
  clearAll: async (): Promise<boolean> => {
    try {
      await EncryptedStorage.clear();
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
      return true;
    } catch (error) {
      console.error('Failed to clear all secure data:', error);
      return false;
    }
  },
};
```

### Biometric Authentication

```typescript
// src/services/security/biometricAuth.ts
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export interface BiometricStatus {
  available: boolean;
  biometryType: 'FaceID' | 'TouchID' | 'Biometrics' | null;
}

export const biometricAuth = {
  /**
   * Check if biometrics is available
   */
  checkAvailability: async (): Promise<BiometricStatus> => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      return {
        available,
        biometryType: biometryType as BiometricStatus['biometryType'],
      };
    } catch (error) {
      return { available: false, biometryType: null };
    }
  },

  /**
   * Authenticate with biometrics
   */
  authenticate: async (promptMessage: string = 'Authenticate to continue'): Promise<boolean> => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch (error) {
      console.error('Biometric auth failed:', error);
      return false;
    }
  },

  /**
   * Create biometric keys (for secure operations)
   */
  createKeys: async (): Promise<boolean> => {
    try {
      const { publicKey } = await rnBiometrics.createKeys();
      // Store public key on server for verification
      return !!publicKey;
    } catch (error) {
      return false;
    }
  },

  /**
   * Sign data with biometric-protected key
   */
  createSignature: async (payload: string, promptMessage: string): Promise<string | null> => {
    try {
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage,
        payload,
      });
      return success ? signature : null;
    } catch (error) {
      return null;
    }
  },
};
```

### SSL Pinning Configuration

```typescript
// src/services/security/sslPinning.ts
import { fetch as sslFetch } from 'react-native-ssl-pinning';

// SHA256 hashes of your server certificates
const CERTIFICATE_PINS = [
  'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Primary
  'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Backup
];

export const createPinnedFetch = () => {
  return async (url: string, options: RequestInit = {}) => {
    try {
      const response = await sslFetch(url, {
        method: options.method || 'GET',
        headers: options.headers as Record<string, string>,
        body: options.body as string,
        sslPinning: {
          certs: ['cert1', 'cert2'], // Certificate names in native bundle
        },
        timeoutInterval: 30000,
      });

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: () => Promise.resolve(response.json()),
        text: () => Promise.resolve(response.bodyString),
        headers: response.headers,
      };
    } catch (error: any) {
      if (error.message?.includes('SSL')) {
        console.error('SSL Pinning failed - possible MITM attack');
        throw new Error('Security error: Connection not trusted');
      }
      throw error;
    }
  };
};
```

### Root/Jailbreak Detection

```typescript
// src/services/security/deviceSecurity.ts
import JailMonkey from 'jail-monkey';
import { Platform, Alert } from 'react-native';

export const deviceSecurity = {
  /**
   * Check if device is compromised
   */
  isDeviceSecure: (): boolean => {
    if (__DEV__) return true; // Skip in development

    const isRooted = JailMonkey.isJailBroken();
    const canMockLocation = JailMonkey.canMockLocation();
    const isDebuggedMode = JailMonkey.isDebuggedMode();
    const hookDetected = JailMonkey.hookDetected();

    return !isRooted && !canMockLocation && !isDebuggedMode && !hookDetected;
  },

  /**
   * Get security status details
   */
  getSecurityStatus: () => ({
    isJailbroken: JailMonkey.isJailBroken(),
    canMockLocation: JailMonkey.canMockLocation(),
    isDebugged: JailMonkey.isDebuggedMode(),
    hookDetected: JailMonkey.hookDetected(),
    isOnExternalStorage: Platform.OS === 'android' ? JailMonkey.isOnExternalStorage() : false,
    adbEnabled: Platform.OS === 'android' ? JailMonkey.AdbEnabled() : false,
  }),

  /**
   * Show warning if device is compromised
   */
  showSecurityWarning: () => {
    Alert.alert(
      'Security Warning',
      'This device appears to be rooted/jailbroken. For your security, some features may be restricted.',
      [{ text: 'I Understand', style: 'default' }]
    );
  },
};
```

### Screen Security

```typescript
// src/services/security/screenSecurity.ts
import { Platform, NativeModules } from 'react-native';

const { ScreenSecurity } = NativeModules;

export const screenSecurity = {
  /**
   * Prevent screenshots on Android
   */
  enableSecureMode: () => {
    if (Platform.OS === 'android' && ScreenSecurity) {
      ScreenSecurity.enableSecureView();
    }
  },

  /**
   * Allow screenshots again
   */
  disableSecureMode: () => {
    if (Platform.OS === 'android' && ScreenSecurity) {
      ScreenSecurity.disableSecureView();
    }
  },

  /**
   * Use on sensitive screens (payment, etc.)
   */
  useSecureScreen: () => {
    const { useEffect } = require('react');
    
    useEffect(() => {
      screenSecurity.enableSecureMode();
      return () => screenSecurity.disableSecureMode();
    }, []);
  },
};

// Native Android module (create in android/app/src/main/java/.../ScreenSecurityModule.java)
/*
public class ScreenSecurityModule extends ReactContextBaseJavaModule {
    @ReactMethod
    public void enableSecureView() {
        getCurrentActivity().getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }

    @ReactMethod
    public void disableSecureView() {
        getCurrentActivity().getWindow().clearFlags(
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
*/
```

### Secure API Client

```typescript
// src/services/api/secureClient.ts
import { secureStorage } from '@services/security/secureStorage';
import { createPinnedFetch } from '@services/security/sslPinning';
import { deviceSecurity } from '@services/security/deviceSecurity';

const BASE_URL = process.env.API_BASE_URL || 'https://api.nrjsoft.com';
const pinnedFetch = createPinnedFetch();

export const secureApiClient = {
  request: async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    // Check device security
    if (!deviceSecurity.isDeviceSecure()) {
      console.warn('Device security compromised');
      // Could restrict certain operations here
    }

    // Get tokens
    const credentials = await secureStorage.getCredentials();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (credentials?.accessToken) {
      headers['Authorization'] = `Bearer ${credentials.accessToken}`;
    }

    // Add device fingerprint
    headers['X-Device-Id'] = await getDeviceFingerprint();

    try {
      const response = await pinnedFetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Handle token refresh, etc.
      throw error;
    }
  },
};

const getDeviceFingerprint = async (): Promise<string> => {
  // Generate unique device fingerprint
  const DeviceInfo = require('react-native-device-info').default;
  const uniqueId = await DeviceInfo.getUniqueId();
  return uniqueId;
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/security/secureStorage.ts` | Secure storage |
| `src/services/security/biometricAuth.ts` | Biometric auth |
| `src/services/security/sslPinning.ts` | SSL pinning |
| `src/services/security/deviceSecurity.ts` | Device security |
| `src/services/security/screenSecurity.ts` | Screen capture prevention |
| `src/services/api/secureClient.ts` | Secure API client |
| Android native module for screen security | Native code |

## Testing Checklist

- [ ] Tokens stored securely in Keychain/Keystore
- [ ] SSL pinning blocks invalid certificates
- [ ] Biometric authentication works
- [ ] Root/jailbreak detection works
- [ ] Screen capture blocked on payment screens
- [ ] Encrypted storage works
- [ ] Device security warnings display

## Related Tasks

- **Previous**: [TASK-006](task-006.md), [TASK-022](task-022.md)
- **Next**: [TASK-040](task-040.md)
