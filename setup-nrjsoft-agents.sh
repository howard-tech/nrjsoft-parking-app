#!/bin/bash

# ================================================================
# NRJSoft Parking - Multi-Agent Development Setup Script
# ================================================================
# This script creates all necessary files for multi-agent development
# Run this script from the root of your nrjsoft-parking-app repository
# ================================================================

set -e  # Exit on error

echo "🚀 NRJSoft Parking - Multi-Agent Development Setup"
echo "=================================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository!"
    echo "Please run this script from the root of nrjsoft-parking-app"
    exit 1
fi

echo "📁 Creating directory structure..."

# Create directory structure
mkdir -p .agent-context/{handoffs,decisions,blockers,status,reviews}
mkdir -p docs/tasks
mkdir -p docs/brd

echo "✅ Directories created"

# ================================================================
# AGENT.md - Main agent guide
# ================================================================
echo "📝 Creating AGENT.md..."

cat > AGENT.md << 'AGENT_EOF'
# NRJSoft Parking - Multi-Agent Development Guide

## Project Overview

**Project Name:** NRJSoft Parking Mobile Application  
**Client:** NRJ Soft  
**Budget:** $29,000 USD  
**Timeline:** 3 months  
**Framework:** React Native (Hybrid)  
**Platforms:** iOS & Android

## Agent Team Structure

### 🤖 Agent Roster

| Agent ID | Name | Primary Role | Tools/IDE | Expertise |
|----------|------|--------------|-----------|-----------|
| `AG-01` | **Codex** | Frontend Lead | OpenAI Codex CLI | React Native UI, Components, Styling |
| `AG-02` | **Claude Code** | Architecture & Integration Lead | Claude Code CLI | API Integration, State Management, Complex Logic |
| `AG-03` | **Cursor** | Feature Developer | Cursor IDE | Full-stack Features, Cross-cutting Concerns |
| `AG-04` | **Aider** | Code Review & Refactor | Aider CLI | Code Quality, Performance, Git Operations |
| `AG-05` | **Windsurf** | DevOps & QA Lead | Windsurf IDE | CI/CD, Testing, Build Automation |

---

## Agent Responsibilities

### AG-01: Codex (Frontend Lead)
```yaml
Primary Tasks:
  - React Native component development
  - UI/UX implementation from Figma/Prototypes
  - Styling and theming (NRJ Soft branding)
  - Animation and micro-interactions
  - Responsive layouts

Assigned Modules:
  - Tutorial & Onboarding (TASK-001 to TASK-005)
  - Home / Smart Map UI (TASK-016 to TASK-022)
  - Active Parking Session UI (TASK-036 to TASK-040)

Output Standards:
  - Components in src/components/
  - Screens in src/screens/
  - Use TypeScript with strict mode
  - Follow Atomic Design principles
```

### AG-02: Claude Code (Architecture & Integration Lead)
```yaml
Primary Tasks:
  - Project architecture decisions
  - API integration with NRJ Backend
  - Redux/Zustand state management
  - Complex business logic
  - Authentication flow

Assigned Modules:
  - Authentication (TASK-006 to TASK-015)
  - Payment Integration (TASK-028 to TASK-035)
  - API Service Layer (TASK-050 to TASK-055)

Output Standards:
  - Services in src/services/
  - State management in src/store/
  - Types in src/types/
  - Document all API contracts
```

### AG-03: Cursor (Feature Developer)
```yaml
Primary Tasks:
  - End-to-end feature implementation
  - Cross-module integration
  - Feature-specific state management
  - Unit tests for features

Assigned Modules:
  - On-Street Parking (TASK-023 to TASK-027)
  - Account & Settings (TASK-041 to TASK-045)
  - Notifications (TASK-046 to TASK-049)

Output Standards:
  - Feature folders in src/features/
  - Co-located tests (*.test.tsx)
  - Feature documentation in docs/
```

### AG-04: Aider (Code Review & Refactor)
```yaml
Primary Tasks:
  - Code review all PRs
  - Refactoring for performance
  - Ensure coding standards
  - Technical debt management
  - Git operations and merging

Responsibilities:
  - Review every PR before merge
  - Maintain code quality metrics
  - Performance optimization
  - Security review

Commands:
  /review - Review current changes
  /refactor - Suggest refactoring
  /security - Security audit
  /performance - Performance check
```

### AG-05: Windsurf (DevOps & QA Lead)
```yaml
Primary Tasks:
  - CI/CD pipeline setup
  - Automated testing infrastructure
  - Build configuration (iOS/Android)
  - Environment management
  - Release automation

Assigned Modules:
  - Project Setup (TASK-056 to TASK-060)
  - CI/CD Pipeline (TASK-061 to TASK-065)
  - Go-Live Support (TASK-066 to TASK-070)

Output Standards:
  - CI configs in .github/workflows/
  - Build scripts in scripts/
  - Documentation in docs/deployment/
```

