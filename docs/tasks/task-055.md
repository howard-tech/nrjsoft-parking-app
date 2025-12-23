# TASK-055: Development Environment Automation

## Task Overview

| Field | Value |
|-------|-------|
| Task ID | TASK-055 |
| Module | DevOps / Automation |
| Priority | High |
| Effort | 8h |
| Dependencies | TASK-001, TASK-052 |
| Status | 🔴 Not Started |

## Description

Create comprehensive automation scripts and configuration for local development on macOS. This includes one-command setup, parallel running of mobile app and mock API, hot reload configuration, and development tools integration.

## Acceptance Criteria

- [ ] One-command full environment setup
- [ ] Concurrent running of React Native + Mock API
- [ ] Automatic iOS simulator launch
- [ ] Automatic Android emulator detection/launch
- [ ] Development proxy configuration
- [ ] Hot reload working for both frontend and backend
- [ ] VSCode/Cursor workspace configuration
- [ ] Git hooks for code quality

## Technical Implementation

### Main Development Script

```bash
#!/bin/bash
# scripts/dev.sh - Main development orchestrator

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOCK_API_DIR="$PROJECT_ROOT/mock-api"
MOBILE_DIR="$PROJECT_ROOT"

print_banner() {
  echo -e "${CYAN}"
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                  NRJSoft Parking App                         ║"
  echo "║                 Development Environment                       ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  local missing=()
  
  command -v node >/dev/null 2>&1 || missing+=("Node.js")
  command -v npm >/dev/null 2>&1 || missing+=("npm")
  command -v watchman >/dev/null 2>&1 || missing+=("Watchman")
  command -v pod >/dev/null 2>&1 || missing+=("CocoaPods")
  command -v xcrun >/dev/null 2>&1 || missing+=("Xcode Command Line Tools")
  
  if [ ${#missing[@]} -gt 0 ]; then
    log_error "Missing prerequisites: ${missing[*]}"
    echo ""
    echo "Install with:"
    echo "  brew install node watchman"
    echo "  gem install cocoapods"
    echo "  xcode-select --install"
    exit 1
  fi
  
  log_success "All prerequisites installed"
}

# Setup environment
setup_env() {
  log_info "Setting up environment..."
  
  # Mobile app
  if [ ! -d "$MOBILE_DIR/node_modules" ]; then
    log_info "Installing mobile app dependencies..."
    cd "$MOBILE_DIR" && npm install
  fi
  
  # iOS pods
  if [ ! -d "$MOBILE_DIR/ios/Pods" ]; then
    log_info "Installing CocoaPods..."
    cd "$MOBILE_DIR/ios" && pod install
  fi
  
  # Mock API
  if [ ! -d "$MOCK_API_DIR/node_modules" ]; then
    log_info "Installing Mock API dependencies..."
    cd "$MOCK_API_DIR" && npm install
  fi
  
  # Create .env if not exists
  if [ ! -f "$MOBILE_DIR/.env" ]; then
    log_info "Creating .env file..."
    cp "$MOBILE_DIR/.env.example" "$MOBILE_DIR/.env"
    # Update to use local mock API
    sed -i '' 's|API_BASE_URL=.*|API_BASE_URL=http://localhost:3001/api/v1|g' "$MOBILE_DIR/.env"
  fi
  
  log_success "Environment setup complete"
}

# Start Mock API
start_mock_api() {
  log_info "Starting Mock API..."
  cd "$MOCK_API_DIR"
  npm run dev &
  MOCK_API_PID=$!
  echo $MOCK_API_PID > /tmp/nrjsoft_mock_api.pid
  
  # Wait for API to be ready
  local retries=30
  while ! curl -s http://localhost:3001/health >/dev/null 2>&1; do
    retries=$((retries - 1))
    if [ $retries -eq 0 ]; then
      log_error "Mock API failed to start"
      exit 1
    fi
    sleep 1
  done
  
  log_success "Mock API running at http://localhost:3001"
  log_info "API Docs: http://localhost:3001/api-docs"
}

# Start Metro bundler
start_metro() {
  log_info "Starting Metro bundler..."
  cd "$MOBILE_DIR"
  npm start -- --reset-cache &
  METRO_PID=$!
  echo $METRO_PID > /tmp/nrjsoft_metro.pid
  
  # Wait for Metro
  sleep 5
  log_success "Metro bundler running at http://localhost:8081"
}

# Launch iOS Simulator
launch_ios() {
  log_info "Launching iOS Simulator..."
  
  # Get available simulators
  local simulator=$(xcrun simctl list devices available | grep "iPhone 15" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')
  
  if [ -z "$simulator" ]; then
    simulator=$(xcrun simctl list devices available | grep "iPhone" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')
  fi
  
  if [ -n "$simulator" ]; then
    xcrun simctl boot "$simulator" 2>/dev/null || true
    open -a Simulator
    log_success "iOS Simulator launched"
  else
    log_warning "No iPhone simulator found"
  fi
}

# Launch Android Emulator
launch_android() {
  log_info "Checking Android emulator..."
  
  if [ -z "$ANDROID_HOME" ]; then
    log_warning "ANDROID_HOME not set"
    return
  fi
  
  # Get available AVDs
  local avd=$($ANDROID_HOME/emulator/emulator -list-avds | head -1)
  
  if [ -n "$avd" ]; then
    log_info "Starting Android emulator: $avd"
    $ANDROID_HOME/emulator/emulator -avd "$avd" -no-snapshot-load &
    ANDROID_PID=$!
    echo $ANDROID_PID > /tmp/nrjsoft_android.pid
    
    # Wait for emulator
    adb wait-for-device
    log_success "Android emulator running"
  else
    log_warning "No Android AVD found"
  fi
}

# Run on iOS
run_ios() {
  log_info "Building and running on iOS..."
  cd "$MOBILE_DIR"
  npx react-native run-ios --simulator="iPhone 15"
}

# Run on Android
run_android() {
  log_info "Building and running on Android..."
  cd "$MOBILE_DIR"
  npx react-native run-android
}

# Cleanup function
cleanup() {
  log_info "Shutting down..."
  
  [ -f /tmp/nrjsoft_mock_api.pid ] && kill $(cat /tmp/nrjsoft_mock_api.pid) 2>/dev/null
  [ -f /tmp/nrjsoft_metro.pid ] && kill $(cat /tmp/nrjsoft_metro.pid) 2>/dev/null
  [ -f /tmp/nrjsoft_android.pid ] && kill $(cat /tmp/nrjsoft_android.pid) 2>/dev/null
  
  rm -f /tmp/nrjsoft_*.pid
  
  log_success "Cleanup complete"
}

# Main menu
show_menu() {
  echo ""
  echo "Commands:"
  echo "  1) Start all (Mock API + Metro + iOS)"
  echo "  2) Start all (Mock API + Metro + Android)"
  echo "  3) Start Mock API only"
  echo "  4) Start Metro only"
  echo "  5) Run on iOS"
  echo "  6) Run on Android"
  echo "  7) Setup environment"
  echo "  8) Clean & reinstall"
  echo "  9) Stop all"
  echo "  0) Exit"
  echo ""
  read -p "Choose option: " choice
  
  case $choice in
    1) start_all_ios ;;
    2) start_all_android ;;
    3) start_mock_api ;;
    4) start_metro ;;
    5) run_ios ;;
    6) run_android ;;
    7) setup_env ;;
    8) clean_reinstall ;;
    9) cleanup ;;
    0) exit 0 ;;
    *) log_error "Invalid option" ;;
  esac
}

start_all_ios() {
  trap cleanup EXIT
  setup_env
  start_mock_api
  start_metro
  launch_ios
  sleep 5
  run_ios
  
  # Keep running
  echo ""
  log_success "Development environment running!"
  echo "Press Ctrl+C to stop all services"
  wait
}

start_all_android() {
  trap cleanup EXIT
  setup_env
  start_mock_api
  start_metro
  launch_android
  sleep 10
  run_android
  
  echo ""
  log_success "Development environment running!"
  echo "Press Ctrl+C to stop all services"
  wait
}

clean_reinstall() {
  log_info "Cleaning and reinstalling..."
  
  cd "$MOBILE_DIR"
  rm -rf node_modules ios/Pods ios/build android/build android/app/build
  watchman watch-del-all 2>/dev/null || true
  
  cd "$MOCK_API_DIR"
  rm -rf node_modules dist
  
  setup_env
  
  log_success "Clean reinstall complete"
}

# Main
print_banner
check_prerequisites

if [ -z "$1" ]; then
  show_menu
else
  case "$1" in
    ios) start_all_ios ;;
    android) start_all_android ;;
    api) start_mock_api ;;
    metro) start_metro ;;
    setup) setup_env ;;
    clean) clean_reinstall ;;
    stop) cleanup ;;
    *) 
      echo "Usage: ./scripts/dev.sh [ios|android|api|metro|setup|clean|stop]"
      exit 1
      ;;
  esac
fi
```

