# TASK-056: iOS Deployment Preparation

## Task Overview

| Field | Value |
|-------|-------|
| Task ID | TASK-056 |
| Module | Deployment / iOS |
| Priority | Critical |
| Effort | 8h |
| Dependencies | TASK-040 |
| Status | 🔴 Not Started |

## Description

Complete iOS deployment preparation including certificates, provisioning profiles, App Store Connect setup, and TestFlight configuration. This task ensures the app is ready for App Store submission.

## Acceptance Criteria

- [ ] Apple Developer account configured
- [ ] App ID and bundle identifier registered
- [ ] Distribution certificate created
- [ ] Provisioning profiles configured
- [ ] App Store Connect app listing created
- [ ] TestFlight configured for beta testing
- [ ] App icons and screenshots prepared
- [ ] Privacy policy and terms configured
- [ ] App Store metadata complete

## Prerequisites (macOS Setup)

### 1. Xcode Installation & Configuration

```bash
# Install Xcode from App Store (15.0+)
# Then install command line tools
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept

# Verify installation
xcodebuild -version
# Expected: Xcode 15.x, Build version xxxxx

# Install additional simulators if needed
xcodebuild -downloadPlatform iOS
```

### 2. Apple Developer Account

1. Go to https://developer.apple.com
2. Enroll in Apple Developer Program ($99/year)
3. Wait for enrollment approval (usually 24-48 hours)
4. Enable Two-Factor Authentication on Apple ID

### 3. Ruby & Fastlane Setup

```bash
# Install Ruby via Homebrew (or use system Ruby)
brew install ruby

# Add to PATH in ~/.zshrc
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

# Install Bundler
gem install bundler

# Install Fastlane
gem install fastlane

# Verify
fastlane --version
```

## Technical Implementation

### App Store Connect Setup

```markdown
1. **Create App ID**
   - Go to https://developer.apple.com/account/resources/identifiers
   - Click "+" to register new identifier
   - Select "App IDs" → "App"
   - Bundle ID: `com.nrjsoft.parking`
   - Description: NRJ Parking
   - Enable capabilities:
     - Push Notifications
     - Sign in with Apple
     - Apple Pay
     - Maps

2. **Create Distribution Certificate**
   - Go to Certificates, Identifiers & Profiles
   - Certificates → "+"
   - Select "Apple Distribution"
   - Upload CSR (Certificate Signing Request)
   - Download and install .cer file

3. **Create Provisioning Profile**
   - Go to Profiles → "+"
   - Select "App Store" (Distribution)
   - Select App ID: com.nrjsoft.parking
   - Select Distribution Certificate
   - Name: "NRJ Parking App Store"
   - Download and install

4. **App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - My Apps → "+"
   - Create new iOS app:
     - Name: NRJ Parking
     - Primary Language: English
     - Bundle ID: com.nrjsoft.parking
     - SKU: nrj-parking-ios
```

### Xcode Project Configuration

```ruby
# ios/NRJSoftParking/Info.plist additions

# Bundle Identifier
CFBundleIdentifier = com.nrjsoft.parking

# Version
CFBundleShortVersionString = 1.0.0
CFBundleVersion = 1

# Display Name
CFBundleDisplayName = NRJ Parking

# Required Device Capabilities
UIRequiredDeviceCapabilities:
  - armv7
  - location-services
  
# Supported Orientations
UISupportedInterfaceOrientations:
  - UIInterfaceOrientationPortrait
  
# Privacy Usage Descriptions (REQUIRED)
NSLocationWhenInUseUsageDescription = "NRJ Parking needs your location to find nearby parking garages and on-street zones."
NSLocationAlwaysAndWhenInUseUsageDescription = "NRJ Parking uses your location in the background to track active parking sessions and send reminders."
NSCameraUsageDescription = "NRJ Parking needs camera access to scan QR codes at garage entry points and to scan license plates."
NSFaceIDUsageDescription = "Use Face ID for quick and secure access to your NRJ Parking account."
NSUserTrackingUsageDescription = "This allows NRJ Parking to provide personalized recommendations and improve app experience."

# Background Modes
UIBackgroundModes:
  - location
  - remote-notification
  - fetch

# Deep Linking
CFBundleURLTypes:
  - CFBundleURLSchemes: [nrjparking]
  
LSApplicationQueriesSchemes:
  - comgooglemaps
  - waze
```

