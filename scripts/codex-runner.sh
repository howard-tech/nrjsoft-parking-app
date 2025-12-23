#!/bin/bash
# scripts/codex-runner.sh - Automated Codex CLI Runner for NRJSoft Parking App
# Usage: ./scripts/codex-runner.sh [task_number|auto|setup]

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

# Logging
log() { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
task_log() { echo -e "${MAGENTA}[TASK]${NC} $1"; }

print_banner() {
    clear
    echo -e "${CYAN}"
    cat << 'EOF'
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                                                                   ║
    ║     ███╗   ██╗██████╗      ██╗███████╗ ██████╗ ███████╗████████╗  ║
    ║     ████╗  ██║██╔══██╗     ██║██╔════╝██╔═══██╗██╔════╝╚══██╔══╝  ║
    ║     ██╔██╗ ██║██████╔╝     ██║███████╗██║   ██║█████╗     ██║     ║
    ║     ██║╚██╗██║██╔══██╗██   ██║╚════██║██║   ██║██╔══╝     ██║     ║
    ║     ██║ ╚████║██║  ██║╚█████╔╝███████║╚██████╔╝██║        ██║     ║
    ║     ╚═╝  ╚═══╝╚═╝  ╚═╝ ╚════╝ ╚══════╝ ╚═════╝ ╚═╝        ╚═╝     ║
    ║                                                                   ║
    ║              Parking App - Codex CLI Automation                   ║
    ╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Check if Codex CLI is installed
check_codex() {
    if command -v codex &> /dev/null; then
        success "Codex CLI found: $(codex --version 2>/dev/null || echo 'installed')"
        return 0
    fi
    
    echo ""
    log "Codex CLI not found. Installing options:"
    echo ""
    echo "  Option 1 - OpenAI Codex CLI:"
    echo "    npm install -g @openai/codex"
    echo ""
    echo "  Option 2 - Anthropic Claude Code:"
    echo "    npm install -g @anthropic-ai/claude-code"
    echo ""
    echo "  Option 3 - Use this script with manual mode"
    echo ""
    
    read -p "Install OpenAI Codex CLI now? (y/n): " install_choice
    if [[ "$install_choice" == "y" ]]; then
        npm install -g @openai/codex
        success "Codex CLI installed"
    else
        log "Continuing without Codex CLI (manual mode)"
    fi
}

# Setup project from scratch
setup_project() {
    print_banner
    log "Setting up NRJSoft Parking App project..."
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Step 1: Check prerequisites
    log "Step 1/6: Checking prerequisites..."
    
    local missing=()
    command -v node &>/dev/null || missing+=("node")
    command -v npm &>/dev/null || missing+=("npm")
    command -v watchman &>/dev/null || missing+=("watchman")
    command -v pod &>/dev/null || missing+=("cocoapods")
    
    if [ ${#missing[@]} -gt 0 ]; then
        error "Missing: ${missing[*]}. Install with: brew install ${missing[*]}"
    fi
    success "Prerequisites OK"
    
    # Step 2: Initialize React Native (if not exists)
    log "Step 2/6: Initializing React Native project..."
    
    if [ ! -f "package.json" ] || ! grep -q "react-native" package.json 2>/dev/null; then
        npx react-native@latest init NRJSoftParking --template react-native-template-typescript --skip-git-init
        
        # Move files up
        mv NRJSoftParking/* . 2>/dev/null || true
        mv NRJSoftParking/.* . 2>/dev/null || true
        rmdir NRJSoftParking 2>/dev/null || true
        success "React Native initialized"
    else
        success "React Native already initialized"
    fi
    
    # Step 3: Create directory structure
    log "Step 3/6: Creating directory structure..."
    
    mkdir -p src/{components/{common,map,parking,payment,auth,account},screens/{auth,home,parking,payment,onstreet,account,notifications},navigation,services/{api,auth,location,payment,notifications,session},store/{slices,selectors},hooks,utils,constants,localization/{en,de,bg},theme,types}
    mkdir -p mock-api/src/{routes,controllers,services,data,middleware,types}
    mkdir -p __tests__/{unit,integration,e2e}
    mkdir -p assets/{images,fonts,icons}
    
    success "Directories created"
    
    # Step 4: Install dependencies
    log "Step 4/6: Installing dependencies..."
    
    npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
        react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated \
        @reduxjs/toolkit react-redux axios react-native-config \
        react-native-maps @stripe/stripe-react-native \
        @react-native-firebase/app @react-native-firebase/messaging \
        react-native-keychain i18next react-i18next \
        react-native-vision-camera socket.io-client
    
    npm install -D @types/react @types/react-native jest @testing-library/react-native \
        @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint prettier
    
    success "Dependencies installed"
    
    # Step 5: Setup Mock API
    log "Step 5/6: Setting up Mock API..."
    
    cd mock-api
    
    if [ ! -f "package.json" ]; then
        npm init -y
        npm install express cors helmet morgan jsonwebtoken socket.io swagger-ui-express uuid faker
        npm install -D typescript @types/node @types/express @types/cors @types/morgan @types/jsonwebtoken nodemon ts-node
        
        # Create tsconfig
        cat > tsconfig.json << 'TSEOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
TSEOF
        
        # Update package.json scripts
        npm pkg set scripts.dev="nodemon --exec ts-node src/index.ts"
        npm pkg set scripts.build="tsc"
        npm pkg set scripts.start="node dist/index.js"
    fi
    
    cd "$PROJECT_ROOT"
    success "Mock API setup complete"
    
    # Step 6: iOS Pods
    log "Step 6/6: Installing iOS pods..."
    
    cd ios
    pod install
    cd "$PROJECT_ROOT"
    
    success "iOS pods installed"
    
    # Create .env
    if [ ! -f ".env" ]; then
        cat > .env << 'ENVEOF'
API_BASE_URL=http://localhost:3001/api/v1
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
GOOGLE_WEB_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
ENABLE_MOCK_API=true
ENVEOF
        success ".env created (update with your keys)"
    fi
    
    echo ""
    success "🎉 Project setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Update .env with your API keys"
    echo "  2. Run: ./scripts/codex-runner.sh 52"
    echo "     (Start with Mock API task)"
    echo ""
}

# Get task info
get_task_info() {
    local task_num=$(printf "%03d" $1)
    local task_file="$TASKS_DIR/task-$task_num.md"
    
    if [ ! -f "$task_file" ]; then
        error "Task file not found: $task_file"
    fi
    
    echo "$task_file"
}

# Generate Codex prompt for a task
generate_prompt() {
    local task_num=$1
    local task_file=$(get_task_info $task_num)
    local task_content=$(cat "$task_file")
    
    cat << PROMPT
You are an expert React Native and Node.js developer building the NRJSoft Parking Mobile Application.

## Project Context
- React Native app for parking management in EU markets
- TypeScript strict mode required
- Mock API backend with Express.js
- Target platforms: iOS and Android

## Current Task
$task_content

## Instructions
1. Read the task specification carefully
2. Create all files mentioned in the task
3. Follow TypeScript best practices
4. Add proper error handling
5. Include loading states for async operations
6. Add accessibility labels
7. Test the implementation

## File Structure
- Mobile app code: src/
- Mock API code: mock-api/src/
- Use absolute imports with @/ prefix for src/

Begin implementation now. Create each file with complete, working code.
PROMPT
}

# Run Codex for a specific task
run_task() {
    local task_num=$1
    local task_file=$(get_task_info $task_num)
    local task_name=$(grep -m1 "^# TASK-" "$task_file" | sed 's/# //')
    
    print_banner
    task_log "Starting $task_name"
    echo ""
    
    # Create branch
    git checkout -b "feature/TASK-$(printf "%03d" $task_num)" 2>/dev/null || \
        git checkout "feature/TASK-$(printf "%03d" $task_num)" 2>/dev/null || true
    
    # Update task status
    sed -i '' "s/🔴 Not Started/🟡 In Progress/" "$task_file" 2>/dev/null || true
    
    # Show task details
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    cat "$task_file"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Generate prompt
    local prompt=$(generate_prompt $task_num)
    
    # Check if Codex is available
    if command -v codex &> /dev/null; then
        log "Running Codex CLI..."
        echo ""
        
        # Save prompt to temp file
        local prompt_file="/tmp/codex_prompt_$task_num.md"
        echo "$prompt" > "$prompt_file"
        
        # Run Codex
        codex "$prompt"
        
        rm "$prompt_file"
    else
        # Manual mode - show prompt for copy/paste
        log "Codex CLI not available. Manual mode:"
        echo ""
        echo -e "${YELLOW}Copy this prompt to your AI assistant:${NC}"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "$prompt"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        read -p "Press Enter after implementing the task..."
    fi
    
    # Post-task actions
    echo ""
    log "Task implementation complete. Running checks..."
    
    # Run tests if available
    npm test --passWithNoTests 2>/dev/null || true
    
    # Run lint
    npm run lint --fix 2>/dev/null || true
    
    # Ask to mark complete
    echo ""
    read -p "Mark task as complete? (y/n): " mark_complete
    
    if [[ "$mark_complete" == "y" ]]; then
        sed -i '' "s/🟡 In Progress/🟢 Completed/" "$task_file" 2>/dev/null || true
        git add .
        git commit -m "feat(task-$(printf "%03d" $task_num)): $task_name" 2>/dev/null || true
        success "Task marked as complete!"
        
        # Suggest next task
        suggest_next_task
    fi
}

# Run all tasks automatically
run_auto() {
    print_banner
    log "Starting automatic task execution..."
    echo ""
    
    # Task execution order (optimized)
    local tasks=(
        052 053 054  # Mock API
        001 002 003 041 055  # Setup
        004 005 006 046  # Auth
        007 008 009 033 049 050 051  # Services
        010 011 012 013 014 048  # Maps
        015 016 017 018 019  # Sessions
        020 021 022 023 024 025 042  # Payments
        026 027 028 029  # On-Street
        030 031 032 043 047  # Account
        034 035  # Notifications
        036 037 038 039 044  # Quality
        040 045 056 057  # Deploy
    )
    
    local completed=0
    local total=${#tasks[@]}
    
    for task_num in "${tasks[@]}"; do
        local task_file="$TASKS_DIR/task-$task_num.md"
        
        # Skip if already completed
        if grep -q "🟢 Completed" "$task_file" 2>/dev/null; then
            ((completed++))
            continue
        fi
        
        echo ""
        echo -e "${CYAN}Progress: $completed/$total tasks completed${NC}"
        echo ""
        
        run_task $task_num
        ((completed++))
        
        # Ask to continue
        read -p "Continue to next task? (y/n/q): " continue_choice
        case "$continue_choice" in
            n) break ;;
            q) exit 0 ;;
        esac
    done
    
    echo ""
    success "Auto mode complete! $completed/$total tasks done."
}

# Suggest next task
suggest_next_task() {
    echo ""
    log "Next recommended task:"
    
    local priority=(052 053 054 001 002 003 007 009 010 011 020 026 040)
    
    for task_num in "${priority[@]}"; do
        local task_file="$TASKS_DIR/task-$task_num.md"
        if [ -f "$task_file" ] && grep -q "🔴 Not Started" "$task_file"; then
            local task_name=$(grep -m1 "^# TASK-" "$task_file" | sed 's/# TASK-[0-9]*: //')
            echo ""
            echo -e "  ${CYAN}→ TASK-$task_num: $task_name${NC}"
            echo ""
            echo "  Run: ./scripts/codex-runner.sh $task_num"
            echo ""
            return
        fi
    done
    
    # Find any incomplete task
    for i in $(seq 1 57); do
        local task_num=$(printf "%03d" $i)
        local task_file="$TASKS_DIR/task-$task_num.md"
        if [ -f "$task_file" ] && grep -q "🔴 Not Started" "$task_file"; then
            local task_name=$(grep -m1 "^# TASK-" "$task_file" | sed 's/# TASK-[0-9]*: //')
            echo ""
            echo -e "  ${CYAN}→ TASK-$task_num: $task_name${NC}"
            echo ""
            echo "  Run: ./scripts/codex-runner.sh $i"
            echo ""
            return
        fi
    done
    
    success "🎉 All tasks completed!"
}

# Show status
show_status() {
    print_banner
    
    local completed=$(grep -rl "🟢 Completed" $TASKS_DIR/*.md 2>/dev/null | wc -l | tr -d ' ')
    local in_progress=$(grep -rl "🟡 In Progress" $TASKS_DIR/*.md 2>/dev/null | wc -l | tr -d ' ')
    local not_started=$(grep -rl "🔴 Not Started" $TASKS_DIR/*.md 2>/dev/null | wc -l | tr -d ' ')
    local total=57
    local percent=$((completed * 100 / total))
    
    echo "Project Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "  🟢 Completed:     ${GREEN}$completed${NC} tasks"
    echo -e "  🟡 In Progress:   ${YELLOW}$in_progress${NC} tasks"
    echo -e "  🔴 Not Started:   ${RED}$not_started${NC} tasks"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Progress bar
    local bar_width=50
    local filled=$((percent * bar_width / 100))
    local empty=$((bar_width - filled))
    
    printf "  Progress: ["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] ${GREEN}$percent%%${NC}\n"
    echo ""
    
    suggest_next_task
}

# Show help
show_help() {
    print_banner
    echo "Usage: ./scripts/codex-runner.sh <command>"
    echo ""
    echo "Commands:"
    echo "  setup          Setup project from scratch"
    echo "  <number>       Run specific task (e.g., 52)"
    echo "  auto           Run all tasks automatically"
    echo "  status         Show project progress"
    echo "  next           Show next recommended task"
    echo "  help           Show this help"
    echo ""
    echo "Examples:"
    echo "  ./scripts/codex-runner.sh setup    # First time setup"
    echo "  ./scripts/codex-runner.sh 52       # Run task 52"
    echo "  ./scripts/codex-runner.sh auto     # Auto mode"
    echo "  ./scripts/codex-runner.sh status   # Check progress"
    echo ""
    echo "Task Order:"
    echo "  1. Mock API:    52, 53, 54"
    echo "  2. Setup:       1, 2, 3, 41, 55"
    echo "  3. Auth:        4, 5, 6, 46"
    echo "  4. Services:    7, 8, 9, 33, 49-51"
    echo "  5. Maps:        10-14, 48"
    echo "  6. Sessions:    15-19"
    echo "  7. Payments:    20-25, 42"
    echo "  8. On-Street:   26-29"
    echo "  9. Account:     30-32, 43, 47"
    echo "  10. Polish:     34-39, 44"
    echo "  11. Deploy:     40, 45, 56, 57"
    echo ""
}

# Main
cd "$PROJECT_ROOT"

case "${1:-help}" in
    setup)
        setup_project
        ;;
    auto)
        check_codex
        run_auto
        ;;
    status)
        show_status
        ;;
    next)
        print_banner
        suggest_next_task
        ;;
    help|--help|-h)
        show_help
        ;;
    [0-9]*)
        check_codex
        run_task "$1"
        ;;
    *)
        error "Unknown command: $1"
        show_help
        ;;
esac
