# TASK-LIST.md - NRJSoft Parking Mobile Application

## Overview

**Project Timeline**: 3 Months  
**Total Estimated Budget**: $29,000 USD  
**Total Tasks**: 57  
**Total Effort**: 400 hours

---

## Task Status Legend

- 🔴 **Not Started**
- 🟡 **In Progress**
- 🟢 **Completed**
- 🔵 **Blocked**

---

## Month 1: Foundations, Mock API & Authentication (140h)

### Phase 1.0: Mock Backend API (Week 1)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-052 | Mock Backend API Setup | Critical | 12h | None |
| TASK-053 | Mock Data Generator & Seeder | High | 6h | TASK-052 |
| TASK-054 | API Simulation Features | High | 6h | TASK-052 |

### Phase 1.1: Project Setup (Week 1-2)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-001 | Project Initialization & React Native Setup | Critical | 8h | TASK-052 |
| TASK-002 | Design System & Theme Configuration | High | 6h | TASK-001 |
| TASK-003 | Navigation Shell & Tab Structure | High | 8h | TASK-001, TASK-002 |
| TASK-041 | App Icon, Splash Screen & Assets | Medium | 4h | TASK-001 |
| TASK-055 | Development Environment Automation | High | 8h | TASK-001, TASK-052 |

### Phase 1.2: Authentication (Week 2-3)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-004 | Tutorial & Onboarding Screens | High | 8h | TASK-002, TASK-003 |
| TASK-005 | Authentication Screen & OTP Flow | Critical | 10h | TASK-003 |
| TASK-006 | Auth Service & Token Management | Critical | 8h | TASK-005 |
| TASK-046 | Social Login (Google & Apple) | High | 8h | TASK-005, TASK-006 |

### Phase 1.3: Core Services (Week 3-4)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-007 | API Client & Service Layer | Critical | 10h | TASK-001, TASK-052 |
| TASK-008 | Push Notification Service (FCM) | High | 8h | TASK-001, TASK-006 |
| TASK-009 | State Management (Redux Toolkit) | Critical | 6h | TASK-001 |
| TASK-033 | Localization (i18n) Setup | High | 8h | TASK-001 |
| TASK-049 | Offline Mode & Error States | High | 8h | TASK-007, TASK-009 |
| TASK-050 | Analytics & Crash Reporting | High | 6h | TASK-001 |
| TASK-051 | Security & Data Encryption | Critical | 8h | TASK-006 |

---

## Month 2: Smart Map, Sessions & Payments (118h)

### Phase 2.1: Smart Map (Week 5-6)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-010 | Google Maps Integration | Critical | 6h | TASK-001 |
| TASK-011 | Smart Map Home Screen | Critical | 12h | TASK-010, TASK-003 |
| TASK-012 | Parking Garage Pins & Markers | High | 8h | TASK-011 |
| TASK-013 | Garage Detail Bottom Sheet | High | 8h | TASK-012 |
| TASK-014 | Search Bar & Filters | Medium | 6h | TASK-011 |
| TASK-048 | External Navigation Integration | Medium | 4h | TASK-013 |

### Phase 2.2: Parking Sessions (Week 6-7)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-015 | QR Scanner Modal | High | 6h | TASK-001 |
| TASK-016 | Session Service & State | Critical | 8h | TASK-007, TASK-009 |
| TASK-017 | Active Parking Session Screen | Critical | 10h | TASK-016 |
| TASK-018 | Session Timer & Cost Calculator | High | 6h | TASK-017 |
| TASK-019 | Session Receipt & History | High | 6h | TASK-017, TASK-018 |

### Phase 2.3: Payments (Week 7-8)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-020 | Payment Service Integration | Critical | 10h | TASK-007 |
| TASK-021 | Payment Methods Screen | Critical | 8h | TASK-020 |
| TASK-022 | Card Payment (Stripe) | Critical | 8h | TASK-020, TASK-051 |
| TASK-023 | Apple Pay Integration | High | 6h | TASK-020 |
| TASK-024 | Google Pay Integration | High | 6h | TASK-020 |
| TASK-025 | Wallet Top-Up Flow | High | 8h | TASK-020, TASK-021 |
| TASK-042 | Subscriptions & Packages | Medium | 6h | TASK-021 |

---

## Month 3: On-Street, Account, Polish & Deploy (142h)

### Phase 3.1: On-Street Parking (Week 9)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-026 | On-Street Parking Service | Critical | 6h | TASK-007, TASK-010 |
| TASK-027 | On-Street Parking Screen | Critical | 12h | TASK-026, TASK-020 |
| TASK-028 | Countdown Timer & Notifications | High | 4h | TASK-027 |
| TASK-029 | Session Extend & Stop | High | 4h | TASK-027 |

### Phase 3.2: Account & Settings (Week 10)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-030 | Account Screen & Profile | High | 6h | TASK-006 |
| TASK-031 | Vehicle Management | High | 6h | TASK-030 |
| TASK-032 | Notification Preferences | Medium | 4h | TASK-030, TASK-008 |
| TASK-043 | Help & Support Screen | Low | 3h | TASK-030 |
| TASK-047 | OCR License Plate Scanning | Medium | 6h | TASK-031 |

