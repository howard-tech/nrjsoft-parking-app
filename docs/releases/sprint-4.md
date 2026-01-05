# Sprint 4 Release Notes

## Scope
- Parking sessions and payments end-to-end: TASK-015, TASK-016, TASK-017, TASK-018, TASK-019, TASK-020, TASK-021, TASK-022, TASK-023, TASK-024, TASK-025, TASK-026, TASK-027.
- Map/demo hardening carried over: stabilized champion dataset and refresh behavior for demo flows.

## Completed
- Session stack: QR start, session state, active session timer/cost, receipt/history flows wired to mock API.
- Payment stack: card vaulting with Stripe, Platform Pay (Apple Pay/Google Pay) via SetupIntent + attach, default method selection, checkout charge flow, wallet top-up and transaction history.
- Map demo: champion garages (Nearest/Cheapest/EV/Max/Full), server-side sorting/search/debounce, refresh-triggered slot jitter only, demo center jump with throttling, crash-safe policies rendering.
- Mock API: charge endpoint, transactions, demo wallet balance (1500 EUR), parking detail endpoint, deterministic champion data.

## Testing
- Unit: `npm test -- --runInBand`
- Lint: `npm run lint`
- Android emulator (emulator-5554 / Samsung S24): Map demo scenarios (Nearest/Cheapest/EV ready/Refresh/Search “Tesla”) and payment smoke with mock API on `http://10.0.2.2:3001`.

## Notes
- Copy `.env.development` to `.env` locally for main branch runs; keep secrets out of git.
- Mock API entry point: `cd mock-api && npm run dev` (base `http://127.0.0.1:3001/api/v1`).
- Platform Pay uses env-driven country/currency; ensure GOOGLE_MAPS_API_KEY is set for map rendering.

## Next
- Kick off Sprint 5 (On-Street + Account) per TASK-LIST: TASK-026/TASK-027 on-street, TASK-030/TASK-031 account/vehicles, and any remaining payment polish as needed.
