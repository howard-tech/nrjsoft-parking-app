module.exports = {
    testRunner: {
        args: {
            $0: 'jest',
            config: 'detox.jest.config.js',
        },
        jest: {
            setupTimeout: 120000,
        },
    },
    apps: {
        'ios.sim.release': {
            type: 'ios.app',
            binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/NRJSoftParking.app',
            build:
                'xcodebuild -workspace ios/NRJSoftParking.xcworkspace -scheme NRJSoftParking -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
        },
        'android.emu.release': {
            type: 'android.apk',
            binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
            testBinaryPath:
                'android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',
            build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
            reversePorts: [8081],
        },
    },
    devices: {
        simulator: {
            type: 'ios.simulator',
            device: { type: 'iPhone 14' },
        },
        emulator: {
            type: 'android.emulator',
            device: { avdName: 'Pixel_4_API_30' },
        },
    },
    configurations: {
        'ios.sim.release': {
            device: 'simulator',
            app: 'ios.sim.release',
        },
        'android.emu.release': {
            device: 'emulator',
            app: 'android.emu.release',
        },
    },
};
