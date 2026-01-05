# Sprint 5 Plan & Tracking

## Status
- Planned (in progress)

## Scope (2 weeks)
- On-Street flow E2E: TASK-026, TASK-027, TASK-028, TASK-029.
- Account foundation: TASK-030, TASK-031, TASK-032.
- Notifications & Deep Linking: TASK-034, TASK-035.

## Objectives
- Start/extend/stop on-street sessions with countdown, cost estimate, and reminder notifications.
- Account profile + vehicles CRUD and notification preferences wired to backend.
- Notifications inbox and deep-link/QR handling for sessions/payments.

## Planned Work Items
- TASK-026 On-Street Service: `/onstreet/nearby`, `/onstreet/start`, `/onstreet/extend`, `/onstreet/stop`; retries/offline/error surfacing.
- TASK-027 On-Street Screen: map overlay for zones, select/start flow, active banner, extend/stop hooks, empty/error states, accessibility labels.
- TASK-028 Countdown & Notifications: timer hook persistence, local notifications + push fallback, warning thresholds (e.g., 5m remaining).
- TASK-029 Extend/Stop UX: extend modal, confirm dialogs, optimistic UI with rollback on failure.
- TASK-030 Account Screen: profile fetch/update, avatar placeholder, logout link, a11y audit.
- TASK-031 Vehicles: list/add/remove vehicle, validation, default vehicle toggle.
- TASK-032 Notification Preferences: push/email/SMS toggles, persist to backend, error toasts.
- TASK-034 Notifications Inbox: list, detail, mark read, filters, pagination/lazy load.
- TASK-035 Deep Linking/QR: app/intent links for session/payment/garage; QR handler; add test matrix.

## Validation
- Unit: on-street service, timer hook, notification preferences, deep-link handler.
- Lint: `npm run lint`; Tests: `npm test -- --runInBand`.
- Android emulator: end-to-end on-street (start → countdown → extend → stop), account/vehicle CRUD, notification toggles, deep links/QR; ensure no regression on map.
- Mock API: ensure on-street endpoints and seed data are available.

## Notes
- Backend base: `http://10.0.2.2:3001/api/v1` (mock API).
- Keep `.env` synced locally; do not commit secrets.
