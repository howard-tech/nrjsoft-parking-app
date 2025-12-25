import { Platform } from 'react-native';

export const fontFamily = {
    regular: Platform.select({
        ios: 'System',
        android: 'Roboto',
    }),
    medium: Platform.select({
        ios: 'System',
        android: 'Roboto-Medium',
    }),
    bold: Platform.select({
        ios: 'System',
        android: 'Roboto-Bold',
    }),
};

export const typography = {
    h1: {
        fontFamily: fontFamily.bold,
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '700' as const,
    },
    h2: {
        fontFamily: fontFamily.bold,
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '700' as const,
    },
    h3: {
        fontFamily: fontFamily.medium,
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '600' as const,
    },
    h4: {
        fontFamily: fontFamily.medium,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600' as const,
    },
    bodyLarge: {
        fontFamily: fontFamily.regular,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400' as const,
    },
    body: {
        fontFamily: fontFamily.regular,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400' as const,
    },
    bodySmall: {
        fontFamily: fontFamily.regular,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400' as const,
    },
    label: {
        fontFamily: fontFamily.medium,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500' as const,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
    },
    button: {
        fontFamily: fontFamily.medium,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600' as const,
    },
    caption: {
        fontFamily: fontFamily.regular,
        fontSize: 11,
        lineHeight: 14,
        fontWeight: '400' as const,
    },
};
