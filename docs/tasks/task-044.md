# TASK-044: Accessibility (a11y) Implementation

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-044 |
| **Module** | Quality |
| **Priority** | Medium |
| **Estimated Effort** | 6 hours |
| **Dependencies** | All feature tasks |
| **Status** | 🔴 Not Started |

## Description

Implement accessibility features to ensure the app is usable by people with disabilities, following WCAG 2.1 guidelines.

## Acceptance Criteria

- [ ] All interactive elements have accessibility labels
- [ ] Screen reader support (VoiceOver/TalkBack)
- [ ] Sufficient color contrast ratios
- [ ] Touch target sizes (minimum 44x44pt)
- [ ] Focus order is logical
- [ ] Dynamic type support
- [ ] Reduced motion support
- [ ] Accessibility testing passed

## Technical Implementation

### Accessibility Labels

```typescript
// Add to all interactive components
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Navigate to Danube Plaza Garage"
  accessibilityHint="Double tap to view garage details"
  accessibilityRole="button"
  onPress={handlePress}
>
  <Text>Danube Plaza Garage</Text>
</TouchableOpacity>
```

### Accessible Button Component

```typescript
// src/components/common/AccessibleButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, AccessibilityRole } from 'react-native';
import { useTheme } from '@theme';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  variant = 'primary',
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles[variant],
        { minHeight: 44, minWidth: 44 }, // Minimum touch target
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#E31E24',
  },
  secondary: {
    backgroundColor: '#F5F5F5',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E31E24',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#1A1A1A',
  },
  outlineText: {
    color: '#E31E24',
  },
});
```

### Screen Reader Announcements

```typescript
// src/utils/accessibility.ts
import { AccessibilityInfo, Platform } from 'react-native';

export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

// Usage example - after session starts
announceForAccessibility('Parking session started at NRJ Downtown Hub');

// Usage example - timer warning
announceForAccessibility('Warning: 5 minutes remaining on parking session');
```

### Dynamic Type Support

```typescript
// src/hooks/useAccessibleFontSize.ts
import { useWindowDimensions, PixelRatio } from 'react-native';

export const useAccessibleFontSize = () => {
  const { fontScale } = useWindowDimensions();
  
  const scaledFont = (size: number) => {
    // Allow scaling up to 1.5x for accessibility
    const maxScale = Math.min(fontScale, 1.5);
    return PixelRatio.roundToNearestPixel(size * maxScale);
  };

  return { scaledFont, fontScale };
};
```

### Color Contrast Check

```typescript
// src/utils/colorContrast.ts
// WCAG 2.1 requires 4.5:1 for normal text, 3:1 for large text

export const getContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;

    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Theme colors should pass these checks:
// Primary Red (#E31E24) on White (#FFFFFF): 4.63:1 ✓
// Text Primary (#1A1A1A) on White (#FFFFFF): 16.1:1 ✓
// Text Secondary (#666666) on White (#FFFFFF): 5.74:1 ✓
```

### Reduced Motion Support

```typescript
// src/hooks/useReducedMotion.ts
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useReducedMotion = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => subscription.remove();
  }, []);

  return reduceMotion;
};

// Usage in animations
const { reduceMotion } = useReducedMotion();

const animationDuration = reduceMotion ? 0 : 300;
```

### Accessible Form Inputs

```typescript
// src/components/common/AccessibleInput.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface AccessibleInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = 'default',
}) => {
  const inputId = `input-${label.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <View style={styles.container}>
      <Text
        nativeID={inputId}
        style={styles.label}
        accessibilityRole="text"
      >
        {label}
      </Text>
      <TextInput
        accessible={true}
        accessibilityLabel={label}
        accessibilityLabelledBy={inputId}
        accessibilityState={{ 
          disabled: false,
          ...(error && { invalid: true })
        }}
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        keyboardType={keyboardType}
      />
      {error && (
        <Text 
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#1A1A1A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48, // Touch target
  },
  inputError: {
    borderColor: '#E31E24',
  },
  error: {
    color: '#E31E24',
    fontSize: 12,
    marginTop: 4,
  },
});
```

### Accessibility Testing Checklist

```typescript
// src/__tests__/accessibility.test.tsx
import { render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

describe('Accessibility', () => {
  it('all buttons have accessibility labels', () => {
    const { getAllByRole } = render(<App />);
    const buttons = getAllByRole('button');
    
    buttons.forEach((button) => {
      expect(button.props.accessibilityLabel).toBeTruthy();
    });
  });

  it('form inputs are properly labeled', () => {
    const { getAllByLabelText } = render(<LoginScreen />);
    
    expect(getAllByLabelText('Phone number')).toBeTruthy();
    expect(getAllByLabelText('OTP verification')).toBeTruthy();
  });

  it('touch targets are at least 44x44', () => {
    const { getAllByRole } = render(<App />);
    const touchables = getAllByRole('button');
    
    touchables.forEach((touchable) => {
      const { height, width } = touchable.props.style;
      expect(height).toBeGreaterThanOrEqual(44);
      expect(width).toBeGreaterThanOrEqual(44);
    });
  });
});
```

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/utils/accessibility.ts` | Utility functions |
| `src/hooks/useReducedMotion.ts` | Motion preference hook |
| `src/hooks/useAccessibleFontSize.ts` | Font scaling hook |
| All component files | Add accessibility props |

## Testing Checklist

- [ ] VoiceOver works on iOS
- [ ] TalkBack works on Android
- [ ] All buttons have labels
- [ ] Form inputs are labeled
- [ ] Color contrast passes WCAG
- [ ] Touch targets are 44x44 minimum
- [ ] Reduced motion is respected
- [ ] Dynamic type works

## Related Tasks

- **Previous**: [TASK-039](task-039.md)
- **Next**: [TASK-045](task-045.md)
