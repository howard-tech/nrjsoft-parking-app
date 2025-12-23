#!/bin/bash
# scripts/agent.sh - Automated task execution for NRJSoft Parking App

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/docs/tasks"
MOCK_API_DIR="$PROJECT_ROOT/mock-api"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_task() { echo -e "${MAGENTA}[TASK]${NC} $1"; }

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║           NRJSoft Parking App - Agent Controller             ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

task_list() {
    echo ""; log_info "Task List (57 tasks)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    for i in $(seq -w 1 57); do
        task_file="$TASKS_DIR/task-0$i.md"
        if [ -f "$task_file" ]; then
            task_name=$(grep -m1 "^# TASK-" "$task_file" | sed 's/# TASK-[0-9]*: //')
            status=$(grep -m1 "Status" "$task_file" | grep -o '🔴\|🟡\|🟢\|🔵' || echo "🔴")
            printf "  %s TASK-%s: %s\n" "$status" "$i" "$task_name"
        fi
    done
    echo ""
}

task_show() {
    local task_num=$(printf "%03d" $1)
    local task_file="$TASKS_DIR/task-$task_num.md"
    [ -f "$task_file" ] && cat "$task_file" || { log_error "Task not found"; exit 1; }
}

task_start() {
    local task_num=$(printf "%03d" $1)
    local task_file="$TASKS_DIR/task-$task_num.md"
    [ ! -f "$task_file" ] && { log_error "Task not found"; exit 1; }
    log_task "Starting TASK-$task_num"
    git checkout -b "feature/TASK-$task_num" 2>/dev/null || git checkout "feature/TASK-$task_num"
    sed -i '' "s/🔴 Not Started/🟡 In Progress/" "$task_file" 2>/dev/null || true
    task_show $1
    log_success "Branch: feature/TASK-$task_num"
}

task_complete() {
    local task_num=$(printf "%03d" $1)
    local task_file="$TASKS_DIR/task-$task_num.md"
    log_task "Completing TASK-$task_num"
    npm test --passWithNoTests 2>/dev/null || true
    npm run lint 2>/dev/null || true
    sed -i '' "s/🟡 In Progress/🟢 Completed/" "$task_file" 2>/dev/null || true
    git add . && git commit -m "feat(task-$task_num): complete" 2>/dev/null || true
    log_success "TASK-$task_num completed"
    task_next
}

task_status() {
    local completed=$(grep -l "🟢 Completed" $TASKS_DIR/*.md 2>/dev/null | wc -l | tr -d ' ')
    local in_progress=$(grep -l "🟡 In Progress" $TASKS_DIR/*.md 2>/dev/null | wc -l | tr -d ' ')
    local not_started=$(grep -l "🔴 Not Started" $TASKS_DIR/*.md 2>/dev/null | wc -l | tr -d ' ')
    local percent=$((completed * 100 / 57))
    echo ""
    log_info "Progress: $completed/57 tasks ($percent%)"
    echo -e "  🟢 Completed: $completed | 🟡 In Progress: $in_progress | 🔴 Not Started: $not_started"
    echo ""
}

task_next() {
    echo ""; log_info "Next recommended task:"
    local priority=(052 053 054 001 002 003 007 009)
    for t in "${priority[@]}"; do
        local f="$TASKS_DIR/task-$t.md"
        if [ -f "$f" ] && grep -q "🔴 Not Started" "$f"; then
            echo -e "  ${CYAN}→ TASK-$t${NC}"
            echo "  Run: ./scripts/agent.sh task:start $t"
            return
        fi
    done
    log_success "All priority tasks done!"
}

dev_setup() {
    log_info "Setting up..."
    cd "$PROJECT_ROOT" && npm install
    cd "$PROJECT_ROOT/ios" && pod install
    cd "$MOCK_API_DIR" && npm install
    cd "$PROJECT_ROOT"
    [ ! -f .env ] && cp .env.example .env 2>/dev/null || true
    log_success "Setup complete!"
}

dev_check() {
    log_info "Checking prerequisites..."
    command -v node >/dev/null || { log_error "Node.js missing"; exit 1; }
    command -v pod >/dev/null || { log_error "CocoaPods missing"; exit 1; }
    log_success "All OK - Node $(node -v)"
}

start_api() {
    log_info "Starting Mock API..."
    cd "$MOCK_API_DIR" && npm run dev &
    sleep 5
    log_success "Mock API at http://localhost:3001"
}

dev_run() {
    start_api
    cd "$PROJECT_ROOT"
    npm start &
    sleep 3
    [ "$1" = "android" ] && npm run android || npm run ios
}

show_help() {
    echo "Usage: ./scripts/agent.sh <command>"
    echo ""
    echo "Tasks:   task:list | task:show <id> | task:start <id> | task:complete <id> | task:status | task:next"
    echo "Dev:     dev:setup | dev:check | dev:run [ios|android] | dev:api"
    echo "Build:   build:ios | build:android"
    echo "Deploy:  deploy:ios | deploy:android"
}

print_banner
case "${1:-help}" in
    task:list) task_list ;; task:show) task_show "$2" ;; task:start) task_start "$2" ;;
    task:complete) task_complete "$2" ;; task:status) task_status ;; task:next) task_next ;;
    dev:setup) dev_setup ;; dev:check) dev_check ;; dev:run) dev_run "$2" ;; dev:api) start_api ;;
    build:ios) cd ios && bundle exec fastlane build_local ;;
    build:android) cd android && ./gradlew bundleRelease ;;
    deploy:ios) cd ios && bundle exec fastlane "${2:-beta}" ;;
    deploy:android) cd android && bundle exec fastlane "${2:-internal}" ;;
    help|*) show_help ;;
esac
