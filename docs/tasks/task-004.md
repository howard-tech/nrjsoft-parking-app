# TASK-004: Tutorial & Onboarding Screens

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-004 |
| **Module** | Tutorial & Onboarding |
| **Priority** | High |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-002, TASK-003 |
| **Status** | 🟢 Completed |

## Description

Implement the onboarding tutorial flow that introduces new users to the app's core features: payment options, parking zones, and seamless payment experience. This is the first experience users have with the app.

## Context from Technical Proposal (Page 4)

### Key Features from Proposal:
1. **Branding & Visual Identity**: Fully aligned with NRJ Soft branding and styling, reinforcing trust and product recognition from the first launch.
2. **Quick Tutorial Carousel**: A short, swipeable tutorial introduces the core usage flow:
   - Choose how you pay - Use NRJ Wallet or pay directly with Card, Apple Pay, or Google Pay
   - Enter any NRJ parking zone - Garages or on-street areas supported by NRJ Soft
   - Pay seamlessly - Automatic or manual payment based on your selected method
3. **Language Selector**: Mandatory language selection before authentication, ensuring accessibility and compliance for EU multi-language markets.
4. **Localized Content**: Tutorial copy and onboarding text are loaded from localized resources.
5. **Help Hotline Access**: One-tap access to a support hotline for new drivers requiring immediate assistance.

### UI Reference (from mockup):
- NRJ Soft logo at top
- "NRJSOFT MOBILITY" branding
- "TUTORIAL" label
- Step indicator (1/3)
- Prev/Next buttons
- Language selector dropdown
- "Continue to sign in" button
- Help hotline with phone icon

## Acceptance Criteria

