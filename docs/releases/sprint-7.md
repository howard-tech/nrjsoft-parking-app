# Sprint 7 Release Notes

## Status
- In Progress

## Scope
- Testing & CI: TASK-038, TASK-039, TASK-045.
- Deployment prep: TASK-040, TASK-056, TASK-057 (pending store access).

## Completed
- Expanded Jest configuration for coverage reporting and module alias support.
- Added unit tests for auth, payment, and session services plus a core Button component.
- Added Detox configuration and smoke E2E tests for auth, parking, payment, and on-street flows.
- Added OTP input test IDs for reliable E2E automation.
- Updated CI test commands to disable watchman.

## Testing
- Unit: `npm test -- --runInBand --watchman=false`

## Notes
- E2E tests assume a running mock API and location permissions.
- Store submission tasks remain pending external credentials and console setup.