### Fastlane Configuration

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Sync certificates and profiles"
  lane :certificates do
    match(
      type: "appstore",
      app_identifier: "com.nrjsoft.parking",
      readonly: is_ci
    )
    match(
      type: "development",
      app_identifier: "com.nrjsoft.parking",
      readonly: is_ci
    )
  end

  desc "Build for TestFlight"
  lane :beta do
    certificates
    
    increment_build_number(
      xcodeproj: "NRJSoftParking.xcodeproj",
      build_number: latest_testflight_build_number + 1
    )
    
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
    
    slack(
      message: "🍎 iOS build uploaded to TestFlight!",
      success: true
    ) if ENV['SLACK_WEBHOOK_URL']
  end

  desc "Submit to App Store"
  lane :release do
    certificates
    
    build_app(
      workspace: "NRJSoftParking.xcworkspace",
      scheme: "NRJSoftParking",
      export_method: "app-store"
    )
    
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: false,
      force: true,
      precheck_include_in_app_purchases: false,
      submission_information: {
        add_id_info_uses_idfa: false,
        add_id_info_serves_ads: false,
        add_id_info_tracks_action: false,
        add_id_info_tracks_install: false,
        export_compliance_uses_encryption: false,
        export_compliance_encryption_updated: false
      }
    )
  end
end
```

### App Store Metadata

```yaml
# ios/fastlane/metadata/en-US/description.txt
NRJ Parking - Smart Parking Made Easy

Find, pay, and manage parking with the NRJ Parking app. Whether you're looking for a garage or on-street parking, we've got you covered.

KEY FEATURES:

🗺 SMART MAP
- Real-time availability of nearby parking garages
- On-street parking zones with live pricing
- Turn-by-turn navigation to your chosen spot

🚗 SEAMLESS ENTRY
- Automatic entry with ANPR (license plate recognition)
- QR code scanning for quick access
- No tickets, no hassle

💳 FLEXIBLE PAYMENTS
- Pay with card, Apple Pay, or NRJ Wallet
- Automatic payment on exit
- Clear pricing with no hidden fees

⏱ LIVE SESSION TRACKING
- Real-time cost tracking
- Balance alerts before wallet runs low
- Extend parking time from your phone

📱 ON-STREET PARKING
- Pre-pay for on-street zones
- Countdown timer with reminders
- Easy extension when you need more time

Download NRJ Parking today and take the stress out of parking!
```

### App Store Screenshots

Required sizes for iPhone:
- 6.7" (1290 x 2796): iPhone 15 Pro Max
- 6.5" (1284 x 2778): iPhone 14 Plus
- 5.5" (1242 x 2208): iPhone 8 Plus

Required sizes for iPad:
- 12.9" (2048 x 2732): iPad Pro

```bash
# Generate screenshots with Fastlane Snapshot
# ios/fastlane/Snapfile
devices([
  "iPhone 15 Pro Max",
  "iPhone 14 Plus",
  "iPhone 8 Plus",
  "iPad Pro (12.9-inch)"
])

languages([
  "en-US",
  "de-DE",
  "bg"
])

scheme("NRJSoftParking")
output_directory("./screenshots")
clear_previous_screenshots(true)
```

### Privacy Policy Requirements

```markdown
Required disclosures for App Store:

1. **Data Collection**
   - Location data (for finding nearby parking)
   - Payment information (for processing payments)
   - Contact info (email, phone for account)
   - Vehicle info (license plates)

2. **Data Usage**
   - App functionality
   - Payment processing
   - Push notifications
   - Analytics (optional)

3. **Data Sharing**
   - Payment processors (Stripe)
   - Analytics providers (Firebase)

4. **Data Retention**
   - Account data: Until account deletion
   - Transaction history: 7 years (legal requirement)
   - Location data: Session duration only
```

## Files to Create/Update

| File | Purpose |
|------|---------|
| ios/NRJSoftParking/Info.plist | App configuration |
| ios/fastlane/Fastfile | Build automation |
| ios/fastlane/Appfile | App metadata |
| ios/fastlane/Matchfile | Certificate sync |
| ios/fastlane/metadata/ | Store listing content |
| PRIVACY_POLICY.md | Privacy policy |

## Pre-Submission Checklist

### Technical
- [ ] App runs on all supported devices
- [ ] All APIs use HTTPS
- [ ] No private API usage
- [ ] IPv6 network support
- [ ] Proper 64-bit support

### Content
- [ ] App icon (1024x1024)
- [ ] Screenshots for all sizes
- [ ] App description complete
- [ ] Keywords optimized
- [ ] Support URL configured
- [ ] Privacy policy URL

### Compliance
- [ ] GDPR consent flows
- [ ] Age rating questionnaire
- [ ] Export compliance
- [ ] Encryption documentation
- [ ] IDFA disclosure

## Testing Checklist

- [ ] Build succeeds on CI
- [ ] App installs via TestFlight
- [ ] Push notifications work
- [ ] Apple Pay works in sandbox
- [ ] Sign in with Apple works
- [ ] Deep links work
- [ ] Background location works

## Related Tasks

- Previous: TASK-040 (App Store Submission)
- Next: TASK-057 (Android Deployment)
