# TASK-032: Notification Preferences Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-032 |
| **Module** | Account |
| **Priority** | Medium |
| **Estimated Effort** | 4 hours |
| **Dependencies** | TASK-030, TASK-008 |
| **Status** | 🔴 Not Started |

## Description

Implement the notification preferences screen allowing users to control which notifications they receive.

## Context from Technical Proposal (Page 17)

### Notification Types:
- 5-minute expiry alert (Locked ON)
- Critical disruptions (outages/enforcement)
- Product tips (optional marketing)

## Acceptance Criteria

- [ ] Notification toggles for each type
- [ ] Some notifications locked (required)
- [ ] Save preferences to backend
- [ ] Sync with device notification settings
- [ ] Help & support link
- [ ] Account deletion option (GDPR)

## Technical Implementation

### Notifications Tab

```typescript
// src/screens/account/tabs/NotificationsTab.tsx
import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@theme';
import { useNotificationPreferences } from '@hooks/useNotificationPreferences';

export const NotificationsTab: React.FC = () => {
  const theme = useTheme();
  const { preferences, updatePreference, isLoading } = useNotificationPreferences();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAccount(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.neutral.textSecondary }]}>
          NOTIFICATIONS
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.neutral.textSecondary }]}>
          Choose what NRJsoft can ping you about.
        </Text>
      </View>

      {/* Expiry Alert - Locked */}
      <View style={[styles.settingRow, { backgroundColor: theme.colors.neutral.surface }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: theme.colors.neutral.textPrimary }]}>
            5-minute expiry alert
          </Text>
          <Text style={[styles.settingDesc, { color: theme.colors.neutral.textSecondary }]}>
            Locked ON
          </Text>
        </View>
        <Switch
          value={true}
          disabled={true}
          trackColor={{ true: theme.colors.primary.light }}
          thumbColor={theme.colors.primary.main}
        />
      </View>

      {/* Critical Disruptions */}
      <View style={[styles.settingRow, { backgroundColor: theme.colors.neutral.surface }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: theme.colors.neutral.textPrimary }]}>
            Critical disruptions
          </Text>
          <Text style={[styles.settingDesc, { color: theme.colors.neutral.textSecondary }]}>
            Outage or enforcement
          </Text>
        </View>
        <Switch
          value={preferences.criticalDisruptions}
          onValueChange={(value) => updatePreference('criticalDisruptions', value)}
          trackColor={{ 
            false: theme.colors.neutral.border, 
            true: theme.colors.primary.light 
          }}
          thumbColor={preferences.criticalDisruptions ? theme.colors.primary.main : '#FFF'}
        />
      </View>

      {/* Product Tips */}
      <View style={[styles.settingRow, { backgroundColor: theme.colors.neutral.surface }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: theme.colors.neutral.textPrimary }]}>
            Product tips
          </Text>
          <Text style={[styles.settingDesc, { color: theme.colors.neutral.textSecondary }]}>
            Optional marketing
          </Text>
        </View>
        <Switch
          value={preferences.productTips}
          onValueChange={(value) => updatePreference('productTips', value)}
          trackColor={{ 
            false: theme.colors.neutral.border, 
            true: theme.colors.primary.light 
          }}
          thumbColor={preferences.productTips ? theme.colors.primary.main : '#FFF'}
        />
      </View>

      {/* Help & Support */}
      <TouchableOpacity 
        style={[styles.linkRow, { borderColor: theme.colors.neutral.border }]}
        onPress={() => navigation.navigate('Help')}
      >
        <Text style={[styles.linkText, { color: theme.colors.neutral.textPrimary }]}>
          Help & support
        </Text>
        <ChevronRightIcon color={theme.colors.neutral.textSecondary} />
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity 
        style={[styles.linkRow, { borderColor: theme.colors.neutral.border }]}
        onPress={handleDeleteAccount}
      >
        <Text style={[styles.linkText, { color: theme.colors.error.main }]}>
          Delete account (GDPR)
        </Text>
        <ChevronRightIcon color={theme.colors.neutral.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 16,
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/account/tabs/NotificationsTab.tsx` | Preferences screen |
| `src/hooks/useNotificationPreferences.ts` | Preferences hook |
| `src/services/api/userService.ts` | User settings API |

## Testing Checklist

- [ ] Toggles save correctly
- [ ] Locked setting not changeable
- [ ] Help link navigates
- [ ] Account deletion works
- [ ] Preferences sync with backend

## Related Tasks

- **Previous**: [TASK-031](task-031.md)
- **Next**: [TASK-033](task-033.md)
