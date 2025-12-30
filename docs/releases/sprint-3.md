# Sprint 3 Release Notes

## Scope
- Smart map and platform hardening: TASK-010, TASK-011, TASK-012, TASK-013, TASK-014, TASK-048, TASK-049, TASK-050, TASK-051.

## Completed
- Google Maps integration (Android/iOS) via `GOOGLE_MAPS_API_KEY` env/manifest placeholders with network security config restricted to debug.
- Smart Map home screen scaffold: user location permissions/overlays, animated recenter, nearby garage fetch (`/parking/nearby`), colored markers by availability, and a horizontal carousel wired to marker selection with manual refresh.
- Task-012: custom garage/on-street markers with status colors, animated selection, distance labels, lightweight clustering for zoomed-out views.

## In Progress
- Garage detail bottom sheet, navigation/QR actions, and search/filter UX are scheduled for TASK-012/013/014.

## Testing
- Lint: `npm run lint`
- Unit: `npm test -- --runInBand --watchman=false`
- Android emulator: `Pixel_3a_API_33_arm64-v8a` built/installed via `npm run android -- --no-packager` (Metro running). CLI failed when `adb` not on PATH; succeeded by running `~/Library/Android/sdk/platform-tools/adb reverse tcp:8081 tcp:8081` and `adb shell am start ...`.

## Notes
- Ensure local/CI env files set `GOOGLE_MAPS_API_KEY`; iOS can also read `GMSServicesApiKey` from Info.plist when env vars are not provided.
- Backend `/parking/nearby` should return `id`, `name`, `latitude`, `longitude`, optional `distanceMeters`, `availableSlots`, and `status` (`available|limited|full`).
