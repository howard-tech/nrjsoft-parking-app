# Sprint 2 Release Notes

## Status
- Completed (Auth & services scope delivered)

## Scope
- Auth & services deliverables: TASK-004, TASK-005, TASK-006, TASK-046, TASK-007, TASK-008, TASK-009, TASK-033.

## Completed
- Onboarding tutorial now skippable and persisted; language selector supports EN/DE/FR/BG/VI with saved preference.
- OTP auth flow with GDPR gate, resend timer, secure token storage/refresh, and Google/Apple social login.
- Axios client aligned to env config (`API_BASE_URL`/timeout), dev logging, basic network retry, and shared base API config.
- Notifications bootstrap: permission flow, FCM token storage/registration to backend, foreground/background/initial handlers wired into app shell.
- Redux Toolkit store now persisted (auth/localization/user/wallet) with session, wallet, and user slices scaffolded for upcoming features.
- Localization bootstrap and translations refreshed across auth/tutorial surfaces; onboarding language choice applied app-wide.

## Testing
- Unit: `npm test -- --runInBand --watchman=false` (initial run blocked by watchman permissions; reran with watchman disabled).
- Android emulator: `npm run android -- --no-packager` on `Pixel_3a_API_33_arm64-v8a` (build/install succeeded; app launched on emulator, Metro not started for this run).

## Notes / Follow-ups
- Android build emits upstream manifest namespace/deprecation warnings; no blocking issues observed.
- Start Metro (`npm start`) before interactive debugging on emulator to serve the JS bundle.