---

## Communication Protocol

### 📁 Shared Context Directory Structure

```
nrjsoft-parking/
├── .agent-context/              # Agent communication hub
│   ├── handoffs/                # Task handoff documents
│   ├── decisions/               # Architecture Decision Records
│   ├── blockers/                # Current blockers
│   ├── status/                  # Daily status updates
│   └── reviews/                 # Human review requests
├── docs/
│   ├── TASK-LIST.md             # Master task list
│   ├── tasks/                   # Individual task details
│   └── brd/                     # Business Requirements
└── src/                         # Source code
```

### 📨 Handoff Protocol

When an agent completes a task that another agent depends on:

1. **Create Handoff Document** in `.agent-context/handoffs/`
2. **Update Task Status** in `docs/TASK-LIST.md`
3. **Tag Dependencies** with status

**Handoff Document Template:**
```markdown
# Handoff: [TASK-ID] → [TASK-ID]
From: AG-XX (Agent Name)
To: AG-XX (Agent Name)
Date: YYYY-MM-DD

## Completed Work
- [x] Item 1
- [x] Item 2

## Files Changed
- src/components/Button.tsx

## Notes for Next Agent
- Important consideration 1

## Blockers Resolved
- None
```

### 🔄 Status Update Protocol

Each agent updates `.agent-context/status/YYYY-MM-DD-AGXX.md`:

```markdown
# Status Update - AG-XX (Agent Name)
Date: YYYY-MM-DD

## Today's Progress
- [ ] TASK-XXX: Description (50%)
- [x] TASK-YYY: Description (100%)

## Blockers
- Waiting for API spec from AG-02

## Tomorrow's Plan
- Complete TASK-XXX
```

---

## Task Assignment Matrix

| Module | Primary Agent | Support Agent | Human Review Points |
|--------|---------------|---------------|---------------------|
| Tutorial & Onboarding | AG-01 Codex | AG-03 Cursor | UI approval |
| Authentication | AG-02 Claude | AG-04 Aider | Security review |
| Home / Smart Map | AG-01 Codex | AG-02 Claude | Map integration |
| On-Street Parking | AG-03 Cursor | AG-02 Claude | Payment flow |
| Payment | AG-02 Claude | AG-04 Aider | Security + compliance |
| Active Session | AG-01 Codex | AG-03 Cursor | Real-time updates |
| History & Invoice | AG-03 Cursor | AG-01 Codex | PDF generation |
| Account & Settings | AG-03 Cursor | AG-01 Codex | GDPR compliance |
| Notifications | AG-03 Cursor | AG-05 Windsurf | FCM setup |
| CI/CD & DevOps | AG-05 Windsurf | AG-04 Aider | Pipeline approval |

---

## Human-in-the-Loop Checkpoints

### 🔍 Mandatory Review Points

```yaml
Phase 1 - Foundation (Week 1-4):
  - [ ] Architecture Decision Review (ADR-001 to ADR-005)
  - [ ] Authentication Flow Approval
  - [ ] API Contract Review
  - [ ] Design System Approval

Phase 2 - Core Features (Week 5-8):
  - [ ] Smart Map Integration Test
  - [ ] Payment Flow Security Audit
  - [ ] Session Management Logic Review

Phase 3 - Completion (Week 9-12):
  - [ ] Full Integration Test
  - [ ] Performance Audit
  - [ ] Security Penetration Test
  - [ ] UAT Sign-off
  - [ ] App Store Submission Review
```

---

## Git Workflow

### Branch Strategy

```
main                    # Production-ready code
├── develop             # Integration branch
│   ├── feature/AG01-*  # Codex features
│   ├── feature/AG02-*  # Claude Code features
│   ├── feature/AG03-*  # Cursor features
│   ├── fix/AG04-*      # Aider fixes
│   └── infra/AG05-*    # Windsurf infrastructure
```

### Commit Convention

```
[AG-XX] type(scope): description

Types: feat, fix, refactor, docs, test, chore
Scope: auth, map, payment, session, etc.

Example:
[AG-01] feat(onboarding): implement tutorial carousel
[AG-02] fix(auth): handle token refresh edge case
```

---

## Quick Commands Reference

```bash
# Codex (AG-01)
codex --task "TASK-001" --context ".agent-context/"

# Claude Code (AG-02)
claude --project nrjsoft-parking --task TASK-006

# Cursor (AG-03)
# Open project in Cursor IDE, reference TASK-XXX.md

# Aider (AG-04)
aider --read docs/TASK-LIST.md --message "Review PR #XX"

# Windsurf (AG-05)
# Open project in Windsurf, use cascade for CI/CD tasks
```

