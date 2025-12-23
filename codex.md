# codex.md - Configuration for OpenAI Codex CLI

## Project: NRJSoft Parking Mobile Application

### Instructions

You are building a React Native parking application. Follow these rules:

1. **Always read the task file first** before implementing
2. **Use TypeScript** for all code
3. **Follow the project structure** defined in AGENT.md
4. **Test on both iOS and Android**
5. **Commit after each completed task**

### Task Location
All tasks are in `docs/tasks/` directory, numbered task-001.md through task-057.md.

### Execution Order
Start with TASK-052 (Mock Backend API), then TASK-001 (Project Setup), then follow the order in TASK-LIST.md.

### Commands
```bash
# Setup project
make setup

# Start development
make dev

# Run iOS
make ios

# Run Android  
make android

# Run tests
make test
```

### Key Files
- `AGENT.md` - Project overview and guidelines
- `TASK-LIST.md` - All 57 tasks with dependencies
- `docs/tasks/*.md` - Detailed task specifications
- `mock-api/` - Node.js mock backend

### Quality Checks
Before marking a task complete:
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Works on iOS simulator
- [ ] Works on Android emulator
- [ ] Unit tests pass (if applicable)

### Git Workflow
```bash
git checkout -b feature/TASK-XXX
# implement task
git add .
git commit -m "feat(scope): description"
git push origin feature/TASK-XXX
```