### VSCode Workspace Configuration

```json
// nrjsoft-parking.code-workspace
{
  "folders": [
    {
      "name": "📱 Mobile App",
      "path": "."
    },
    {
      "name": "🖥️ Mock API",
      "path": "mock-api"
    }
  ],
  "settings": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.preferences.importModuleSpecifier": "relative",
    "files.exclude": {
      "**/node_modules": true,
      "**/ios/Pods": true,
      "**/android/build": true,
      "**/.gradle": true
    },
    "search.exclude": {
      "**/node_modules": true,
      "**/ios/Pods": true,
      "**/android/build": true
    },
    "terminal.integrated.env.osx": {
      "ANDROID_HOME": "${env:HOME}/Library/Android/sdk"
    }
  },
  "launch": {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Debug iOS",
        "request": "attach",
        "type": "reactnative",
        "cwd": "${workspaceFolder:📱 Mobile App}",
        "platform": "ios"
      },
      {
        "name": "Debug Android",
        "request": "attach",
        "type": "reactnative",
        "cwd": "${workspaceFolder:📱 Mobile App}",
        "platform": "android"
      },
      {
        "name": "Debug Mock API",
        "type": "node",
        "request": "launch",
        "cwd": "${workspaceFolder:🖥️ Mock API}",
        "runtimeExecutable": "npm",
        "runtimeArgs": ["run", "dev"],
        "console": "integratedTerminal"
      }
    ],
    "compounds": [
      {
        "name": "Full Stack Debug",
        "configurations": ["Debug Mock API", "Debug iOS"]
      }
    ]
  },
  "tasks": {
    "version": "2.0.0",
    "tasks": [
      {
        "label": "Start Development",
        "type": "shell",
        "command": "./scripts/dev.sh ios",
        "group": {
          "kind": "build",
          "isDefault": true
        },
        "presentation": {
          "reveal": "always",
          "panel": "new"
        }
      },
      {
        "label": "Run iOS",
        "type": "shell",
        "command": "npm run ios",
        "group": "build"
      },
      {
        "label": "Run Android",
        "type": "shell",
        "command": "npm run android",
        "group": "build"
      },
      {
        "label": "Run Tests",
        "type": "shell",
        "command": "npm test",
        "group": "test"
      }
    ]
  },
  "extensions": {
    "recommendations": [
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode",
      "msjsdiag.vscode-react-native",
      "orta.vscode-jest",
      "bradlc.vscode-tailwindcss",
      "ms-azuretools.vscode-docker",
      "eamodio.gitlens",
      "streetsidesoftware.code-spell-checker",
      "usernamehw.errorlens"
    ]
  }
}
```

