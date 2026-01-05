# Sprint 3 Release Notes

## Status
- Completed (Map & platform hardening scope delivered; subsequent demo refresh merged in Sprint 4)

## Scope
- Smart map and platform hardening: TASK-010, TASK-011, TASK-012, TASK-013, TASK-014, TASK-048, TASK-049, TASK-050, TASK-051.

## Completed
- Google Maps integration (Android/iOS) via `GOOGLE_MAPS_API_KEY` env/manifest placeholders with network security config restricted to debug.
- Smart Map home screen scaffold: user location permissions/overlays, animated recenter, nearby garage fetch (`/parking/nearby`), colored markers by availability, and a horizontal carousel wired to marker selection with manual refresh.
- Task-012: custom garage/on-street markers with status colors, animated selection, distance labels, lightweight clustering for zoomed-out views.
- Task-013: garage bottom sheet with snap points (45%, 80%), detail fetch, navigation/start/QR actions, and drag-to-close.
- Task-014: search bar with autocomplete/history, filter chips (nearest/cheapest/EV-ready/max-time), and map/list updates based on search/filter selections.
- Task-048: external navigation chooser (Google/Apple/Waze/Web) wired to garage detail navigate button.
- Task-049: offline/error handling with global offline banner, cached nearby results for Smart Map, queued refresh actions, shared empty/loading states, and app-level error boundary.
- Task-050: Firebase analytics/perf/crashlytics services with navigation screen tracking, user ID sync, and error boundary reporting.
- Task-051: security layer (Keychain/encrypted storage helpers, biometrics, device integrity checks, screen secure mode, SSL-pinned client).

## Next
- Sprint 4 (sessions/payments) has been delivered; see sprint-4.md for details.

## Testing
- Lint: `npm run lint`
- Unit: `npm test -- --runInBand --watchman=false`
- Android emulator: `Pixel_3a_API_33_arm64-v8a` built/installed via `npm run android -- --no-packager` (Metro running). CLI failed when `adb` not on PATH; succeeded by running `~/Library/Android/sdk/platform-tools/adb reverse tcp:8081 tcp:8081` and `adb shell am start ...`.

## Notes
- Ensure local/CI env files set `GOOGLE_MAPS_API_KEY`; iOS can also read `GMSServicesApiKey` from Info.plist when env vars are not provided.
- Backend `/parking/nearby` should return `id`, `name`, `latitude`, `longitude`, optional `distanceMeters`, `availableSlots`, and `status` (`available|limited|full`).