---

## Success Metrics

| Metric | Target | Measured By |
|--------|--------|-------------|
| Task Completion Rate | 95% on time | AG-04 tracking |
| Code Quality Score | > 80% | SonarQube/ESLint |
| Test Coverage | > 70% | Jest coverage |
| BRD Compliance | 100% | Human verification |

---

## Getting Started

1. Read `docs/TASK-LIST.md`
2. Find your assigned tasks
3. Read relevant `docs/tasks/TASK-XXX.md`
4. Check `.agent-context/` for context
5. Start coding!
6. Create handoff when done
7. Update status daily

**Remember:** Quality > Speed. When in doubt, ask for human review.
AGENT_EOF

echo "✅ AGENT.md created"

# ================================================================
# TASK-LIST.md - Master task list
# ================================================================
echo "📝 Creating docs/TASK-LIST.md..."

cat > docs/TASK-LIST.md << 'TASKLIST_EOF'
# NRJSoft Parking - Task List

## Project Summary

| Field | Value |
|-------|-------|
| Total Tasks | 111 |
| Total Budget | $29,000 USD |
| Timeline | 12 weeks (3 months) |
| Start Date | TBD |
| Target Go-Live | TBD + 12 weeks |

---

## Task Status Legend

| Status | Symbol | Description |
|--------|--------|-------------|
| Not Started | ⬜ | Task not yet assigned |
| In Progress | 🟨 | Agent actively working |
| Blocked | 🟥 | Waiting on dependency |
| Review | 🟦 | Awaiting human/agent review |
| Complete | ✅ | Done and verified |

---

## Sprint Overview

| Sprint | Weeks | Focus | Budget Allocation |
|--------|-------|-------|-------------------|
| Sprint 1 | 1-2 | Project Setup & Foundation | $3,000 |
| Sprint 2 | 3-4 | Authentication & Navigation | $4,200 |
| Sprint 3 | 5-6 | Smart Map & Core UI | $5,700 |
| Sprint 4 | 7-8 | Payments & Sessions | $9,400 |
| Sprint 5 | 9-10 | On-Street & Features | $4,600 |
| Sprint 6 | 11-12 | Polish, Testing & Go-Live | $2,100 |

---

## Sprint 1: Project Setup & Foundation (Weeks 1-2)

### Project Initialization

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-001 | Initialize React Native project with TypeScript | AG-05 | ⬜ | None | 4 |
| TASK-002 | Setup ESLint, Prettier, and code formatting | AG-05 | ⬜ | TASK-001 | 2 |
| TASK-003 | Configure Git repository and branch protection | AG-05 | ⬜ | TASK-001 | 2 |
| TASK-004 | Setup project folder structure (Atomic Design) | AG-02 | ⬜ | TASK-001 | 3 |
| TASK-005 | Create base TypeScript types and interfaces | AG-02 | ⬜ | TASK-004 | 4 |

### Design System

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-006 | Implement NRJ Soft color palette and theme | AG-01 | ⬜ | TASK-004 | 3 |
| TASK-007 | Create typography system (fonts, sizes) | AG-01 | ⬜ | TASK-006 | 2 |
| TASK-008 | Build reusable Button component | AG-01 | ⬜ | TASK-007 | 3 |
| TASK-009 | Build reusable Input component | AG-01 | ⬜ | TASK-007 | 3 |
| TASK-010 | Build reusable Card component | AG-01 | ⬜ | TASK-007 | 2 |
| TASK-011 | Build reusable Modal/BottomSheet component | AG-01 | ⬜ | TASK-007 | 4 |
| TASK-012 | Create icon library setup | AG-01 | ⬜ | TASK-006 | 2 |

### Infrastructure

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-013 | Setup environment configuration (.env) | AG-05 | ⬜ | TASK-001 | 2 |
| TASK-014 | Configure iOS project (Xcode, Bundle ID) | AG-05 | ⬜ | TASK-001 | 4 |
| TASK-015 | Configure Android project (Gradle, Package) | AG-05 | ⬜ | TASK-001 | 4 |

---

## Sprint 2: Authentication & Navigation (Weeks 3-4)

### Navigation Setup

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-016 | Install and configure React Navigation | AG-02 | ⬜ | TASK-004 | 3 |
| TASK-017 | Create Bottom Tab Navigator shell | AG-01 | ⬜ | TASK-016 | 4 |
| TASK-018 | Create Auth Stack Navigator | AG-02 | ⬜ | TASK-016 | 3 |
| TASK-019 | Implement navigation types and guards | AG-02 | ⬜ | TASK-018 | 3 |

