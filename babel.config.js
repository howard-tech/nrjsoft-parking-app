module.exports = {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
        [
            'module-resolver',
            {
                root: ['./src'],
                extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                alias: {
                    '@components': './src/components',
                    '@screens': './src/screens',
                    '@navigation': './src/navigation',
                    '@services': './src/services',
                    '@store': './src/store',
                    '@hooks': './src/hooks',
                    '@utils': './src/utils',
                    '@theme': './src/theme',
                    '@localization': './src/localization',
                    '@constants': './src/constants',
                    '@types': './src/types',
                },
            },
        ],
        'react-native-reanimated/plugin',
    ],
};
