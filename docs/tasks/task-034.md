# TASK-034: Notifications Inbox Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-034 |
| **Module** | Notifications |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-008 |
| **Status** | 🔴 Not Started |

## Description

Implement the Notification Inbox that centralizes all updates related to parking sessions, wallet status, and compliance policies.

## Context from Technical Proposal (Pages 18-19)

### Notification Types:
1. **Live Session Alerts**: Active session with timer and fee
2. **Wallet Alerts**: Balance status, auto-reload info
3. **Compliance/Policy Alerts**: Expiry rules, mandatory reminders

### UI Elements:
- "Notifications" header with session/wallet/compliance categories
- "Close" and "Go home" buttons
- Real-time "NOW" indicators
- Action links (View session, Top up)

## Acceptance Criteria

- [ ] Notification list with categories
- [ ] Live session notifications with timer
- [ ] Wallet balance notifications
- [ ] Policy/compliance alerts (pinned)
- [ ] Deep links to relevant screens
- [ ] Mark as read functionality
- [ ] Pull to refresh

## Technical Implementation

```typescript
// src/screens/notifications/NotificationsScreen.tsx
export const NotificationsScreen: React.FC = () => {
  const { notifications, markAsRead, refresh } = useNotifications();
  
  const renderNotification = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
    />
  );
  
  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      onRefresh={refresh}
      refreshing={isRefreshing}
    />
  );
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/notifications/NotificationsScreen.tsx` | Inbox screen |
| `src/screens/notifications/components/NotificationItem.tsx` | List item |
| `src/hooks/useNotifications.ts` | Notifications hook |

## Related Tasks

- **Previous**: [TASK-008](task-008.md) - Push Notification Service
- **Next**: [TASK-035](task-035.md) - Deep Linking