- [ ] Tutorial carousel with 3 slides implemented
- [ ] Swipe and button navigation (Prev/Next) working
- [ ] Step indicator showing current position
- [ ] Language selector with EU languages
- [ ] Localized strings for all tutorial content
- [ ] Help hotline tap opens phone dialer
- [ ] Skip option to go directly to login
- [ ] "Continue to sign in" navigates to Auth screen
- [ ] First-time user flag stored (don't show again)
- [ ] Animations/transitions between slides

## Technical Requirements

### 1. Tutorial Slide Data

```typescript
// src/screens/auth/tutorial/tutorialData.ts
export interface TutorialSlide {
  id: string;
  titleKey: string;        // i18n key
  descriptionKey: string;  // i18n key
  image: ImageSourcePropType;
  backgroundColor?: string;
}

export const tutorialSlides: TutorialSlide[] = [
  {
    id: 'payment',
    titleKey: 'tutorial.slide1.title',      // "Choose how you pay."
    descriptionKey: 'tutorial.slide1.desc', // "Use NRJ Wallet or go direct with Card, Apple Pay, or Google Pay."
    image: require('@assets/images/tutorial/payment-options.png'),
  },
  {
    id: 'zones',
    titleKey: 'tutorial.slide2.title',      // "Enter any NRJ parking zone."
    descriptionKey: 'tutorial.slide2.desc', // "Garages or on-street areas supported by NRJ Soft."
    image: require('@assets/images/tutorial/parking-zones.png'),
  },
  {
    id: 'seamless',
    titleKey: 'tutorial.slide3.title',      // "Pay seamlessly."
    descriptionKey: 'tutorial.slide3.desc', // "Automatic or manual payment based on your selected method."
    image: require('@assets/images/tutorial/seamless-pay.png'),
  },
];
```

### 2. Tutorial Screen Component

```typescript
// src/screens/auth/tutorial/TutorialScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme';
import { tutorialSlides, TutorialSlide } from './tutorialData';
import { LanguageSelector } from '@components/common/LanguageSelector';
import { Button } from '@components/common/Button';
import { setOnboardingComplete } from '@services/storage';

const { width } = Dimensions.get('window');
const SUPPORT_PHONE = '+49 800 223 4455'; // From mockup

export const TutorialScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / width);
      setCurrentIndex(index);
    },
    []
  );

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < tutorialSlides.length - 1) {
      goToSlide(currentIndex + 1);
    }
  };

  const handleContinue = async () => {
    await setOnboardingComplete(true);
    navigation.navigate('Login');
  };

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const renderSlide = ({ item }: { item: TutorialSlide }) => (
    <View style={[styles.slide, { width }]}>
      <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
      <View style={styles.slideContent}>
        <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>
          TUTORIAL
        </Text>
        <Text style={[styles.title, { color: theme.colors.neutral.white }]}>
          {t(item.titleKey)}
        </Text>
        <Text style={[styles.description, { color: theme.colors.neutral.white }]}>
          {t(item.descriptionKey)}
        </Text>
      </View>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.indicatorContainer}>
      {tutorialSlides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.indicator,
            {
              backgroundColor:
                index === currentIndex
                  ? theme.colors.neutral.white
                  : theme.colors.neutral.textSecondary,
              width: index === currentIndex ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary.main }]}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('@assets/images/nrj-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.brandName, { color: theme.colors.neutral.white }]}>
          NRJSOFT MOBILITY
        </Text>
        <Text style={[styles.stepText, { color: theme.colors.neutral.white }]}>
          {currentIndex + 1}/{tutorialSlides.length}
        </Text>
      </View>

      {/* Tutorial Carousel */}
      <FlatList
        ref={flatListRef}
        data={tutorialSlides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>{t('tutorial.prev')}</Text>
        </TouchableOpacity>

        {renderStepIndicator()}

        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === tutorialSlides.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === tutorialSlides.length - 1}
        >
          <Text style={styles.navButtonText}>{t('tutorial.next')}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Language Selector */}
        <LanguageSelector />

        {/* Help Hotline */}
        <TouchableOpacity style={styles.helpButton} onPress={handleCallSupport}>
          <PhoneIcon color={theme.colors.neutral.white} size={20} />
          <Text style={[styles.helpText, { color: theme.colors.neutral.white }]}>
            {t('tutorial.helpHotline')}
          </Text>
          <Text style={[styles.helpSubtext, { color: theme.colors.neutral.textSecondary }]}>
            {t('tutorial.helpDescription')}
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <Button
          title={t('tutorial.continueToSignIn')}
          onPress={handleContinue}
          variant="secondary"
          style={styles.continueButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  stepText: {
    position: 'absolute',
    top: 60,
    right: 20,
    fontSize: 14,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  slideImage: {
    width: width * 0.6,
    height: width * 0.4,
    marginBottom: 32,
  },
  slideContent: {
    alignItems: 'flex-start',
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 16,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  helpSubtext: {
    fontSize: 12,
    marginLeft: 8,
  },
  continueButton: {
    marginTop: 16,
  },
});
```

### 3. Language Selector Component

```typescript
// src/components/common/LanguageSelector.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English (EU)' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
];

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (language: Language) => {
    i18n.changeLanguage(language.code);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={[styles.label, { color: theme.colors.neutral.textSecondary }]}>
          {t('tutorial.languageSelector')}
        </Text>
        <Text style={[styles.sublabel, { color: theme.colors.neutral.textSecondary }]}>
          {t('tutorial.languageMandatory')}
        </Text>
        
        <TouchableOpacity
          style={[styles.selector, { borderColor: theme.colors.neutral.border }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.selectorText, { color: theme.colors.neutral.white }]}>
            {currentLanguage.nativeName}
          </Text>
          <ChevronDownIcon color={theme.colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.neutral.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.neutral.textPrimary }]}>
              {t('tutorial.selectLanguage')}
            </Text>
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    item.code === i18n.language && {
                      backgroundColor: theme.colors.primary.light + '20',
                    },
                  ]}
                  onPress={() => handleLanguageSelect(item)}
                >
                  <Text
                    style={[
                      styles.languageName,
                      { color: theme.colors.neutral.textPrimary },
                    ]}
                  >
                    {item.nativeName}
                  </Text>
                  {item.code === i18n.language && (
                    <CheckIcon color={theme.colors.primary.main} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.neutral.border }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: theme.colors.neutral.textPrimary }}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  languageName: {
    fontSize: 16,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
});
```

### 4. Localization Strings

```typescript
// src/localization/en.ts
export default {
  tutorial: {
    prev: 'Prev',
    next: 'Next',
    skip: 'Skip',
    continueToSignIn: 'Continue to sign in',
    languageSelector: 'Language selector',
    languageMandatory: 'Mandatory before entering auth.',
    selectLanguage: 'Select Language',
    helpHotline: 'Help hotline',
    helpDescription: 'Tap-to-call for new drivers.',
    slide1: {
      title: 'Choose how you pay.',
      desc: 'Use NRJ Wallet or go direct with Card, Apple Pay, or Google Pay.',
    },
    slide2: {
      title: 'Enter any NRJ parking zone.',
      desc: 'Garages or on-street areas supported by NRJ Soft.',
    },
    slide3: {
      title: 'Pay seamlessly.',
      desc: 'Automatic or manual payment based on your selected method.',
    },
  },
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/auth/tutorial/TutorialScreen.tsx` | Main tutorial screen |
| `src/screens/auth/tutorial/tutorialData.ts` | Tutorial slide content |
| `src/screens/auth/tutorial/index.ts` | Barrel export |
| `src/components/common/LanguageSelector.tsx` | Language selector component |
| `src/localization/en.ts` | English translations |
| `src/localization/de.ts` | German translations |
| `src/localization/fr.ts` | French translations |
| `assets/images/tutorial/*.png` | Tutorial slide images |
| `assets/images/nrj-logo.png` | NRJ Soft logo |

## Testing Checklist

- [ ] Tutorial displays on first app launch
- [ ] Swipe navigation works between slides
- [ ] Prev/Next buttons navigate correctly
- [ ] Step indicator updates on slide change
- [ ] Language selector opens modal
- [ ] Language change updates all text
- [ ] Help hotline opens phone dialer
- [ ] "Continue to sign in" navigates to Login
- [ ] Tutorial doesn't show again after completion
- [ ] Animations are smooth on both platforms

## Related Tasks

- **Previous**: [TASK-003](task-003.md) - Navigation Shell
- **Next**: [TASK-005](task-005.md) - Authentication Screen & OTP Flow
- **Depends on**: [TASK-009](task-009.md) - Localization Setup (for full i18n)