### Git Hooks (Husky)

```json
// package.json additions
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Conventional commits check
COMMIT_MSG=$(cat $1)
PATTERN="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,72}"

if ! echo "$COMMIT_MSG" | grep -qE "$PATTERN"; then
  echo "❌ Invalid commit message format"
  echo "Expected: type(scope): description"
  echo "Example: feat(auth): add OTP verification"
  exit 1
fi
```

### Makefile for Common Tasks

```makefile
# Makefile
.PHONY: all setup dev ios android test clean help

# Default target
all: help

# Setup development environment
setup:
	@./scripts/dev.sh setup

# Start development (iOS)
dev: dev-ios

dev-ios:
	@./scripts/dev.sh ios

dev-android:
	@./scripts/dev.sh android

# Run on specific platform
ios:
	@npm run ios

android:
	@npm run android

# Start only Mock API
api:
	@cd mock-api && npm run dev

# Run tests
test:
	@npm test

test-coverage:
	@npm test -- --coverage

# Lint
lint:
	@npm run lint

lint-fix:
	@npm run lint -- --fix

# Type check
typecheck:
	@npm run typecheck

# Clean everything
clean:
	@rm -rf node_modules ios/Pods ios/build android/build android/app/build
	@rm -rf mock-api/node_modules mock-api/dist
	@watchman watch-del-all 2>/dev/null || true

# Reset and reinstall
reset: clean setup

# Build release
build-ios:
	@cd ios && fastlane build_local

build-android:
	@cd android && ./gradlew bundleRelease

# Deploy
deploy-ios-beta:
	@cd ios && fastlane beta

deploy-android-internal:
	@cd android && fastlane internal

# Help
help:
	@echo "NRJSoft Parking App - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup          - Install all dependencies"
	@echo "  make reset          - Clean and reinstall everything"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start full dev environment (iOS)"
	@echo "  make dev-android    - Start full dev environment (Android)"
	@echo "  make ios            - Run on iOS simulator"
	@echo "  make android        - Run on Android emulator"
	@echo "  make api            - Start Mock API only"
	@echo ""
	@echo "Quality:"
	@echo "  make test           - Run tests"
	@echo "  make lint           - Run linter"
	@echo "  make typecheck      - Run TypeScript check"
	@echo ""
	@echo "Build:"
	@echo "  make build-ios      - Build iOS release"
	@echo "  make build-android  - Build Android release"
	@echo ""
	@echo "Deploy:"
	@echo "  make deploy-ios-beta    - Deploy to TestFlight"
	@echo "  make deploy-android-internal - Deploy to Play Store Internal"
```

## Files to Create

| File | Purpose |
|------|---------|
| scripts/dev.sh | Main dev orchestrator |
| nrjsoft-parking.code-workspace | VSCode workspace |
| Makefile | Common commands |
| .husky/pre-commit | Pre-commit hook |
| .husky/commit-msg | Commit message check |

## Testing Checklist

- [ ] `make setup` installs everything correctly
- [ ] `make dev` starts all services
- [ ] Hot reload works for mobile app
- [ ] Hot reload works for Mock API
- [ ] VSCode debugging works
- [ ] Git hooks enforce code quality

## Related Tasks

- Previous: TASK-052 (Mock Backend API)
- Enables: Efficient local development