### Tutorial & Onboarding ($1,700)

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-020 | Build Tutorial Carousel component | AG-01 | ⬜ | TASK-011 | 4 |
| TASK-021 | Implement language selector (EU multi-language) | AG-03 | ⬜ | TASK-020 | 6 |
| TASK-022 | Create onboarding screens (3 slides) | AG-01 | ⬜ | TASK-020 | 4 |
| TASK-023 | Add Help Hotline tap-to-call feature | AG-03 | ⬜ | TASK-022 | 2 |
| TASK-024 | Implement onboarding completion persistence | AG-02 | ⬜ | TASK-022 | 2 |

### Authentication ($2,500)

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-025 | Create Authentication screen UI | AG-01 | ⬜ | TASK-018 | 4 |
| TASK-026 | Implement phone number input with country code | AG-01 | ⬜ | TASK-025 | 3 |
| TASK-027 | Build OTP input component | AG-01 | ⬜ | TASK-025 | 4 |
| TASK-028 | Create API service for OTP request/verify | AG-02 | ⬜ | TASK-005 | 4 |
| TASK-029 | Implement secure token storage (Keychain/Keystore) | AG-02 | ⬜ | TASK-028 | 4 |
| TASK-030 | Add Google Sign-In integration | AG-02 | ⬜ | TASK-025 | 6 |
| TASK-031 | Add Apple Sign-In integration | AG-02 | ⬜ | TASK-025 | 6 |
| TASK-032 | Implement GDPR consent checkbox and flow | AG-03 | ⬜ | TASK-025 | 3 |
| TASK-033 | Create token refresh mechanism | AG-02 | ⬜ | TASK-029 | 4 |
| TASK-034 | Setup Firebase Cloud Messaging (FCM) | AG-05 | ⬜ | TASK-015 | 4 |
| TASK-035 | Register device push token | AG-02 | ⬜ | TASK-034 | 3 |

---

## Sprint 3: Smart Map & Core UI (Weeks 5-6)

### Home / Smart Map ($5,700)

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-036 | Integrate Google Maps SDK | AG-02 | ⬜ | TASK-015 | 6 |
| TASK-037 | Implement user GPS location tracking | AG-02 | ⬜ | TASK-036 | 4 |
| TASK-038 | Create map marker component (garage pins) | AG-01 | ⬜ | TASK-036 | 4 |
| TASK-039 | Build Parking Cards Carousel | AG-01 | ⬜ | TASK-010 | 6 |
| TASK-040 | Create Garage Detail Bottom Sheet | AG-01 | ⬜ | TASK-011 | 6 |
| TASK-041 | Implement garage search bar with autocomplete | AG-03 | ⬜ | TASK-036 | 5 |
| TASK-042 | Create GET /parking/nearby API integration | AG-02 | ⬜ | TASK-037 | 4 |
| TASK-043 | Add external navigation deep link | AG-03 | ⬜ | TASK-040 | 3 |
| TASK-044 | Build QR Scanner screen | AG-03 | ⬜ | TASK-040 | 6 |
| TASK-045 | Implement QR code parsing and validation | AG-02 | ⬜ | TASK-044 | 4 |
| TASK-046 | Display garage availability indicators | AG-01 | ⬜ | TASK-038 | 3 |
| TASK-047 | Show pricing and policy badges | AG-01 | ⬜ | TASK-040 | 3 |
| TASK-048 | Add entry method tags (ANPR/QR) | AG-01 | ⬜ | TASK-040 | 2 |

---

## Sprint 4: Payments & Sessions (Weeks 7-8)

### Payment System ($4,900)

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-049 | Create Payment screen UI layout | AG-01 | ⬜ | TASK-017 | 4 |
| TASK-050 | Implement Wallet Balance display | AG-01 | ⬜ | TASK-049 | 3 |
| TASK-051 | Build Top-Up amount selector | AG-01 | ⬜ | TASK-050 | 3 |
| TASK-052 | Create GET /wallet API integration | AG-02 | ⬜ | TASK-050 | 3 |
| TASK-053 | Implement POST /wallet/topup-intent | AG-02 | ⬜ | TASK-052 | 4 |
| TASK-054 | Add Stripe payment integration | AG-02 | ⬜ | TASK-053 | 8 |
| TASK-055 | Implement Apple Pay integration | AG-02 | ⬜ | TASK-049 | 6 |
| TASK-056 | Implement Google Pay integration | AG-02 | ⬜ | TASK-049 | 6 |
| TASK-057 | Build saved card management UI | AG-03 | ⬜ | TASK-049 | 4 |
| TASK-058 | Create secure card vaulting flow | AG-02 | ⬜ | TASK-054 | 5 |
| TASK-059 | Implement auto-reload toggle | AG-03 | ⬜ | TASK-052 | 3 |
| TASK-060 | Build Subscription plans screen | AG-03 | ⬜ | TASK-049 | 5 |

