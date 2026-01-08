# TASK-045: CI/CD Pipeline Setup

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-045 |
| **Module** | DevOps |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🟢 Completed |

## Description

Set up continuous integration and deployment pipelines using GitHub Actions and Fastlane for automated testing, building, and store deployment.

## Acceptance Criteria

- [x] GitHub Actions workflow for PR checks
- [x] Automated testing on push
- [x] iOS build workflow
- [x] Android build workflow
- [x] TestFlight deployment workflow
- [x] Play Store deployment workflow
- [x] Fastlane configuration
- [x] Secrets management

## Technical Implementation

### GitHub Actions - PR Check

```yaml
# .github/workflows/pr-check.yml
name: PR Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run typecheck

      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
```

### GitHub Actions - Build & Deploy

```yaml
# .github/workflows/build-deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]
  release:
    types: [published]

env:
  NODE_VERSION: '18'
  JAVA_VERSION: '17'
  RUBY_VERSION: '3.0'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --watchAll=false

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
          working-directory: android

      - name: Install dependencies
        run: npm ci

      - name: Decode keystore
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 --decode > android/app/nrjsoft-release.keystore

      - name: Build Android
        working-directory: android
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: bundle exec fastlane build

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: android/app/build/outputs/bundle/release/app-release.aab

  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
          working-directory: ios

      - name: Install dependencies
        run: npm ci

      - name: Install CocoaPods
        working-directory: ios
        run: pod install

      - name: Setup certificates
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_URL: ${{ secrets.MATCH_GIT_URL }}
          MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_BASIC_AUTHORIZATION }}
        working-directory: ios
        run: bundle exec fastlane match appstore --readonly

      - name: Build iOS
        working-directory: ios
        env:
          APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
          APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
        run: bundle exec fastlane build

  deploy-android:
    needs: build-android
    runs-on: ubuntu-latest
    if: github.event_name == 'release'
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/download-artifact@v4
        with:
          name: app-release
          path: android/app/build/outputs/bundle/release/

      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
          working-directory: android

      - name: Decode service account
        run: |
          echo "${{ secrets.PLAY_STORE_JSON_KEY }}" | base64 --decode > android/play-store-key.json

      - name: Deploy to Play Store
        working-directory: android
        run: bundle exec fastlane deploy

  deploy-ios:
    needs: build-ios
    runs-on: macos-latest
    if: github.event_name == 'release'
    steps:
      - uses: actions/checkout@v4

      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
          working-directory: ios

      - name: Deploy to TestFlight
        working-directory: ios
        env:
          APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
          APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
        run: bundle exec fastlane deploy
```

### Fastlane - iOS

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  before_all do
    setup_ci if ENV['CI']
  end

  desc "Build the app"
  lane :build do
    match(type: "appstore", readonly: true)
    
    increment_build_number(
      build_number: ENV['GITHUB_RUN_NUMBER'] || latest_testflight_build_number + 1
    )
    
    build_app(
      workspace: "NRJSoftParking.xcworkspace",
      scheme: "NRJSoftParking",
      export_method: "app-store",
      output_directory: "./build",
      output_name: "NRJSoftParking.ipa"
    )
  end

  desc "Deploy to TestFlight"
  lane :deploy do
    api_key = app_store_connect_api_key(
      key_id: ENV['APP_STORE_CONNECT_API_KEY_ID'],
      issuer_id: ENV['APP_STORE_CONNECT_ISSUER_ID'],
      key_content: ENV['APP_STORE_CONNECT_API_KEY']
    )
    
    upload_to_testflight(
      api_key: api_key,
      skip_waiting_for_build_processing: true
    )
  end

  desc "Deploy to App Store"
  lane :release do
    api_key = app_store_connect_api_key(
      key_id: ENV['APP_STORE_CONNECT_API_KEY_ID'],
      issuer_id: ENV['APP_STORE_CONNECT_ISSUER_ID'],
      key_content: ENV['APP_STORE_CONNECT_API_KEY']
    )
    
    upload_to_app_store(
      api_key: api_key,
      submit_for_review: true,
      automatic_release: false
    )
  end
end
```

### Fastlane - Android

```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Build the app"
  lane :build do
    gradle(
      task: "bundle",
      build_type: "Release",
      properties: {
        "android.injected.signing.store.file" => File.expand_path("../app/nrjsoft-release.keystore"),
        "android.injected.signing.store.password" => ENV['KEYSTORE_PASSWORD'],
        "android.injected.signing.key.alias" => "nrjsoft-key",
        "android.injected.signing.key.password" => ENV['KEY_PASSWORD']
      }
    )
  end

  desc "Deploy to internal track"
  lane :deploy do
    upload_to_play_store(
      track: "internal",
      aab: "app/build/outputs/bundle/release/app-release.aab",
      json_key: "play-store-key.json",
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end

  desc "Promote to production"
  lane :release do
    upload_to_play_store(
      track: "production",
      aab: "app/build/outputs/bundle/release/app-release.aab",
      json_key: "play-store-key.json"
    )
  end
end
```

### Gemfile

```ruby
# ios/Gemfile
source "https://rubygems.org"

gem "fastlane"
gem "cocoapods"

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
```

```ruby
# android/Gemfile
source "https://rubygems.org"

gem "fastlane"
```

### Required GitHub Secrets

| Secret Name | Description |
|-------------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release keystore |
| `KEYSTORE_PASSWORD` | Keystore password |
| `KEY_PASSWORD` | Key alias password |
| `PLAY_STORE_JSON_KEY` | Google Play service account JSON (base64) |
| `APP_STORE_CONNECT_API_KEY_ID` | App Store Connect API Key ID |
| `APP_STORE_CONNECT_ISSUER_ID` | App Store Connect Issuer ID |
| `APP_STORE_CONNECT_API_KEY` | App Store Connect API Key content |
| `MATCH_PASSWORD` | Fastlane Match encryption password |
| `MATCH_GIT_URL` | Git repo URL for Match certificates |
| `MATCH_GIT_BASIC_AUTHORIZATION` | Git auth for Match repo |
| `CODECOV_TOKEN` | Codecov upload token |

### Local Development Scripts

```json
// package.json scripts
{
  "scripts": {
    "build:android": "cd android && ./gradlew assembleRelease",
    "build:android:bundle": "cd android && ./gradlew bundleRelease",
    "build:ios": "cd ios && xcodebuild -workspace NRJSoftParking.xcworkspace -scheme NRJSoftParking -configuration Release -sdk iphoneos archive",
    "fastlane:ios:beta": "cd ios && bundle exec fastlane beta",
    "fastlane:android:beta": "cd android && bundle exec fastlane deploy"
  }
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `.github/workflows/pr-check.yml` | PR validation |
| `.github/workflows/build-deploy.yml` | Build and deploy |
| `ios/fastlane/Fastfile` | iOS automation |
| `ios/fastlane/Matchfile` | Certificate management |
| `ios/Gemfile` | Ruby dependencies |
| `android/fastlane/Fastfile` | Android automation |
| `android/Gemfile` | Ruby dependencies |

## Testing Checklist

- [ ] PR check workflow passes
- [ ] Android build succeeds
- [ ] iOS build succeeds
- [ ] TestFlight upload works
- [ ] Play Store upload works
- [ ] Secrets are properly configured

## Related Tasks

- **Previous**: [TASK-044](task-044.md)
- **Next**: [TASK-040](task-040.md) (Final Go-Live)
