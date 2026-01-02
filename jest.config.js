module.exports = {
    preset: 'react-native',
    passWithNoTests: true,
    setupFilesAfterEnv: ['./jest.setup.js'],
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|@reduxjs/toolkit|immer|react-redux)/)',
    ],
};
