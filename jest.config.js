module.exports = {
    preset: 'react-native',
    passWithNoTests: true,
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jest.setup.js'],
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|@reduxjs/toolkit|immer|react-redux|react-native-reanimated|react-native-gesture-handler)/)',
    ],
    moduleNameMapper: {
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@screens/(.*)$': '<rootDir>/src/screens/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@store/(.*)$': '<rootDir>/src/store/$1',
        '^@theme$': '<rootDir>/src/theme',
        '^@types$': '<rootDir>/src/types',
        '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/e2e.*.test.ts'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/types/**',
    ],
    coverageReporters: ['text', 'lcov'],
};
