# Sprint 1 Release Notes

## Scope
- Foundations, mock API, and initial app shell: TASK-052, TASK-053, TASK-054, TASK-001, TASK-002, TASK-003, TASK-041, TASK-055.

## Completed
- Mock backend with seedable EU data and simulation endpoints for auth and parking flows.
- React Native app initialized with theme/design system and navigation shell (auth stack + main tabs) wired.
- Assets baseline in place with branding (icon/splash) and dev automation scripts (Makefile + `scripts/dev.sh`) for setup and run loops.

## Testing
- Manual sanity on Metro + mock API during setup; subsequent sprints add Jest coverage and emulator runs.

## Notes
- Keep `.env` files copied from `.env.example` and run `npm install` + `mock-api npm install` before `npm start`. Use `npm run android`/`ios` after Metro is running.
