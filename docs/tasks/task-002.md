# TASK-002: Design System & Theme Configuration

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-002 |
| **Module** | Project Setup |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🟢 Completed |

## Description

Implement the NRJ Soft design system with brand colors, typography, spacing, and reusable style utilities. Create a theme provider that supports the application's visual identity and ensures consistency across all screens.

## Context from Technical Proposal

The proposal emphasizes:
- **Branding & Visual Identity**: Fully aligned with NRJ Soft branding and styling
- **Trust and product recognition** from the first launch
- Design should reinforce professionalism and reliability

## Acceptance Criteria

- [x] Theme provider implemented with colors, typography, and spacing
- [x] NRJ Soft brand colors defined (primary blue, accent colors)
- [x] Typography scale with EU-compliant fonts
- [x] Spacing system (4px/8px grid)
- [x] Shadow and elevation styles
- [x] Common component styles (buttons, cards, inputs)
- [ ] Dark mode support (optional, but infrastructure ready)
- [x] Theme can be accessed via hook (`useTheme`)

## Technical Requirements

### 1. Color Palette

Based on the UI mockups in the proposal:

```typescript
// src/theme/colors.ts
export const colors = {
  // Primary Brand Colors
  primary: {
    main: '#1E3A5F',      // NRJ Soft dark blue
    light: '#2E5A8F',
    dark: '#0E2A4F',
    contrast: '#FFFFFF',
  },
  
  // Secondary/Accent
  secondary: {
    main: '#E74C3C',      // Red accent (from mockups)
    light: '#F76C5E',
    dark: '#C73C2C',
  },
  
  // Status Colors
  success: {
    main: '#27AE60',
    light: '#2ECC71',
    background: '#E8F5E9',
  },
  warning: {
    main: '#F39C12',
    light: '#F5B041',
    background: '#FFF8E1',
  },
  error: {
    main: '#E74C3C',
    light: '#EC7063',
    background: '#FFEBEE',
  },
  info: {
    main: '#3498DB',
    light: '#5DADE2',
    background: '#E3F2FD',
  },
  
  // Neutrals
  neutral: {
    white: '#FFFFFF',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    border: '#E0E6ED',
    disabled: '#BDC3C7',
    textPrimary: '#2C3E50',
    textSecondary: '#7F8C8D',
    textDisabled: '#BDC3C7',
    black: '#000000',
  },
  
  // Map-specific
  map: {
    available: '#27AE60',    // Green - spots available
    limited: '#F39C12',      // Orange - few spots
    full: '#E74C3C',         // Red - no spots
    selected: '#1E3A5F',     // Selected garage
  },
};
```

### 2. Typography

```typescript
// src/theme/typography.ts
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
  // Headings
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
  
  // Body
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
  
  // Labels & Buttons
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
```

### 3. Spacing System

```typescript
// src/theme/spacing.ts
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
```

### 4. Shadows & Elevation

```typescript
// src/theme/shadows.ts
import { Platform } from 'react-native';

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
};
```

### 5. Theme Provider

```typescript
// src/theme/ThemeContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { shadows } from './shadows';

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
}

const theme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

const ThemeContext = createContext<Theme>(theme);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { theme };
```

### 6. Common Component Styles

```typescript
// src/theme/componentStyles.ts
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
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/theme/colors.ts` | Color palette definitions |
| `src/theme/typography.ts` | Typography scale |
| `src/theme/spacing.ts` | Spacing and border radius |
| `src/theme/shadows.ts` | Shadow/elevation definitions |
| `src/theme/ThemeContext.tsx` | Theme provider and hook |
| `src/theme/componentStyles.ts` | Pre-built component styles |
| `src/theme/index.ts` | Barrel export |

## Usage Example

```typescript
import { useTheme } from '@theme';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.neutral.background }}>
      <Text style={theme.typography.h2}>Hello NRJ Soft</Text>
    </View>
  );
};
```

## Testing Checklist

- [ ] Theme provider wraps the app correctly
- [ ] `useTheme` hook returns all theme values
- [ ] Colors render correctly on both platforms
- [ ] Typography scales are readable on all screen sizes
- [ ] Shadows display correctly on iOS and Android

## Design Reference

Refer to the mockup screenshots in the technical proposal (pages 4-18) for:
- Primary blue header color
- Red accent for alerts and CTAs
- White/gray card backgrounds
- Bottom sheet styling
- Button styles (primary solid, secondary outline)

## Related Tasks

- **Previous**: [TASK-001](task-001.md) - Project Initialization
- **Next**: [TASK-003](task-003.md) - Navigation Shell & Tab Structure
- **Uses**: [TASK-004](task-004.md) - Onboarding screens will use these styles