### Active Parking Session ($4,500)

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-061 | Create Active Session screen UI | AG-01 | ⬜ | TASK-017 | 4 |
| TASK-062 | Implement live timer (count up) | AG-03 | ⬜ | TASK-061 | 3 |
| TASK-063 | Build live cost estimation display | AG-03 | ⬜ | TASK-062 | 3 |
| TASK-064 | Create Wallet Projection visual bar | AG-01 | ⬜ | TASK-061 | 3 |
| TASK-065 | Implement low balance warning UI | AG-01 | ⬜ | TASK-064 | 2 |
| TASK-066 | Add Top-Up Now emergency button | AG-01 | ⬜ | TASK-065 | 2 |
| TASK-067 | Create GET /sessions/active API integration | AG-02 | ⬜ | TASK-061 | 4 |
| TASK-068 | Implement session status WebSocket/polling | AG-02 | ⬜ | TASK-067 | 5 |
| TASK-069 | Handle SESSION_START webhook/push | AG-02 | ⬜ | TASK-034 | 4 |
| TASK-070 | Handle SESSION_END and show receipt | AG-02 | ⬜ | TASK-069 | 4 |

---

## Sprint 5: On-Street & Features (Weeks 9-10)

### On-Street Parking ($5,000)

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-071 | Create On-Street Parking screen UI | AG-03 | ⬜ | TASK-017 | 4 |
| TASK-072 | Implement city/zone detection from GPS | AG-02 | ⬜ | TASK-037 | 4 |
| TASK-073 | Build city/zone manual selector | AG-03 | ⬜ | TASK-071 | 3 |
| TASK-074 | Create duration selector (+ / − controls) | AG-01 | ⬜ | TASK-071 | 3 |
| TASK-075 | Implement GET /onstreet/zones API | AG-02 | ⬜ | TASK-072 | 3 |
| TASK-076 | Implement POST /onstreet/quote API | AG-02 | ⬜ | TASK-075 | 3 |
| TASK-077 | Build prepay payment confirmation modal | AG-03 | ⬜ | TASK-071 | 4 |
| TASK-078 | Create countdown timer for on-street session | AG-03 | ⬜ | TASK-077 | 4 |
| TASK-079 | Implement extend time functionality | AG-03 | ⬜ | TASK-078 | 4 |
| TASK-080 | Add expiry reminder notifications | AG-02 | ⬜ | TASK-078 | 4 |

### Account & Settings ($2,100)

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-081 | Create Account screen with tabs | AG-03 | ⬜ | TASK-017 | 4 |
| TASK-082 | Build Profile management form | AG-03 | ⬜ | TASK-081 | 4 |
| TASK-083 | Create Vehicle management screen | AG-03 | ⬜ | TASK-081 | 5 |
| TASK-084 | Implement OCR license plate scanning | AG-02 | ⬜ | TASK-083 | 6 |
| TASK-085 | Build Notification preferences UI | AG-03 | ⬜ | TASK-081 | 3 |
| TASK-086 | Add Payment preferences screen | AG-03 | ⬜ | TASK-081 | 3 |
| TASK-087 | Implement GDPR account deletion flow | AG-02 | ⬜ | TASK-081 | 4 |

### History & Invoice ($2,500)

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-088 | Create History screen with session list | AG-03 | ⬜ | TASK-017 | 4 |
| TASK-089 | Build session filter component | AG-01 | ⬜ | TASK-088 | 3 |
| TASK-090 | Create session detail modal | AG-03 | ⬜ | TASK-088 | 4 |
| TASK-091 | Implement PDF receipt generation | AG-02 | ⬜ | TASK-090 | 5 |
| TASK-092 | Add wallet transaction history | AG-03 | ⬜ | TASK-088 | 3 |

---

## Sprint 6: Polish, Testing & Go-Live (Weeks 11-12)

### Notifications ($2,100)

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-093 | Create Notifications Inbox screen | AG-03 | ⬜ | TASK-017 | 4 |
| TASK-094 | Implement notification categories | AG-03 | ⬜ | TASK-093 | 3 |
| TASK-095 | Add deep linking from notifications | AG-02 | ⬜ | TASK-093 | 4 |
| TASK-096 | Handle push notification display | AG-02 | ⬜ | TASK-034 | 3 |

