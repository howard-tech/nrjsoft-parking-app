#!/bin/bash
# scripts/dev.sh - Local dev helper for mock API, Metro, iOS, Android

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOCK_API_DIR="$ROOT/mock-api"
ENV_DIR="$ROOT/env"
IOS_ENV="$ENV_DIR/.env.local.ios"
ANDROID_ENV="$ENV_DIR/.env.local.android"
METRO_HOST="${METRO_HOST:-127.0.0.1}"
METRO_PORT="${METRO_PORT:-8081}"
API_PORT="${API_PORT:-3005}"

API_PID=""
METRO_PID=""

cleanup() {
    if [[ -n "${METRO_PID}" ]] && kill -0 "${METRO_PID}" 2>/dev/null; then
        kill "${METRO_PID}" 2>/dev/null || true
    fi
    if [[ -n "${API_PID}" ]] && kill -0 "${API_PID}" 2>/dev/null; then
        kill "${API_PID}" 2>/dev/null || true
    fi
}
trap cleanup EXIT INT TERM

ensure_env() {
    if [[ ! -f "$IOS_ENV" || ! -f "$ANDROID_ENV" ]]; then
        echo "Missing local env files in $ENV_DIR"
        echo "Expected: $IOS_ENV and $ANDROID_ENV"
        exit 1
    fi
}

ensure_node() {
    if command -v nvm >/dev/null 2>&1 && [[ -f "$ROOT/.nvmrc" ]]; then
        nvm use >/dev/null || true
    fi
}

setup() {
    ensure_node
    echo "Installing root dependencies..."
    (cd "$ROOT" && npm install --legacy-peer-deps)
    echo "Installing mock API dependencies..."
    (cd "$MOCK_API_DIR" && npm install)
    if [[ -d "$ROOT/ios" ]]; then
        echo "Installing iOS pods..."
        (cd "$ROOT/ios" && pod install)
    fi
    [[ -f "$ROOT/.env" ]] || cp "$ROOT/.env.example" "$ROOT/.env"
    echo "Setup complete. Node $(node -v)"
}

start_api() {
    if lsof -i :"$API_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "Mock API already running on port $API_PORT"
        return
    fi
    (cd "$MOCK_API_DIR" && npm run dev) &
    API_PID=$!
    echo "Mock API started (pid $API_PID) at http://127.0.0.1:$API_PORT"
    sleep 2
}

start_metro() {
    if lsof -i :"$METRO_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "Metro already running on port $METRO_PORT"
        return
    fi
    METRO_HOST="$METRO_HOST" METRO_PORT="$METRO_PORT" (cd "$ROOT" && npm run start:metro) &
    METRO_PID=$!
    echo "Metro bundler started (pid $METRO_PID) at $METRO_HOST:$METRO_PORT"
    sleep 2
}

run_ios() {
    ensure_env
    ensure_node
    start_api
    start_metro
    RCT_NO_LAUNCH_PACKAGER=1 ENVFILE="$IOS_ENV" (cd "$ROOT" && npm run ios -- --no-packager)
    echo "Mock API and Metro still running. Press Ctrl+C to stop."
    wait
}

run_android() {
    ensure_env
    ensure_node
    start_api
    start_metro
    RCT_NO_LAUNCH_PACKAGER=1 ENVFILE="$ANDROID_ENV" (cd "$ROOT" && npm run android -- --no-packager)
    echo "Mock API and Metro still running. Press Ctrl+C to stop."
    wait
}

run_api_only() {
    ensure_node
    start_api
    wait
}

usage() {
    cat <<EOF
Usage: ./scripts/dev.sh <command>
  setup     Install dependencies (root, mock-api, pods)
  ios       Start API + Metro, run iOS with local env
  android   Start API + Metro, run Android with local env
  api       Start mock API only
EOF
}

case "${1:-help}" in
    setup) setup ;;
    ios) run_ios ;;
    android) run_android ;;
    api) run_api_only ;;
    *) usage ;;
esac
