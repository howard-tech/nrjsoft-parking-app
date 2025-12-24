# TASK-001: Project Initialization & React Native Setup

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-001 |
| **Module** | Project Setup |
| **Priority** | Critical |
| **Estimated Effort** | 8 hours |
| **Dependencies** | None |
| **Status** | 🟢 Completed |

## Description

Initialize the React Native project with all necessary dependencies, configure the development environment for both iOS and Android, and set up the project structure following the architecture defined in AGENT.md.

## Acceptance Criteria

- [ ] React Native project initialized with TypeScript template
- [ ] iOS and Android builds compile successfully
- [ ] Folder structure matches AGENT.md specification
- [ ] Essential dependencies installed and configured
- [ ] Environment configuration (.env) set up
- [ ] ESLint and Prettier configured
- [ ] Git repository initialized with .gitignore
- [ ] Basic README.md created

## Technical Requirements

### 1. Project Initialization

```bash
# Initialize React Native project with TypeScript
npx react-native init NRJSoftParking --template react-native-template-typescript

# Navigate to project
cd NRJSoftParking
```

### 2. Core Dependencies to Install

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@react-navigation/native-stack": "^6.x",
    "react-native-screens": "^3.x",
    "react-native-safe-area-context": "^4.x",
    "react-native-gesture-handler": "^2.x",
    "react-native-reanimated": "^3.x",
    "@reduxjs/toolkit": "^2.x",
    "react-redux": "^9.x",
    "axios": "^1.x",
    "react-native-config": "^1.x",
    "react-native-keychain": "^8.x",
    "react-native-localize": "^3.x",
    "i18n-js": "^4.x",
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-native": "^0.72.x",
    "@typescript-eslint/eslint-plugin": "^6.x",
    "@typescript-eslint/parser": "^6.x",
    "eslint": "^8.x",
    "eslint-plugin-react": "^7.x",
    "eslint-plugin-react-hooks": "^4.x",
    "prettier": "^3.x",
    "jest": "^29.x",
    "@testing-library/react-native": "^12.x"
  }
}
```

### 3. Folder Structure to Create

```
src/
├── components/
│   ├── common/
│   │   └── index.ts
│   ├── map/
│   │   └── index.ts
│   ├── parking/
│   │   └── index.ts
│   └── payment/
│       └── index.ts
├── screens/
│   ├── auth/
│   │   └── index.ts
│   ├── home/
│   │   └── index.ts
│   ├── parking/
│   │   └── index.ts
│   ├── payment/
│   │   └── index.ts
│   ├── onstreet/
│   │   └── index.ts
│   ├── account/
│   │   └── index.ts
│   └── notifications/
│       └── index.ts
├── navigation/
│   └── index.ts
├── services/
│   ├── api/
│   │   └── index.ts
│   ├── auth/
│   │   └── index.ts
│   ├── location/
│   │   └── index.ts
│   ├── payment/
│   │   └── index.ts
│   └── notifications/
│       └── index.ts
├── store/
│   └── index.ts
├── hooks/
│   └── index.ts
├── utils/
│   └── index.ts
├── constants/
│   └── index.ts
├── localization/
│   └── index.ts
├── theme/
│   └── index.ts
└── types/
    └── index.ts
```

### 4. Environment Configuration

Create `.env.development`, `.env.staging`, `.env.production`:

```env
# .env.development
API_BASE_URL=https://dev-api.nrjsoft.com
GOOGLE_MAPS_API_KEY=your_dev_key_here
ENVIRONMENT=development
```

### 5. TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2019"],
    "allowJs": true,
    "jsx": "react-native",
    "noEmit": true,
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": "./src",
    "paths": {
      "@components/*": ["components/*"],
      "@screens/*": ["screens/*"],
      "@services/*": ["services/*"],
      "@hooks/*": ["hooks/*"],
      "@utils/*": ["utils/*"],
      "@constants/*": ["constants/*"],
      "@theme/*": ["theme/*"],
      "@types/*": ["types/*"],
      "@store/*": ["store/*"],
      "@navigation/*": ["navigation/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "babel.config.js", "metro.config.js", "jest.config.js"]
}
```

### 6. ESLint Configuration

Create `.eslintrc.js`:

```javascript
module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

### 7. Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root application component |
| `src/types/index.ts` | Base type exports |
| `src/constants/config.ts` | App configuration constants |
| `src/utils/logger.ts` | Logging utility |
| `.env.development` | Dev environment variables |
| `.env.staging` | Staging environment variables |
| `.env.production` | Production environment variables |
| `.eslintrc.js` | ESLint configuration |
| `.prettierrc` | Prettier configuration |
| `babel.config.js` | Babel configuration with path aliases |

## Testing Checklist

- [ ] `npm run ios` - iOS app launches in simulator
- [ ] `npm run android` - Android app launches in emulator
- [ ] `npm run lint` - No ESLint errors
- [ ] `npm run test` - Jest runs successfully
- [ ] Environment variables are accessible via `react-native-config`
- [ ] Path aliases resolve correctly

## Notes

- Use React Native 0.72+ for latest features
- Ensure Xcode and Android Studio are properly configured
- CocoaPods must be installed for iOS dependencies
- Path aliases require `babel-plugin-module-resolver` configuration

## Related Tasks

- **Next**: [TASK-002](task-002.md) - Design System & Theme Configuration
- **Parallel**: [TASK-007](task-007.md) - API Client Setup (can start after basic setup)
