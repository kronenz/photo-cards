# Authentication Page Components

**Feature**: 003-navigation-ui-renewal (US4)
**Purpose**: Login, signup, and forgot password flows

## Components

- **LoginForm.svelte**: Email/password login
- **SignupForm.svelte**: User registration
- **ForgotPasswordForm.svelte**: Password reset flow
- **OAuth Buttons.svelte**: Google, GitHub OAuth

## Integration

Uses PocketBase auth service (`src/lib/services/auth.ts`).

## Validation

- Real-time field validation
- WCAG 2.1 AA compliant error messages
- Keyboard-only accessible
