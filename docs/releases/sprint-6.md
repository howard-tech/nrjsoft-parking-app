# Sprint 6 Release Notes

## Status
- Completed

## Scope
- Account & support polish: TASK-043, TASK-047.
- Quality hardening: TASK-036, TASK-037, TASK-044.

## Completed
- Help & Support screen with FAQ accordion, support hotline/email, feedback input, legal links, and app version.
- License plate OCR via camera + on-device text recognition; scan flows into Add Vehicle form.
- Error handling: user-friendly toasts for key flows, retry/empty states, and offline banner retained.
- Performance: list virtualization tuning for vehicles/notifications/on-street zones.
- Accessibility: added labels/roles for key controls and inputs across account, notifications, subscriptions, and on-street flows.

## Testing
- Unit: `npm test -- --runInBand --watchman=false`

## Notes
- OCR uses `@react-native-ml-kit/text-recognition`; ensure camera permissions and pods are installed for iOS builds.
- Deep links and notifications inbox are available from Sprint 5; no regressions observed.
