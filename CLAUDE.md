# CLAUDE.md - Configuration for Claude Code Agent

## Project Context

You are working on **NRJSoft Parking Mobile Application**, a React Native app for parking management in EU markets.

## Quick Reference

| Item | Value |
|------|-------|
| Framework | React Native 0.73+ |
| Language | TypeScript (strict) |
| State | Redux Toolkit |
| API | Axios + Mock Express Server |
| Maps | Google Maps SDK |
| Payments | Stripe + Apple Pay + Google Pay |
| Auth | JWT + OTP |

## Project Structure

```
nrjsoft-parking-app/
├── src/                 # React Native source
├── mock-api/            # Node.js Express mock backend
├── ios/                 # iOS native code
├── android/             # Android native code
├── docs/tasks/          # 57 task specifications
└── scripts/             # Automation scripts
```

## Task System

Tasks are in `docs/tasks/task-XXX.md` format. Each contains:
- Overview (ID, priority, effort, dependencies)
- Acceptance criteria
- Technical implementation details
- Files to create
- Testing checklist

## How to Work

### Starting a New Task

```bash
# 1. Read the task specification
cat docs/tasks/task-052.md

# 2. Create feature branch
git checkout -b feature/TASK-052

# 3. Implement according to spec

# 4. Test thoroughly
npm test
npm run ios
npm run android

# 5. Commit with conventional message
git commit -m "feat(mock-api): implement express server with all endpoints"
```

### Task Order

Execute in this sequence:
1. **Mock API** (TASK-052, 053, 054) - Backend simulation
2. **Setup** (TASK-001, 002, 003) - Project foundation
3. **Auth** (TASK-004, 005, 006, 046) - Authentication flows
4. **Core** (TASK-007-009, 033, 049-051) - Services & infrastructure
5. **Maps** (TASK-010-014, 048) - Smart map features
6. **Sessions** (TASK-015-019) - Parking sessions
7. **Payments** (TASK-020-025, 042) - Payment processing
8. **On-Street** (TASK-026-029) - On-street parking
9. **Account** (TASK-030-032, 043, 047) - User management
10. **Polish** (TASK-034-039, 044) - Quality & testing
11. **Deploy** (TASK-040, 045, 056, 057) - App store submission

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types
- Explicit return types for functions
- Interfaces over types

### React Native
- Functional components only
- Custom hooks for business logic
- Proper error boundaries
- Loading states for async operations

### Naming
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Files: Component files `PascalCase.tsx`, utilities `camelCase.ts`

### Commits
```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
test(scope): add tests
refactor(scope): refactor code
```

## Key Commands

```bash
# Development
make setup              # Install all dependencies
make dev                # Start Mock API + Metro + iOS
make dev-android        # Start Mock API + Metro + Android

# Running
npm start               # Metro bundler only
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator

# Quality
npm test                # Run unit tests
npm run lint            # Run ESLint
npm run typecheck       # Run TypeScript check

# Build
make build-ios          # Build iOS release
make build-android      # Build Android release
```

## Mock API

The mock API simulates the NRJSoft backend:

```bash
cd mock-api
npm run dev

# Endpoints at http://localhost:3001/api/v1/
# - POST /auth/otp-request
# - POST /auth/otp-verify
# - GET /parking/nearby
# - GET /sessions/active
# - POST /payments/intents
# etc.

# Test OTP: 123456 (always valid)
# Test Card: 4242 4242 4242 4242
```

## Environment Variables

Create `.env` file:
```bash
API_BASE_URL=http://localhost:3001/api/v1
GOOGLE_MAPS_API_KEY=your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## Testing Checklist

Before completing any task:
- [ ] Code compiles (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Works on iOS (`npm run ios`)
- [ ] Works on Android (`npm run android`)
- [ ] No console errors/warnings
- [ ] Accessibility labels present

## Important Notes

1. **Mock API First**: Always ensure mock-api is running before mobile development
2. **Both Platforms**: Test every feature on both iOS and Android
3. **Offline Support**: Implement graceful degradation for network errors
4. **Security**: Never store sensitive data in plain text
5. **Performance**: Use `useMemo`, `useCallback`, `React.memo` appropriately

## Getting Help

- Task details: `cat docs/tasks/task-XXX.md`
- Project overview: `cat AGENT.md`
- Task list: `cat docs/TASK-LIST.md`
