# NRJ Parking App - Agent Instructions

## Project Overview
NRJSoft Parking App - React Native mobile application.

**Tech Stack:** React Native 0.73.x, iOS (Xcode 15+), Android (Gradle 8.x, Java 17+)

## Core Commands

### iOS Build
```bash
cd ios && NO_FLIPPER=1 pod install && cd ..
npm start  # Terminal 1
npx react-native run-ios --simulator "iPhone 17 Pro"  # Terminal 2
```

### Android Build
```bash
npm start  # Terminal 1
npx react-native run-android  # Terminal 2
```

### Clean Build iOS
```bash
rm -rf /tmp/NRJSoftParkingDerived
cd ios && rm -rf Pods Podfile.lock && NO_FLIPPER=1 pod install && cd ..
xcodebuild -workspace ios/NRJSoftParking.xcworkspace \
  -scheme NRJSoftParking -configuration Debug \
  -sdk iphonesimulator -arch arm64 \
  -derivedDataPath /tmp/NRJSoftParkingDerived \
  ONLY_ACTIVE_ARCH=YES build
```

## Known Issues

- **FlipperKit Error**: Use `NO_FLIPPER=1 pod install`
- **DB Locked**: `killall xcodebuild && killall Xcode`
- **Arch Mismatch**: Build with `-arch arm64`
- **Pod Hangs**: Wait 5-10 mins or `brew install autoconf automake libtool`
