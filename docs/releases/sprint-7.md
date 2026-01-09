# Sprint 7: Testing & Deployment

**Status**: In Progress

## Goals
- Stabilize test coverage (unit + E2E) before store submission.
- Prepare CI/CD and release pipelines for Android/iOS.
- Document store readiness and outstanding blockers.

## Scope

### TASK-038: Testing Setup & Unit Tests
- [x] Jest configuration and coverage reporting
- [x] Unit tests for auth, payment, and session services
- [x] Component tests for core UI elements

### TASK-039: E2E Testing (Detox)
- [x] Detox configuration for iOS and Android
- [x] Smoke tests for auth, parking, payment, and on-street flows
- [ ] Android E2E build stability (pending native Gradle fixes)

### TASK-045: CI/CD Pipeline Setup
- [x] GitHub Actions workflows for lint/test/build
- [ ] Enable automated runs when CI billing hold is lifted

### TASK-040: App Store Submission & Go-Live
- [ ] App Store Connect setup and metadata
- [ ] Google Play Console setup and metadata
- [ ] Release checklists and submission notes

### TASK-056: iOS Deployment Preparation
- [ ] Certificates, provisioning profiles, and TestFlight setup

### TASK-057: Android Deployment Preparation
- [ ] Signing keys, Play Store internal track, and rollout config

## Deployment Checklist
- [ ] Detox E2E pass on Android and iOS
- [ ] Version bump and release notes updated
- [ ] Store metadata finalized (screenshots, descriptions, privacy policy)