### Testing & QA

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-097 | Setup Jest and React Native Testing Library | AG-05 | ⬜ | TASK-001 | 3 |
| TASK-098 | Write unit tests for core components | AG-04 | ⬜ | TASK-097 | 8 |
| TASK-099 | Setup Detox for E2E testing | AG-05 | ⬜ | TASK-097 | 4 |
| TASK-100 | Write E2E tests for critical flows | AG-04 | ⬜ | TASK-099 | 8 |
| TASK-101 | Performance optimization audit | AG-04 | ⬜ | All UI | 6 |
| TASK-102 | Security audit and fixes | AG-04 | ⬜ | All API | 8 |

### CI/CD & Deployment

| Task ID | Task Name | Agent | Status | Dependencies | Est. Hours |
|---------|-----------|-------|--------|--------------|------------|
| TASK-103 | Setup GitHub Actions CI pipeline | AG-05 | ⬜ | TASK-003 | 4 |
| TASK-104 | Configure Fastlane for iOS | AG-05 | ⬜ | TASK-014 | 5 |
| TASK-105 | Configure Fastlane for Android | AG-05 | ⬜ | TASK-015 | 5 |
| TASK-106 | Setup TestFlight distribution | AG-05 | ⬜ | TASK-104 | 3 |
| TASK-107 | Setup Google Play Internal Testing | AG-05 | ⬜ | TASK-105 | 3 |
| TASK-108 | Prepare App Store metadata | AG-05 | ⬜ | TASK-106 | 4 |
| TASK-109 | Prepare Play Store metadata | AG-05 | ⬜ | TASK-107 | 4 |
| TASK-110 | Submit to App Store | AG-05 | ⬜ | TASK-108 | 2 |
| TASK-111 | Submit to Play Store | AG-05 | ⬜ | TASK-109 | 2 |

---

## Task Summary by Agent

| Agent | Total Tasks | Estimated Hours |
|-------|-------------|-----------------|
| AG-01 (Codex) | 28 | 95 |
| AG-02 (Claude Code) | 32 | 128 |
| AG-03 (Cursor) | 25 | 92 |
| AG-04 (Aider) | 4 | 30 |
| AG-05 (Windsurf) | 16 | 55 |

---

## Critical Path Tasks

1. **TASK-001** → Project initialization
2. **TASK-028** → Auth API (blocks all authenticated features)
3. **TASK-036** → Maps SDK (blocks Smart Map)
4. **TASK-054** → Stripe integration (blocks payments)
5. **TASK-069** → Session webhooks (blocks real-time features)
6. **TASK-103** → CI/CD (blocks automated deployments)

---

## Human Review Checkpoints

| Checkpoint | After Task | Review Focus |
|------------|------------|--------------|
| CP-1 | TASK-015 | Project setup complete |
| CP-2 | TASK-035 | Authentication working |
| CP-3 | TASK-048 | Smart Map integrated |
| CP-4 | TASK-070 | Payments & Sessions complete |
| CP-5 | TASK-092 | All features implemented |
| CP-6 | TASK-102 | Security audit passed |
| CP-7 | TASK-111 | Ready for go-live |
TASKLIST_EOF

echo "✅ docs/TASK-LIST.md created"

# ================================================================
# Sample Task Detail Files
# ================================================================
echo "📝 Creating sample task detail files..."

# TASK-001
cat > docs/tasks/TASK-001.md << 'TASK001_EOF'
# TASK-001: Initialize React Native Project with TypeScript

## Task Metadata

| Field | Value |
|-------|-------|
| Task ID | TASK-001 |
| Sprint | Sprint 1 |
| Module | Project Setup |
| Assigned Agent | AG-05 (Windsurf) |
| Status | ⬜ Not Started |
| Priority | P0 - Critical Path |
| Estimated Hours | 4 |
| Dependencies | None |
| Blocks | TASK-002 to TASK-015 |

---

## Objective

Initialize a new React Native project with TypeScript template for NRJSoft Parking app.

---

## Acceptance Criteria

- [ ] React Native project created with TypeScript template
- [ ] Project name: "NRJSoftParking"
- [ ] Bundle ID iOS: `com.nrjsoft.parking`
- [ ] Package name Android: `com.nrjsoft.parking`
- [ ] TypeScript strict mode enabled
- [ ] Path aliases configured (@components, @screens, etc.)
- [ ] Builds successfully on iOS Simulator
- [ ] Builds successfully on Android Emulator

---

## Implementation Steps

### Step 1: Create Project
```bash
npx react-native@latest init NRJSoftParking --template react-native-template-typescript
```

