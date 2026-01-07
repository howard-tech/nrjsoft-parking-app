# Sprint 5 Plan & Tracking

## Status
- Completed

## Scope (2 weeks)
- On-Street flow E2E: TASK-026, TASK-027, TASK-028, TASK-029.
- Account foundation: TASK-030, TASK-031, TASK-032.
- Notifications & Deep Linking: TASK-034, TASK-035.
- Subscriptions & Packages: TASK-042.

## Objectives
- Start/extend/stop on-street sessions with countdown, cost estimate, and reminder notifications.
- Account profile + vehicles CRUD and notification preferences wired to backend.
- Notifications inbox and deep-link/QR handling for sessions/payments.

## Completed Work
- On-street service integration + session UI: zones list, start flow, active session card with countdown, reminder notification, extend modal, and stop confirmation.
- Account: profile editing, vehicle CRUD (set default/delete), and notification preferences persisted via API.
- Notifications inbox: list view with pagination, mark read, and navigation hook-up.
- Deep linking: handler routes session/on-street/garage/payment/notifications URLs; initial URL + runtime listener.
- Subscriptions & packages: plans list, active subscription card with auto-renew toggle, subscribe/cancel flow via API.

## Validation
- Unit: on-street service, timer hook, notification preferences, deep-link handler.
- Lint: `npm run lint`; Tests: `npm test -- --runInBand`.
- Android emulator: end-to-end on-street (start → countdown → extend → stop), account/vehicle CRUD, notification toggles, deep links/QR; ensure no regression on map.
- Mock API: ensure on-street endpoints and seed data are available.

## Notes
- Backend base: `http://10.0.2.2:3001/api/v1` (mock API).
- Keep `.env` synced locally; do not commit secrets.
