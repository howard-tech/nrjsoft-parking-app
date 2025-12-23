# TASK-005: Authentication Screen & OTP Flow

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-005 |
| **Module** | Authentication |
| **Priority** | Critical |
| **Estimated Effort** | 10 hours |
| **Dependencies** | TASK-003, TASK-007 |
| **Status** | 🔴 Not Started |

## Description

Implement the authentication screen with OTP-based login flow. Users can authenticate using mobile number (primary) or corporate email. The flow includes OTP verification, social login options (Google/Apple), and GDPR consent checkbox.

## Context from Technical Proposal (Page 5)

### Key Features:
- **Input Fields**: Mobile Number (Primary ID) or Email
- **OTP Verification**: SMS code entry for security (4-digit code, 90s expiry)
- **Social Login**: Google/Apple Sign-in (for speed)
- **T&C Checkbox**: GDPR compliance consent required before login

### UI Elements:
- NRJ Soft logo at top
- "Secure sign in" title with "OTP enforced and GDPR consent required" subtitle
- Tab selector: "Mobile number" | "Corporate email"
- OTP verification field (4 boxes)
- Social login buttons
- GDPR consent checkbox
- "Secure login" button

## Acceptance Criteria

- [ ] Login screen with Mobile/Email tab selector
- [ ] Phone number input with international format
- [ ] 4-digit OTP input with auto-focus
- [ ] 90-second countdown timer
- [ ] Resend OTP option after countdown
- [ ] Google/Apple Sign-In integration
- [ ] GDPR consent checkbox required
- [ ] Error handling and loading states
- [ ] Successful auth navigates to main app

## Technical Implementation

### OTP Input Component

```typescript
// src/components/common/OTPInput.tsx
interface OTPInputProps {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value, onChangeText, length = 4, autoFocus = false
}) => {
  // Auto-focus next input on digit entry
  // Handle backspace to focus previous
  // Support paste of full OTP code
  // Use oneTimeCode textContentType for SMS autofill
};
```

### Login Screen State

```typescript
const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
const [phoneNumber, setPhoneNumber] = useState('');
const [email, setEmail] = useState('');
const [otp, setOtp] = useState('');
const [otpSent, setOtpSent] = useState(false);
const [gdprConsent, setGdprConsent] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [canResend, setCanResend] = useState(false);
```

### API Endpoints

```typescript
// POST /auth/otp-request
{ type: "phone" | "email", identifier: string }

// POST /auth/otp-verify
{ type: "phone" | "email", identifier: string, otp: string }
// Response: { accessToken, refreshToken, user }
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/auth/LoginScreen.tsx` | Main login screen |
| `src/screens/auth/components/SocialLoginButtons.tsx` | Google/Apple buttons |
| `src/screens/auth/components/CountdownTimer.tsx` | OTP countdown |
| `src/components/common/OTPInput.tsx` | 4-digit OTP input |
| `src/components/common/PhoneInput.tsx` | International phone input |
| `src/components/common/Checkbox.tsx` | Checkbox component |

## Testing Checklist

- [ ] Phone/Email validation works
- [ ] OTP auto-focus between boxes
- [ ] Countdown timer displays correctly
- [ ] Social login integration works
- [ ] GDPR checkbox blocks submission
- [ ] Error states display properly
- [ ] Successful login navigates correctly

## Related Tasks

- **Previous**: [TASK-004](task-004.md) - Onboarding
- **Next**: [TASK-006](task-006.md) - Auth Service
- **Depends on**: [TASK-007](task-007.md) - API Client
