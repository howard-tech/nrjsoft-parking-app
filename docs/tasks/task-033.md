# TASK-033: Localization & Multi-Language Support

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-033 |
| **Module** | Core |
| **Priority** | High |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-001 |
| **Status** | 🔴 Not Started |

## Description

Implement multi-language support (i18n) for EU markets with language selection and localized content throughout the app.

## Context from Technical Proposal (Pages 4-5)

- Language selector mandatory before authentication
- Localized copy for tutorial and onboarding
- EU multi-language market compliance

## Acceptance Criteria

- [ ] i18n framework setup (react-i18next)
- [ ] Language selector on onboarding
- [ ] Translations for all UI text
- [ ] RTL support consideration
- [ ] Date/time/currency formatting
- [ ] Persist language preference

## Technical Implementation

### i18n Configuration

```typescript
// src/localization/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

import en from './translations/en.json';
import de from './translations/de.json';
import bg from './translations/bg.json';
import fr from './translations/fr.json';

const LANGUAGE_KEY = '@app_language';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      callback(savedLanguage);
      return;
    }
    const bestLanguage = RNLocalize.findBestAvailableLanguage(['en', 'de', 'bg', 'fr']);
    callback(bestLanguage?.languageTag || 'en');
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      bg: { translation: bg },
      fr: { translation: fr },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Translation Files

```json
// src/localization/translations/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry",
    "cancel": "Cancel",
    "save": "Save",
    "done": "Done"
  },
  "onboarding": {
    "title1": "Choose how you pay.",
    "desc1": "Use NRJ Wallet or go direct with Card, Apple Pay, or Google Pay.",
    "title2": "Enter any NRJ parking zone",
    "desc2": "Garages or on-street areas supported by NRJ Soft.",
    "title3": "Pay seamlessly",
    "desc3": "Automatic or manual payment based on your selected method.",
    "continue": "Continue to sign in"
  },
  "auth": {
    "secureSignIn": "Secure sign in",
    "otpRequired": "OTP enforced and GDPR consent required.",
    "mobileNumber": "Mobile number",
    "corporateEmail": "Corporate email",
    "otpVerification": "OTP verification",
    "continueWithGoogle": "Continue with Google",
    "continueWithApple": "Continue with Apple",
    "acceptTerms": "I accept NRJsoft Terms & GDPR consent",
    "secureLogin": "Secure login"
  },
  "home": {
    "searchPlaceholder": "Search garages, streets...",
    "nearbyGarages": "Nearby garages",
    "remainingSlots": "Remaining slots",
    "evCharging": "EV charging",
    "security": "Security",
    "policy": "Policy",
    "overstayPenalty": "Overstay penalty",
    "rate": "Rate",
    "navigate": "Navigate",
    "startSession": "Start Session",
    "scanQR": "Scan QR"
  },
  "session": {
    "parkingInProgress": "Parking in Progress",
    "liveTimer": "Live Timer",
    "currentFee": "Current Fee",
    "walletProjection": "Wallet projection",
    "topUpNow": "Top-up now",
    "parkingComplete": "Parking Complete"
  },
  "wallet": {
    "balance": "Balance",
    "topUp": "Top up",
    "autoReload": "Auto-reload",
    "paymentSettings": "Payment Settings",
    "subscriptions": "Subscriptions"
  },
  "onstreet": {
    "title": "On-Street Parking",
    "detectLocation": "Detect location",
    "city": "City",
    "zone": "Zone",
    "duration": "Duration & amount",
    "prepaidAmount": "Prepaid Amount",
    "payUpfront": "Pay upfront",
    "liveSession": "Live on-street session",
    "extendTime": "Extend time",
    "stop": "Stop"
  },
  "account": {
    "profile": "Profile",
    "notifications": "Notifications",
    "vehicles": "Vehicles",
    "history": "History",
    "helpSupport": "Help & support",
    "deleteAccount": "Delete account (GDPR)"
  }
}
```

### Language Selector Component

```typescript
// src/components/common/LanguageSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme';

const LANGUAGES = [
  { code: 'en', label: 'English (EU)' },
  { code: 'de', label: 'Deutsch' },
  { code: 'bg', label: 'Български' },
  { code: 'fr', label: 'Français' },
];

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const theme = useTheme();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>
        Language selector
      </Text>
      <Text style={[styles.hint, { color: theme.colors.neutral.textSecondary }]}>
        Mandatory before entering auth.
      </Text>
      
      <View style={[styles.dropdown, { borderColor: theme.colors.neutral.border }]}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.option,
              i18n.language === lang.code && {
                backgroundColor: theme.colors.primary.light,
              },
            ]}
            onPress={() => handleLanguageChange(lang.code)}
          >
            <Text style={[
              styles.optionText,
              { color: theme.colors.neutral.textPrimary },
              i18n.language === lang.code && { fontWeight: '600' },
            ]}>
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    marginBottom: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
  },
});
```

### Usage in Components

```typescript
// Example usage in any component
import { useTranslation } from 'react-i18next';

export const SomeScreen: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('home.searchPlaceholder')}</Text>
      <Button title={t('common.save')} />
    </View>
  );
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/localization/i18n.ts` | i18n configuration |
| `src/localization/translations/en.json` | English translations |
| `src/localization/translations/de.json` | German translations |
| `src/localization/translations/bg.json` | Bulgarian translations |
| `src/localization/translations/fr.json` | French translations |
| `src/components/common/LanguageSelector.tsx` | Language picker |
| `src/hooks/useLocalization.ts` | Localization hook |

## Dependencies

```bash
npm install i18next react-i18next react-native-localize
```

## Testing Checklist

- [ ] Language selector works
- [ ] All UI text translates
- [ ] Language persists on restart
- [ ] Date/time formats correctly
- [ ] Currency formats correctly
- [ ] Fallback to English works

## Related Tasks

- **Previous**: [TASK-032](task-032.md)
- **Next**: [TASK-034](task-034.md)
