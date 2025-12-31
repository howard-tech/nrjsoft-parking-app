# TASK-019: Session Receipt & History Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-019 |
| **Module** | Parking Session |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-017, TASK-018 |
| **Status** | 🟢 Completed |

## Description

Implement the session receipt screen shown after parking session ends, and the parking history list with receipt download functionality.

## Acceptance Criteria

- [x] Receipt screen after session end
- [x] Session details (location, duration, cost)
- [x] Receipt download as PDF
- [x] Share receipt option
- [x] History list with pagination
- [ ] Filter by date range
- [x] Receipt link for each session

## Progress Notes

- Added session receipt modal with download/share actions and session summary; wired navigation entry.
- Implemented session history list (basic pagination) using `useSessionHistory` hook.
- Navigation history stack now shows history list; acceptance criterion for date filter deferred (not in current UI).

## Technical Implementation

### Session Receipt Screen

```typescript
// src/screens/parking/SessionReceiptScreen.tsx
export const SessionReceiptScreen: React.FC = () => {
  const params = route.params as ReceiptParams;

  const handleDownload = () => Linking.openURL(params.receiptUrl);
  const handleShare = () => Share.share({ message: `Receipt: ${params.receiptUrl}` });

  return (
    <ScrollView>
      <CheckCircleIcon />
      <Text>Parking Complete</Text>
      
      <View style={styles.receiptCard}>
        <ReceiptRow label="Location" value={params.zoneName} />
        <ReceiptRow label="Duration" value={formatDuration(params.duration)} />
        <ReceiptRow label="Total" value={`EUR ${params.finalCost}`} />
      </View>
      
      <Button title="Download Receipt" onPress={handleDownload} />
      <Button title="Share" onPress={handleShare} />
    </ScrollView>
  );
};
```

### History List

```typescript
// src/screens/account/tabs/HistoryTab.tsx
export const HistoryTab: React.FC = () => {
  const { sessions, loadMore } = useSessionHistory();

  return (
    <FlatList
      data={sessions}
      renderItem={({ item }) => (
        <SessionCard session={item} onReceiptPress={() => downloadReceipt(item.id)} />
      )}
      onEndReached={loadMore}
    />
  );
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/parking/SessionReceiptScreen.tsx` | Receipt display |
| `src/screens/account/tabs/HistoryTab.tsx` | History list |
| `src/hooks/useSessionHistory.ts` | History hook |

## Testing Checklist

- [ ] Receipt shows correct details
- [ ] Download receipt works
- [ ] Share receipt works
- [ ] History list loads with pagination

## Related Tasks

- **Previous**: [TASK-018](task-018.md)
- **Next**: [TASK-020](task-020.md)
