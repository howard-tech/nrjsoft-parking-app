# TASK-040: App Store Submission & Go-Live

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-040 |
| **Module** | Deployment |
| **Priority** | Critical |
| **Estimated Effort** | 8 hours |
| **Dependencies** | All previous tasks |
| **Status** | 🔴 Not Started |

## Description

Prepare and submit the application to Apple App Store and Google Play Store, including all required metadata, screenshots, and compliance documentation.

## Context from Technical Proposal (Pages 30-31)

### Go-Live Support:
- Build signing & store configuration
- Compliance, policies & metadata
- Internal & beta distribution
- App review & publishing
- Post-publish assistance

## Acceptance Criteria

- [ ] Production builds for iOS and Android
- [ ] App Store Connect configuration
- [ ] Google Play Console configuration
- [ ] Store metadata and descriptions
- [ ] Screenshots for all device sizes
- [ ] Privacy policy and data disclosures
- [ ] TestFlight beta distribution
- [ ] Google Play internal testing
- [ ] App review submission
- [ ] Post-launch monitoring setup

## Technical Implementation

### iOS Build Configuration

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number(xcodeproj: "NRJSoftParking.xcodeproj")
    
    build_app(
      workspace: "NRJSoftParking.xcworkspace",
      scheme: "NRJSoftParking",
      export_method: "app-store",
      output_directory: "./build",
      output_name: "NRJSoftParking.ipa"
    )
    
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
  end

  desc "Submit to App Store"
  lane :release do
    build_app(
      workspace: "NRJSoftParking.xcworkspace",
      scheme: "NRJSoftParking",
      export_method: "app-store"
    )
    
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: false,
      force: true,
      precheck_include_in_app_purchases: false
    )
  end
end
```

### Android Build Configuration

```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Build and upload to Play Store internal track"
  lane :beta do
    gradle(
      task: "bundle",
      build_type: "Release",
      project_dir: "android/"
    )
    
    upload_to_play_store(
      track: "internal",
      aab: "android/app/build/outputs/bundle/release/app-release.aab"
    )
  end

  desc "Promote to production"
  lane :release do
    upload_to_play_store(
      track: "production",
      aab: "android/app/build/outputs/bundle/release/app-release.aab"
    )
  end
end
```

### Store Metadata

```yaml
# fastlane/metadata/en-US/description.txt
NRJ Soft Parking - Your Smart Parking Companion

Find and pay for parking with ease. NRJ Soft Parking helps you:

• Discover nearby parking garages with real-time availability
• Navigate directly to available parking spots
• Pay seamlessly with Apple Pay, Google Pay, or saved cards
• Manage on-street parking with prepaid sessions
• Track your parking costs in real-time
• Receive notifications before your parking expires

Features:
- Smart Map with live parking availability
- ANPR and QR code entry support
- Flexible payment options including NRJ Wallet
- On-street parking with countdown timer
- Subscription plans for frequent parkers
- Multi-language support

Download NRJ Soft Parking and never worry about parking again!
```

### App Store Screenshots

```bash
# Screenshot dimensions required:
# iPhone 6.7" (1290 x 2796) - iPhone 14 Pro Max
# iPhone 6.5" (1284 x 2778) - iPhone 14 Plus
# iPhone 5.5" (1242 x 2208) - iPhone 8 Plus
# iPad Pro 12.9" (2048 x 2732)

# Android:
# Phone (1080 x 1920)
# 7" Tablet (1200 x 1920)
# 10" Tablet (1800 x 2560)
```

### Privacy Policy Requirements

```markdown
# Privacy Policy Checklist

- [ ] Data collection disclosure
- [ ] Location data usage
- [ ] Payment information handling
- [ ] Push notification permissions
- [ ] Camera usage (QR scanning)
- [ ] Third-party SDK disclosures
- [ ] Data retention policy
- [ ] User data deletion process (GDPR)
- [ ] Contact information
```

### App Store Review Checklist

```markdown
# iOS App Store Review

## Pre-submission
- [ ] Test on multiple iPhone models
- [ ] Test on iPad if universal
- [ ] Verify all links work
- [ ] Check crash logs are clean
- [ ] Verify in-app purchases (if any)
- [ ] Check permissions requests have descriptions

## Metadata
- [ ] App name (30 characters)
- [ ] Subtitle (30 characters)
- [ ] Keywords (100 characters)
- [ ] Description (4000 characters)
- [ ] What's New (4000 characters)
- [ ] Support URL
- [ ] Marketing URL
- [ ] Privacy Policy URL

## Review Notes
- [ ] Demo account credentials
- [ ] Feature explanations
- [ ] Payment testing instructions
```

### Google Play Review Checklist

```markdown
# Google Play Store Review

## Pre-submission
- [ ] Test on multiple Android devices
- [ ] Test on tablets
- [ ] Verify target API level (33+)
- [ ] Check for ANRs
- [ ] Review crash reports

## Store Listing
- [ ] Title (50 characters)
- [ ] Short description (80 characters)
- [ ] Full description (4000 characters)
- [ ] Category selection
- [ ] Content rating questionnaire
- [ ] Privacy policy

## Data Safety Section
- [ ] Data collection types
- [ ] Data sharing practices
- [ ] Security practices
- [ ] Data deletion policy
```

### Post-Launch Monitoring

```typescript
// src/services/analytics/crashReporting.ts
import crashlytics from '@react-native-firebase/crashlytics';

export const crashReporting = {
  initialize: async () => {
    await crashlytics().setCrashlyticsCollectionEnabled(true);
  },

  setUserId: (userId: string) => {
    crashlytics().setUserId(userId);
  },

  log: (message: string) => {
    crashlytics().log(message);
  },

  recordError: (error: Error, context?: string) => {
    if (context) {
      crashlytics().log(context);
    }
    crashlytics().recordError(error);
  },
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `ios/fastlane/Fastfile` | iOS build automation |
| `android/fastlane/Fastfile` | Android build automation |
| `fastlane/metadata/` | Store listings |
| `docs/PRIVACY_POLICY.md` | Privacy policy |
| `docs/RELEASE_CHECKLIST.md` | Release checklist |

## Deliverables

As per Technical Proposal (Page 31-32):
- [ ] Release Notes & Test Reports
- [ ] User Guide & Configuration Documentation
- [ ] Production-Ready Application Builds (AAB/APK, IPA)
- [ ] Complete Source Code

## Testing Checklist

- [ ] TestFlight build installs and runs
- [ ] Google Play internal build works
- [ ] All features functional in release build
- [ ] Analytics tracking works
- [ ] Crash reporting configured
- [ ] Push notifications work

## Related Tasks

- **Previous**: [TASK-039](task-039.md)
- **Completion**: Project Go-Live 🎉
