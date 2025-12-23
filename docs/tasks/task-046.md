# TASK-046: Social Login (Google & Apple Sign-in)

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-046 |
| **Module** | Authentication |
| **Priority** | High |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-005, TASK-006 |
| **Status** | 🔴 Not Started |

## Description

Implement social login options for faster authentication using Google Sign-In and Apple Sign-In.

## Context from Technical Proposal (Page 5-6)

- Social Login: Google/Apple Sign-in (for speed)
- "Continue with Google" and "Continue with Apple" buttons

## Acceptance Criteria

- [ ] Google Sign-In button on auth screen
- [ ] Apple Sign-In button on auth screen
- [ ] Google OAuth flow implementation
- [ ] Apple OAuth flow implementation
- [ ] Link social accounts to existing users
- [ ] Handle first-time social sign-up
- [ ] Proper error handling

## Technical Implementation

### Dependencies

```bash
# Google Sign-In
npm install @react-native-google-signin/google-signin

# Apple Sign-In
npm install @invertase/react-native-apple-authentication
```

### iOS Configuration

```xml
<!-- ios/NRJSoftParking/Info.plist -->
<!-- Google Sign-In -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    </array>
  </dict>
</array>

<!-- Apple Sign-In - Add capability in Xcode -->
```

### Android Configuration

```xml
<!-- android/app/src/main/res/values/strings.xml -->
<string name="default_web_client_id">YOUR_WEB_CLIENT_ID.apps.googleusercontent.com</string>
```

### Google Sign-In Service

```typescript
// src/services/auth/googleAuth.ts
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { authService } from './authService';

export const googleAuthService = {
  configure: () => {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  },

  signIn: async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Send to backend for verification
      const response = await authService.socialLogin({
        provider: 'google',
        idToken: userInfo.idToken,
        email: userInfo.user.email,
        name: userInfo.user.name,
        photo: userInfo.user.photo,
      });

      return response;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('User cancelled sign in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Play services not available');
      }
      throw error;
    }
  },

  signOut: async () => {
    await GoogleSignin.signOut();
  },

  isSignedIn: async () => {
    return await GoogleSignin.isSignedIn();
  },
};
```

### Apple Sign-In Service

```typescript
// src/services/auth/appleAuth.ts
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { authService } from './authService';

export const appleAuthService = {
  isSupported: () => {
    return appleAuth.isSupported;
  },

  signIn: async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );

      if (credentialState === appleAuth.State.AUTHORIZED) {
        // Send to backend
        const response = await authService.socialLogin({
          provider: 'apple',
          idToken: appleAuthRequestResponse.identityToken,
          authorizationCode: appleAuthRequestResponse.authorizationCode,
          email: appleAuthRequestResponse.email,
          fullName: appleAuthRequestResponse.fullName,
          user: appleAuthRequestResponse.user,
        });

        return response;
      }

      throw new Error('Apple authentication failed');
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
        throw new Error('User cancelled sign in');
      }
      throw error;
    }
  },

  signOut: async () => {
    // Apple doesn't have a sign out method
    // Clear local tokens instead
  },
};
```

### Social Login Buttons Component

```typescript
// src/components/auth/SocialLoginButtons.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useTheme } from '@theme';
import { googleAuthService } from '@services/auth/googleAuth';
import { appleAuthService } from '@services/auth/appleAuth';
import { useAppDispatch } from '@store/hooks';
import { setCredentials } from '@store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SocialLoginButtonsProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSuccess,
  onError,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      const response = await googleAuthService.signIn();
      dispatch(setCredentials({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      }));
      onSuccess();
    } catch (error: any) {
      onError(error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    if (!appleAuthService.isSupported()) {
      onError('Apple Sign-In is not supported on this device');
      return;
    }

    setLoading('apple');
    try {
      const response = await appleAuthService.signIn();
      dispatch(setCredentials({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      }));
      onSuccess();
    } catch (error: any) {
      onError(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleSignIn}
        disabled={loading !== null}
      >
        <Icon name="google" size={20} color="#000000" />
        <Text style={styles.googleText}>
          {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={handleAppleSignIn}
          disabled={loading !== null}
        >
          <Icon name="apple" size={20} color="#FFFFFF" />
          <Text style={styles.appleText}>
            {loading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginVertical: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  googleText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
```

### Backend API

```typescript
// Auth Service update
export const authService = {
  // ... existing methods

  socialLogin: async (data: {
    provider: 'google' | 'apple';
    idToken: string | null;
    email: string | null;
    name?: string | null;
    [key: string]: any;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/social', data);
    return response.data;
  },
};
```

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/services/auth/googleAuth.ts` | Google Sign-In service |
| `src/services/auth/appleAuth.ts` | Apple Sign-In service |
| `src/components/auth/SocialLoginButtons.tsx` | UI component |
| `src/screens/auth/AuthScreen.tsx` | Update to include social buttons |
| `ios/NRJSoftParking/Info.plist` | iOS configuration |
| `android/app/build.gradle` | Android configuration |

## Testing Checklist

- [ ] Google Sign-In works on Android
- [ ] Google Sign-In works on iOS
- [ ] Apple Sign-In works on iOS
- [ ] Error handling for cancelled sign-in
- [ ] Error handling for network issues
- [ ] New user registration via social
- [ ] Existing user login via social
- [ ] Token storage after social login

## Related Tasks

- **Previous**: [TASK-005](task-005.md), [TASK-006](task-006.md)
- **Next**: [TASK-047](task-047.md)