### Step 2: Setup Folder Structure
```
src/
├── assets/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── screens/
├── navigation/
├── services/
├── store/
├── hooks/
├── utils/
├── types/
├── constants/
├── i18n/
└── theme/
```

### Step 3: Configure TypeScript Path Aliases

Update `tsconfig.json` and `babel.config.js` for path aliases.

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] PR created with commit: `[AG-05] chore(init): initialize RN project`
- [ ] AG-04 code review passed
- [ ] Human CP-1 approved
TASK001_EOF

# TASK-036
cat > docs/tasks/TASK-036.md << 'TASK036_EOF'
# TASK-036: Integrate Google Maps SDK

## Task Metadata

| Field | Value |
|-------|-------|
| Task ID | TASK-036 |
| Sprint | Sprint 3 |
| Module | Home / Smart Map |
| Assigned Agent | AG-02 (Claude Code) |
| Status | ⬜ Not Started |
| Priority | P0 - Critical Path |
| Estimated Hours | 6 |
| Dependencies | TASK-015 |
| Blocks | TASK-037 to TASK-048 |

---

## BRD Reference

**Section:** 3.3 Home / Smart Map  
**Requirement:** Maps Service: Google Maps SDK

---

## Objective

Integrate Google Maps SDK for parking location discovery and navigation.

---

## Acceptance Criteria

- [ ] Google Maps displays on iOS and Android
- [ ] Custom map styling (NRJ branding)
- [ ] Support zoom/pan gestures
- [ ] API keys secured via environment variables
- [ ] Map loads within 2 seconds

---

## Technical Specifications

### Dependencies
```json
{
  "react-native-maps": "^1.8.0"
}
```

### Component Interface
```typescript
interface SmartMapProps {
  initialRegion?: MapRegion;
  parkingLocations?: ParkingLocation[];
  onLocationSelect?: (location: ParkingLocation) => void;
  showUserLocation?: boolean;
}
```

---

## Security Notes

- API keys restricted by bundle ID in Google Cloud Console
- Keys stored in .env (not committed)
- Different keys for iOS/Android

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests passing
- [ ] Security review by AG-04
- [ ] Handoff created for TASK-037, TASK-038
TASK036_EOF

# TASK-054
cat > docs/tasks/TASK-054.md << 'TASK054_EOF'
# TASK-054: Add Stripe Payment Integration

## Task Metadata

| Field | Value |
|-------|-------|
| Task ID | TASK-054 |
| Sprint | Sprint 4 |
| Module | Payment |
| Assigned Agent | AG-02 (Claude Code) |
| Status | ⬜ Not Started |
| Priority | P0 - Critical Path |
| Estimated Hours | 8 |
| Dependencies | TASK-053 |
| Security Review | **REQUIRED** |

---

## BRD Reference

**Section:** 3.5 Payment, 4.3 Payment Data Flow  
**Requirement:** Secure Card Vaulting, PCI DSS Compliance

---

## Objective

Integrate Stripe SDK for secure payment processing with cards, Apple Pay, and Google Pay support.

---

## Acceptance Criteria

- [ ] Stripe Payment Sheet works on iOS/Android
- [ ] Card payment completes in test mode
- [ ] 3D Secure (SCA) authentication supported
- [ ] NO card data passes through app
- [ ] Error messages user-friendly

---

## ⚠️ SECURITY REQUIREMENTS

### MANDATORY
1. **Never log card data** - Only log payment intent IDs
2. **Use Stripe's hosted UI** - Payment Sheet only
3. **Secret key on backend only** - Only publishable key in app
4. **PCI DSS compliance** - Stripe handles all card data

### Forbidden Actions
```typescript
// ❌ NEVER DO THIS
console.log('Card:', cardNumber);
const card = { number: '4242...' };

// ✅ CORRECT
console.log('PaymentIntent:', paymentIntentId);
```

---

## Implementation Steps

1. Install `@stripe/stripe-react-native`
2. Configure StripeProvider with publishable key
3. Create payment service for backend communication
4. Implement `useStripePayment` hook
5. Build PaymentButton component

---

## Test Cards (Stripe Test Mode)

| Card | Scenario |
|------|----------|
| 4242424242424242 | Success |
| 4000000000000002 | Declined |
| 4000002500003155 | 3DS Required |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] **AG-04 Security Review PASSED**
- [ ] **Human Security Checkpoint APPROVED**
- [ ] Integration tested with backend
TASK054_EOF

echo "✅ Task detail files created"

# ================================================================
# Agent Context Files
# ================================================================
echo "📝 Creating agent context files..."

# ADR README
cat > .agent-context/decisions/README.md << 'ADR_EOF'
# Architecture Decision Records (ADR)