### Phase 3.3: Notifications & Deep Linking (Week 10)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-034 | Notifications Inbox Screen | High | 6h | TASK-008 |
| TASK-035 | Deep Linking & QR Handling | High | 6h | TASK-003, TASK-034 |

### Phase 3.4: Polish & Quality (Week 11)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-036 | Error Handling & Edge Cases | High | 6h | All |
| TASK-037 | Performance Optimization | Medium | 6h | All |
| TASK-038 | Testing Setup & Unit Tests | High | 10h | TASK-001 |
| TASK-039 | E2E Testing with Detox | Medium | 8h | TASK-038 |
| TASK-044 | Accessibility (a11y) | Medium | 6h | All |

### Phase 3.5: Deployment (Week 12)

| Task ID | Task Name | Priority | Effort | Dependencies |
|---------|-----------|----------|--------|--------------|
| TASK-040 | App Store Submission & Go-Live | Critical | 8h | All |
| TASK-045 | CI/CD Pipeline Setup | High | 6h | TASK-001 |
| TASK-056 | iOS Deployment Preparation | Critical | 8h | TASK-040 |
| TASK-057 | Android Deployment Preparation | Critical | 8h | TASK-040 |

---

## Progress Summary

| Phase | Tasks | Hours |
|-------|-------|-------|
| Month 1 (Setup, Mock API & Auth) | 21 | 140h |
| Month 2 (Map, Sessions & Payments) | 18 | 118h |
| Month 3 (On-Street, Account & Deploy) | 18 | 142h |
| **Total** | **57** | **400h** |

---

## Critical Path

```
TASK-052 → TASK-001 → TASK-007 → TASK-020 → TASK-022 → TASK-040
  12h        8h        10h        10h         8h         8h = 56h
```

---

## Sprint Planning (2-week sprints)

### Sprint 1 (Week 1-2): Foundation & Mock API
TASK-052, TASK-053, TASK-054, TASK-001, TASK-002, TASK-003, TASK-041, TASK-055

### Sprint 2 (Week 3-4): Auth & Services
TASK-004, TASK-005, TASK-006, TASK-046, TASK-007, TASK-008, TASK-009, TASK-033

### Sprint 3 (Week 5-6): Maps & Infrastructure
TASK-010, TASK-011, TASK-012, TASK-013, TASK-014, TASK-048, TASK-049, TASK-050, TASK-051

### Sprint 4 (Week 7-8): Sessions & Payments
TASK-015, TASK-016, TASK-017, TASK-018, TASK-019, TASK-020, TASK-021, TASK-022, TASK-023, TASK-024

### Sprint 5 (Week 9-10): Payments & On-Street
TASK-025, TASK-042, TASK-026, TASK-027, TASK-028, TASK-029, TASK-030, TASK-031

### Sprint 6 (Week 11-12): Account & Polish
TASK-032, TASK-043, TASK-047, TASK-034, TASK-035, TASK-036, TASK-037, TASK-044

### Sprint 7 (Week 13): Testing & Deploy
TASK-038, TASK-039, TASK-040, TASK-045, TASK-056, TASK-057

---

## New Tasks Summary

| Task ID | Task Name | Category | Effort |
|---------|-----------|----------|--------|
| TASK-046 | Social Login (Google & Apple) | Auth | 8h |
| TASK-047 | OCR License Plate Scanning | Account | 6h |
| TASK-048 | External Navigation | Maps | 4h |
| TASK-049 | Offline Mode & Error States | Infrastructure | 8h |
| TASK-050 | Analytics & Crash Reporting | Infrastructure | 6h |
| TASK-051 | Security & Data Encryption | Security | 8h |
| TASK-052 | Mock Backend API Setup | Backend | 12h |
| TASK-053 | Mock Data Generator | Backend | 6h |
| TASK-054 | API Simulation Features | Backend | 6h |
| TASK-055 | Development Automation | DevOps | 8h |
| TASK-056 | iOS Deployment Prep | Deployment | 8h |
| TASK-057 | Android Deployment Prep | Deployment | 8h |

---

## Development Workflow

### Getting Started

```bash
# 1. Clone and setup
git clone <repo-url> nrjsoft-parking-app
cd nrjsoft-parking-app
make setup

# 2. Start development (iOS)
make dev

# 3. Or start development (Android)
make dev-android
```

### Task Workflow

```bash
# View all tasks
./scripts/agent.sh task:list

# Start a task
./scripts/agent.sh task:start 001

# When done
./scripts/agent.sh task:complete 001
```

### Mock API

```bash
# Start Mock API only
cd mock-api && npm run dev

# API Docs
open http://localhost:3001/api-docs

# Admin Dashboard
open http://localhost:3001/admin
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Auth   │  │  Maps   │  │ Payment │  │ Session │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│  ┌────┴────────────┴────────────┴────────────┴────┐        │
│  │              API Client (Axios)                 │        │
│  └────────────────────────┬────────────────────────┘        │
└───────────────────────────┼─────────────────────────────────┘
                            │
                  ┌─────────▼─────────┐
                  │    Mock API       │  (Development)
                  │    (Express)      │
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │   NRJSoft API     │  (Production)
                  │    (Backend)      │
                  └───────────────────┘
```

---

## Key Contacts

- **Client**: NRJ Soft
- **Provider**: EmeSoft JSC - www.emesoft.net
- **Phone**: (+84) 287 302 6868
