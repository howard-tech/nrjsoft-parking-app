#!/bin/bash
# scripts/dev.sh - Main development orchestrator for NRJSoft Parking App

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
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    command -v pod >/dev/null 2>&1 || missing+=("CocoaPods")
    command -v xcrun >/dev/null 2>&1 || missing+=("Xcode Command Line Tools")
  fi
  
  if [ ${#missing[@]} -gt 0 ]; then
    log_error "Missing prerequisites: ${missing[*]}"
    echo ""
    echo "Install with:"
    echo "  brew install node watchman"
    if [[ "$OSTYPE" == "darwin"* ]]; then
      echo "  gem install cocoapods"
      echo "  xcode-select --install"
    fi
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
    cd "$MOBILE_DIR" && npm install --legacy-peer-deps
  fi
  
  # iOS pods
  if [[ "$OSTYPE" == "darwin"* ]] && [ -d "$MOBILE_DIR/ios" ] && [ ! -d "$MOBILE_DIR/ios/Pods" ]; then
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
    log_info "Creating .env file from .env.development..."
    cp "$MOBILE_DIR/.env.development" "$MOBILE_DIR/.env"
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
  if [[ "$OSTYPE" != "darwin"* ]]; then
    log_warning "iOS development requires macOS"
    return
  fi

  log_info "Launching iOS Simulator..."
  
  # Get available simulators (prefer iPhone 15 or latest)
  local simulator=$(xcrun simctl list devices available | grep "iPhone 15" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')
  
  if [ -z "$simulator" ]; then
    simulator=$(xcrun simctl list devices available | grep "iPhone" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')
  fi
  
  if [ -n "$simulator" ]; then
    xcrun simctl boot "$simulator" 2>/dev/null || true
    open -a Simulator
    log_success "iOS Simulator launched ($simulator)"
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
  npm run ios
}

# Run on Android
run_android() {
  log_info "Building and running on Android..."
  cd "$MOBILE_DIR"
  npm run android
}

# Cleanup function
cleanup() {
  log_info "Shutting down..."
  
  [ -f /tmp/nrjsoft_mock_api.pid ] && kill $(cat /tmp/nrjsoft_mock_api.pid) 2>/dev/null || true
  [ -f /tmp/nrjsoft_metro.pid ] && kill $(cat /tmp/nrjsoft_metro.pid) 2>/dev/null || true
  [ -f /tmp/nrjsoft_android.pid ] && kill $(cat /tmp/nrjsoft_android.pid) 2>/dev/null || true
  
  rm -f /tmp/nrjsoft_*.pid
  
  log_success "Cleanup complete"
}

start_all_ios() {
  trap cleanup EXIT INT TERM
  setup_env
  start_mock_api
  start_metro
  launch_ios
  sleep 5
  run_ios
  
  log_success "Development environment running!"
  echo "Press Ctrl+C to stop all services"
  wait
}

start_all_android() {
  trap cleanup EXIT INT TERM
  setup_env
  start_mock_api
  start_metro
  launch_android
  sleep 10
  run_android
  
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

# Main
print_banner
check_prerequisites

if [ -z "${1:-}" ]; then
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