## Index

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | State Management | Accepted |
| ADR-002 | API Integration | Accepted |
| ADR-003 | Map Provider | Accepted |
| ADR-004 | Payment Provider | Accepted |
| ADR-005 | i18n Strategy | Proposed |

---

# ADR-001: State Management

**Status:** Accepted

**Decision:** Use **Zustand** for client state + **React Query** for server state.

**Reasoning:** Simple API, great TypeScript support, minimal boilerplate.

---

# ADR-002: API Integration

**Status:** Accepted

**Decision:** Use **Axios** with interceptors + **React Query** hooks.

---

# ADR-003: Map Provider

**Status:** Accepted

**Decision:** Use **Google Maps SDK** via react-native-maps.

---

# ADR-004: Payment Provider

**Status:** Accepted

**Decision:** Use **Stripe** for all payment processing.

**Security:** PCI DSS compliant, no card data in app.

---

# ADR-005: Internationalization

**Status:** Proposed

**Decision:** Use **react-i18next** + react-native-localize.

**Languages:** English, Bulgarian, German, French
ADR_EOF

# Review Guide
cat > .agent-context/reviews/REVIEW-GUIDE.md << 'REVIEW_EOF'
# Human Review Checkpoints

## Checkpoint Schedule

| CP | After Sprint | Focus | Critical |
|----|--------------|-------|----------|
| CP-1 | Sprint 1 | Project Setup | Yes |
| CP-2 | Sprint 2 | Authentication | Yes |
| CP-3 | Sprint 3 | Smart Map | Yes |
| CP-4 | Sprint 4 | **Payments** | **CRITICAL** |
| CP-5 | Sprint 5 | All Features | Yes |
| CP-6 | Sprint 6 | **Security Audit** | **CRITICAL** |
| CP-7 | Pre-launch | Final Review | **CRITICAL** |

---

## CP-4: Payment Review (CRITICAL)

### Security Checklist

- [ ] NO card numbers in logs
- [ ] NO card data in state
- [ ] All card handling via Stripe SDK
- [ ] Only publishable key in app
- [ ] Secret key ONLY on backend

### If Security Issues Found:
1. **STOP DEPLOYMENT**
2. Document in `.agent-context/blockers/`
3. Assign to AG-04 for immediate fix
4. Re-review before proceeding

---

## How to Request Review

Create file in `.agent-context/reviews/`:

```markdown
# Review Request: CP-X
Agent: AG-XX
Date: YYYY-MM-DD

## Summary
[Brief description]

## Files to Review
[Key files]

## Questions
[Any questions]
```
REVIEW_EOF

# Sample Handoff
cat > .agent-context/handoffs/TEMPLATE.md << 'HANDOFF_EOF'
# Handoff Template

## Use this template when completing a task

---

# Handoff: TASK-XXX → TASK-YYY

**From:** AG-XX (Agent Name)  
**To:** AG-XX (Agent Name)  
**Date:** YYYY-MM-DD

## Completed Work
- [x] Item 1
- [x] Item 2

## Files Changed
- path/to/file1.tsx
- path/to/file2.ts

## API Contracts / Interfaces
```typescript
// Include relevant interfaces
```

## Notes for Next Agent
- Important consideration 1
- Watch out for X

## Blockers
- None

---

**Handoff Complete** ✅
HANDOFF_EOF

# Placeholder files
touch .agent-context/blockers/.gitkeep
touch .agent-context/status/.gitkeep

echo "✅ Agent context files created"

# ================================================================
# Create .gitignore additions
# ================================================================
echo "📝 Updating .gitignore..."

cat >> .gitignore << 'GITIGNORE_EOF'

# Agent Context - Keep structure but not sensitive status
.agent-context/status/*.md
!.agent-context/status/.gitkeep

# Environment files
.env
.env.local
.env.*.local

# API Keys
google-services.json
GoogleService-Info.plist
GITIGNORE_EOF

echo "✅ .gitignore updated"

# ================================================================
# Summary
# ================================================================
echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "Created files:"
echo "  📄 AGENT.md"
echo "  📄 docs/TASK-LIST.md"
echo "  📄 docs/tasks/TASK-001.md"
echo "  📄 docs/tasks/TASK-036.md"
echo "  📄 docs/tasks/TASK-054.md"
echo "  📄 .agent-context/decisions/README.md"
echo "  📄 .agent-context/reviews/REVIEW-GUIDE.md"
echo "  📄 .agent-context/handoffs/TEMPLATE.md"
echo ""
echo "Next steps:"
echo "  1. Review the created files"
echo "  2. git add ."
echo "  3. git commit -m '[AG-00] docs: add multi-agent development framework'"
echo "  4. git push origin main"
echo ""
echo "=================================================="
