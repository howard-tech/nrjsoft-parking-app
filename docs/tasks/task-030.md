# TASK-030: Account Screen & Profile Management

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-030 |
| **Module** | Account |
| **Priority** | High |
| **Estimated Effort** | 8 hours |
| **Dependencies** | TASK-006 |
| **Status** | 🟢 Completed |

## Description

Implement the Account & Settings screen allowing users to manage profile, vehicles, notifications, and account preferences.

## Context from Technical Proposal (Pages 16-18)

### Key Features:
1. **Profile Management**: Full name, email, phone, company/team info
2. **Notification Preferences**: Expiry alerts, disruptions, product tips
3. **Vehicle Management**: License plates with OCR scanning
4. **Activity & Payment History**: Past sessions, wallet events, receipts
5. **Help & Account Controls**: Support access, GDPR account deletion

## Acceptance Criteria

- [ ] Profile tab with editable fields
- [ ] Notifications tab with toggles
- [ ] Vehicles tab with plate management
- [ ] History tab with sessions and payments
- [ ] Help & support access
- [ ] Account deletion (GDPR compliant)
- [ ] Logout functionality

## Technical Implementation

### Account Screen with Tabs

```typescript
// src/screens/account/AccountScreen.tsx
const tabs = [
  { key: 'profile', label: 'Profile', icon: 'user' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'vehicles', label: 'Vehicles', icon: 'car' },
  { key: 'history', label: 'History', icon: 'download' },
];

export const AccountScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  return (
    <View>
      <UserHeader user={user} />
      <TabSelector tabs={tabs} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'vehicles' && <VehiclesTab />}
      {activeTab === 'history' && <HistoryTab />}
    </View>
  );
};
```

### Vehicle Management with OCR

```typescript
// src/screens/account/components/VehicleForm.tsx
const handleScanPlate = async () => {
  const result = await launchCamera();
  const plateNumber = await recognizePlate(result.uri);
  setLicensePlate(plateNumber);
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/account/AccountScreen.tsx` | Main account screen |
| `src/screens/account/tabs/ProfileTab.tsx` | Profile management |
| `src/screens/account/tabs/NotificationsTab.tsx` | Notification settings |
| `src/screens/account/tabs/VehiclesTab.tsx` | Vehicle management |
| `src/screens/account/tabs/HistoryTab.tsx` | Activity history |
| `src/screens/account/components/VehicleForm.tsx` | Add/edit vehicle |

## Related Tasks

- **Previous**: [TASK-006](task-006.md) - Auth Service
- **Next**: [TASK-031](task-031.md) - Vehicle Management Detail
