# NRJSoft Parking App - Quick Start Guide

## 🚀 Bắt Đầu Nhanh (5 phút)

### Bước 1: Download Project

```bash
# Tạo thư mục project
mkdir -p ~/Projects/nrjsoft-parking-app
cd ~/Projects/nrjsoft-parking-app

# Download tất cả files từ Claude outputs vào đây
# Hoặc clone từ repo nếu có
```

### Bước 2: Cấp Quyền & Setup

```bash
# Cấp quyền cho scripts
chmod +x scripts/*.sh

# Chạy setup tự động
./scripts/codex-runner.sh setup
```

### Bước 3: Bắt Đầu Coding

```bash
# Chạy task đầu tiên (Mock API)
./scripts/codex-runner.sh 52
```

---

## 📋 Commands Chính

| Command | Mô tả |
|---------|-------|
| `./scripts/codex-runner.sh setup` | Setup project từ đầu |
| `./scripts/codex-runner.sh 52` | Chạy task số 52 |
| `./scripts/codex-runner.sh auto` | Tự động chạy tất cả tasks |
| `./scripts/codex-runner.sh status` | Xem tiến độ |
| `./scripts/codex-runner.sh next` | Gợi ý task tiếp theo |

---

## 📁 Cấu Trúc Files Cần Có

```
nrjsoft-parking-app/
├── AGENT.md                 # ✅ Project overview
├── AGENT-PROMPT.md          # ✅ Prompt cho agent
├── CLAUDE.md                # ✅ Claude config
├── codex.md                 # ✅ Codex config
├── Makefile                 # ✅ Quick commands
├── README.md                # ✅ File này
├── package.json             # ✅ Dependencies
├── .env.example             # ✅ Environment template
├── docs/
│   ├── TASK-LIST.md         # ✅ 57 tasks master list
│   └── tasks/
│       ├── task-001.md      # ✅
│       ├── task-002.md      # ✅
│       └── ... (57 files)   # ✅
├── scripts/
│   ├── agent.sh             # ✅ Task automation
│   ├── codex-runner.sh      # ✅ Codex automation
│   └── dev.sh               # ✅ Dev environment
├── ios/
│   └── fastlane/            # ✅ iOS deployment
└── android/
    └── fastlane/            # ✅ Android deployment
```

---

## 🔄 Workflow Hàng Ngày

```bash
# 1. Xem tiến độ
./scripts/codex-runner.sh status

# 2. Xem task tiếp theo
./scripts/codex-runner.sh next

# 3. Chạy task
./scripts/codex-runner.sh <task_number>

# 4. Test
npm test
npm run ios
npm run android

# 5. Commit
git add .
git commit -m "feat(task-XXX): description"
```

---

## 📱 Chạy App

```bash
# Start Mock API + Metro + iOS
make dev

# Hoặc Android
make dev-android

# Chỉ Mock API
cd mock-api && npm run dev

# Chỉ Mobile
npm run ios
npm run android
```

---

## 🎯 Thứ Tự Tasks (57 tasks)

### Phase 1: Foundation (Week 1-2)
- **TASK-052**: Mock Backend API ⭐ BẮT ĐẦU TỪ ĐÂY
- **TASK-053**: Mock Data Generator
- **TASK-054**: API Simulation
- **TASK-001**: React Native Setup
- **TASK-002**: Design System
- **TASK-003**: Navigation

### Phase 2: Authentication (Week 3-4)
- **TASK-004-006**: Auth flows
- **TASK-007-009**: Core services

### Phase 3: Features (Week 5-8)
- **TASK-010-014**: Smart Map
- **TASK-015-019**: Parking Sessions
- **TASK-020-025**: Payments

### Phase 4: Complete (Week 9-12)
- **TASK-026-029**: On-Street
- **TASK-030-035**: Account
- **TASK-036-044**: Polish
- **TASK-045-057**: Deploy

---

## ⚙️ Troubleshooting

### Metro bundler lỗi
```bash
npm start -- --reset-cache
watchman watch-del-all
```

### iOS build fail
```bash
cd ios
pod deintegrate
pod install
```

### Android build fail
```bash
cd android
./gradlew clean
```

### Reset toàn bộ
```bash
rm -rf node_modules ios/Pods android/build
./scripts/codex-runner.sh setup
```

---

## 📞 Support

- **Client**: NRJ Soft
- **Provider**: EmeSoft JSC
- **Website**: www.emesoft.net
- **Phone**: (+84) 287 302 6868
