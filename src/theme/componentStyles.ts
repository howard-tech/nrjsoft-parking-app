import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { shadows } from './shadows';

export const buttonStyles = StyleSheet.create({
    primary: {
        backgroundColor: colors.primary.main,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryText: {
        ...typography.button,
        color: colors.primary.contrast,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary.main,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryText: {
        ...typography.button,
        color: colors.primary.main,
    },
    danger: {
        backgroundColor: colors.error.main,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export const cardStyles = StyleSheet.create({
    container: {
        backgroundColor: colors.neutral.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    header: {
        ...typography.h4,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.sm,
    },
});

export const inputStyles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.bodySmall,
        color: colors.neutral.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.neutral.surface,
        borderWidth: 1,
        borderColor: colors.neutral.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        ...typography.body,
        color: colors.neutral.textPrimary,
    },
    inputFocused: {
        borderColor: colors.primary.main,
    },
    inputError: {
        borderColor: colors.error.main,
    },
    errorText: {
        ...typography.caption,
        color: colors.error.main,
        marginTop: spacing.xs,
    },
});
