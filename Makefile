.PHONY: all setup dev dev-android ios android api test test-coverage lint lint-fix typecheck clean reset build-ios build-android deploy-ios-beta deploy-android-internal help

# Project variables
DEV_SCRIPT = ./scripts/dev.sh

# Default target
all: help

# Setup development environment
setup:
	@chmod +x $(DEV_SCRIPT)
	@$(DEV_SCRIPT) setup

# Start development (iOS)
dev:
	@$(DEV_SCRIPT) ios

# Start development (Android)
dev-android:
	@$(DEV_SCRIPT) android

# Run platforms directly
ios:
	@npm run ios

android:
	@npm run android

# Start only Mock API
api:
	@$(DEV_SCRIPT) api

# Start only Metro
metro:
	@$(DEV_SCRIPT) metro

# Quality & Testing
test:
	@npm test

test-coverage:
	@npm test -- --coverage

lint:
	@npm run lint

lint-fix:
	@npm run lint:fix

typecheck:
	@npm run typecheck

# Cleaning
clean:
	@$(DEV_SCRIPT) clean

reset:
	@$(DEV_SCRIPT) clean
	@$(DEV_SCRIPT) setup

# Building
build-ios:
	@cd ios && bundle exec fastlane build_local

build-android:
	@cd android && ./gradlew assembleRelease

# Deployment
deploy-ios-beta:
	@cd ios && bundle exec fastlane beta

deploy-android-internal:
	@cd android && bundle exec fastlane internal

# Help
help:
	@echo "NRJSoft Parking App - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup          - Install all dependencies (root, mock-api, pods)"
	@echo "  make reset          - Clean and reinstall everything"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start full dev environment (Mock API + Metro + iOS)"
	@echo "  make dev-android    - Start full dev environment (Mock API + Metro + Android)"
	@echo "  make api            - Start Mock API only"
	@echo "  make metro          - Start Metro bundler only"
	@echo ""
	@echo "Quality:"
	@echo "  make test           - Run unit tests"
	@echo "  make lint           - Run ESLint"
	@echo "  make lint-fix       - Run ESLint and fix issues"
	@echo "  make typecheck      - Run TypeScript compiler checks"
	@echo ""
	@echo "Build & Deploy:"
	@echo "  make build-ios      - Build local iOS release"
	@echo "  make build-android  - Build local Android release"
	@echo ""
