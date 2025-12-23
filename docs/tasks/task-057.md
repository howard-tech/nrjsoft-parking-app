# TASK-057: Android Deployment Preparation

## Task Overview

| Field | Value |
|-------|-------|
| Task ID | TASK-057 |
| Module | Deployment / Android |
| Priority | Critical |
| Effort | 8h |
| Dependencies | TASK-040 |
| Status | 🔴 Not Started |

## Description

Complete Android deployment preparation including signing keys, Google Play Console setup, and store listing configuration.

## Acceptance Criteria

- [ ] Google Play Developer account configured
- [ ] Release keystore created and secured
- [ ] App signing configured in Play Console
- [ ] Internal testing track setup
- [ ] Store listing complete
- [ ] Screenshots and graphics prepared
- [ ] Privacy policy configured

## Prerequisites (macOS Setup)

### Android Studio

```bash
brew install --cask android-studio

# Configure SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### JDK 17

```bash
brew install openjdk@17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

## Technical Implementation

### Release Keystore

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/nrjsoft-release.keystore \
  -alias nrjsoft-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Gradle Configuration

```gradle
// android/app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file('nrjsoft-release.keystore')
            storePassword System.getenv('KEYSTORE_PASSWORD')
            keyAlias 'nrjsoft-key'
            keyPassword System.getenv('KEY_PASSWORD')
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
        }
    }
}
```

### Fastlane

```ruby
# android/fastlane/Fastfile
platform :android do
  lane :internal do
    gradle(task: "bundleRelease")
    upload_to_play_store(track: "internal")
  end
  
  lane :release do
    gradle(task: "bundleRelease")
    upload_to_play_store(track: "production", rollout: "0.1")
  end
end
```

## Play Store Requirements

- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: 1080x1920 (min 2)
- Privacy policy URL
- Content rating questionnaire

## Testing Checklist

- [ ] AAB builds successfully
- [ ] Installs from Play Store internal track
- [ ] Google Pay works in test mode
- [ ] Push notifications work

## Related Tasks

- Previous: TASK-056 (iOS Deployment)
