# TASK-043: Help & Support Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-043 |
| **Module** | Account |
| **Priority** | Low |
| **Estimated Effort** | 3 hours |
| **Dependencies** | TASK-030 |
| **Status** | 🟢 Completed |

## Description

Implement help and support screen with FAQ, contact options, and help hotline access.

## Context from Technical Proposal (Page 5, 17)

- Help hotline access: One-tap access to support hotline
- Help & support link in account settings

## Acceptance Criteria

- [ ] FAQ section with expandable items
- [ ] Contact support via email
- [ ] Call support hotline
- [ ] In-app feedback form
- [ ] Link to privacy policy
- [ ] Link to terms of service
- [ ] App version display

## Technical Implementation

### Help Screen

```typescript
// src/screens/account/HelpSupportScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';

const FAQ_ITEMS = [
  {
    question: 'How do I start a parking session?',
    answer: 'Navigate to a garage on the Smart Map, select it, and tap "Start Session" for ANPR entry or "Scan QR" for QR code entry.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept Credit/Debit cards (Visa, Mastercard), Apple Pay, Google Pay, and NRJ Wallet balance.',
  },
  {
    question: 'How do I add a vehicle?',
    answer: 'Go to Account > Vehicles and tap "Add Vehicle". You can enter the license plate manually or scan it using your camera.',
  },
  {
    question: 'What happens if I overstay?',
    answer: 'Overstay penalties vary by location. Check the garage details for specific overstay fees before parking.',
  },
  {
    question: 'How do I get a receipt?',
    answer: 'Receipts are automatically generated after each session. View them in Account > History and tap "Receipt" to download.',
  },
];

const SUPPORT_PHONE = '+49 800 223 4455';
const SUPPORT_EMAIL = 'support@nrjsoft.com';

export const HelpSupportScreen: React.FC = () => {
  const theme = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent('NRJ Soft Parking Support Request');
    const body = encodeURIComponent(`
App Version: ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})
Device: ${DeviceInfo.getModel()}
OS: ${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}

Please describe your issue:

    `);
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.neutral.background }]}>
      {/* Contact Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>
          CONTACT US
        </Text>

        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: theme.colors.neutral.surface }]}
          onPress={handleCallSupport}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary.light }]}>
            <Icon name="phone" size={24} color={theme.colors.primary.main} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: theme.colors.neutral.textPrimary }]}>
              Call Support
            </Text>
            <Text style={[styles.contactSubtitle, { color: theme.colors.neutral.textSecondary }]}>
              5 min SLA · {SUPPORT_PHONE}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.neutral.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: theme.colors.neutral.surface }]}
          onPress={handleEmailSupport}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary.light }]}>
            <Icon name="email" size={24} color={theme.colors.primary.main} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: theme.colors.neutral.textPrimary }]}>
              Email Support
            </Text>
            <Text style={[styles.contactSubtitle, { color: theme.colors.neutral.textSecondary }]}>
              {SUPPORT_EMAIL}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.neutral.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>
          FREQUENTLY ASKED QUESTIONS
        </Text>

        {FAQ_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.faqItem, { backgroundColor: theme.colors.neutral.surface }]}
            onPress={() => toggleFaq(index)}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: theme.colors.neutral.textPrimary }]}>
                {item.question}
              </Text>
              <Icon
                name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={theme.colors.neutral.textSecondary}
              />
            </View>
            {expandedFaq === index && (
              <Text style={[styles.faqAnswer, { color: theme.colors.neutral.textSecondary }]}>
                {item.answer}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>
          LEGAL
        </Text>

        <TouchableOpacity
          style={[styles.linkItem, { backgroundColor: theme.colors.neutral.surface }]}
          onPress={() => handleOpenLink('https://nrjsoft.com/privacy')}
        >
          <Text style={[styles.linkText, { color: theme.colors.neutral.textPrimary }]}>
            Privacy Policy
          </Text>
          <Icon name="open-in-new" size={20} color={theme.colors.neutral.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkItem, { backgroundColor: theme.colors.neutral.surface }]}
          onPress={() => handleOpenLink('https://nrjsoft.com/terms')}
        >
          <Text style={[styles.linkText, { color: theme.colors.neutral.textPrimary }]}>
            Terms of Service
          </Text>
          <Icon name="open-in-new" size={20} color={theme.colors.neutral.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={[styles.appVersion, { color: theme.colors.neutral.textSecondary }]}>
          NRJ Soft Parking v{DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 16,
  },
  appInfo: {
    padding: 24,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 12,
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/account/HelpSupportScreen.tsx` | Main screen |

## Dependencies

```bash
npm install react-native-device-info
```

## Testing Checklist

- [ ] FAQ expands/collapses
- [ ] Phone call opens dialer
- [ ] Email opens mail app
- [ ] External links open browser
- [ ] App version displays correctly

## Related Tasks

- **Previous**: [TASK-030](task-030.md)
- **Next**: [TASK-044](task-044.md)
