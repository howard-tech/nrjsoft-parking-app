.PHONY: all setup dev dev-android ios android api test lint clean reset help

# Default
all: help

# Setup development environment
setup:
	@./scripts/dev.sh setup

# Start full dev (iOS)
dev:
	@./scripts/dev.sh ios

# Start full dev (Android)
dev-android:
	@./scripts/dev.sh android

# Run platforms
ios:
	@npm run ios

android:
	@npm run android

# Start Mock API only
api:
	@cd mock-api && npm run dev

# Testing
test:
	@npm test

lint:
	@npm run lint

typecheck:
	@npm run typecheck

# Clean
clean:
	@rm -rf node_modules ios/Pods android/build mock-api/node_modules
	@watchman watch-del-all 2>/dev/null || true

reset: clean setup

# Build
build-ios:
	@cd ios && bundle exec fastlane build_local

build-android:
	@cd android && ./gradlew bundleRelease

# Deploy
deploy-ios:
	@cd ios && bundle exec fastlane beta

deploy-android:
	@cd android && bundle exec fastlane internal

# Help
help:
	@echo "NRJSoft Parking App Commands"
	@echo ""
	@echo "  make setup        Install dependencies"
	@echo "  make dev          Start dev (iOS)"
	@echo "  make dev-android  Start dev (Android)"
	@echo "  make api          Start Mock API"
	@echo "  make test         Run tests"
	@echo "  make clean        Clean builds"
	@echo "  make reset        Full reset"
