<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: None (existing 5 principles preserved)
- Added sections:
  1. Principle VI: Backend Integration (PocketBase + MinIO)
  2. Principle VII: Production Readiness
  3. Frontend Page Architecture (service status table)
  4. Service Layer Architecture
  5. Backend Integration Checklist
- Removed sections: None
- Templates requiring updates:
  ✅ plan-template.md (Backend integration check added)
  ✅ spec-template.md (API requirements section added)
  ✅ tasks-template.md (Backend tasks category added)
- Follow-up TODOs:
  - TODO(PRODUCTION_URL): Production domain not yet configured
  - TODO(MONITORING): APM solution selection pending
- Ratification date: 2024-10-01
- Last amended: 2025-12-01
-->

# KBO Holographic Card Platform Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

Every feature MUST follow the three-document workflow:

1. **requirements.md** - User Story based functional requirements with WHEN-THEN acceptance criteria
2. **design.md** - Component interfaces, data models, architecture diagrams, error handling
3. **tasks.md** - Implementation checklist with Requirements traceability (_Requirements: X.X_)

**Rationale**: Ensures all stakeholders understand what is being built, why, and how before implementation begins. Prevents scope creep and provides clear success criteria.

**Enforcement**: No code may be written without corresponding spec documents. All PRs must reference specific requirement and task IDs.

### II. Phase-Based Architecture

The platform is organized into four independent phases that build upon each other:

- **Phase 1**: Enhanced Card Interaction (core holographic card system)
- **Phase 2**: Photocard Main Renewal (collection-focused main page)
- **Phase 3**: Integrated Holographic Platform (unification layer)
- **Phase 4**: Holographic Card Community (advanced social features)

Each phase MUST:
- Be independently testable
- Have clear interfaces to other phases
- Maintain backward compatibility when integrated
- Document all cross-phase dependencies

**Rationale**: Enables parallel development, reduces merge conflicts, allows incremental delivery, and makes it possible to ship Phase 1+2 while Phase 4 is still in development.

### III. 60fps Performance Standard (NON-NEGOTIABLE)

All holographic card animations and interactions MUST maintain 60fps (16.67ms per frame):

- CSS-based animations preferred over JavaScript
- `transform` and `opacity` only for animations (no layout thrashing)
- `will-change` for GPU acceleration on animated elements
- Performance budgets enforced via Lighthouse CI
- Chrome DevTools MCP validation required for all interactive features

**Rationale**: The holographic card effect is the core value proposition. Janky animations destroy the premium feel and break user immersion.

**Measurement**: Lighthouse performance score ≥90, no long tasks >50ms during card interactions.

### IV. Component Reusability

Shared components MUST be extracted to `src/lib/components/` with clear interfaces:

- Props explicitly typed with TypeScript
- Events documented with JSDoc comments
- Variants controlled via props (not duplicated components)
- Phase-specific behavior isolated via context props
- Zero cross-phase knowledge in reusable components

**Example**: `UnifiedHolographicCard` accepts `context: 'test' | 'main' | 'gallery'` prop instead of duplicating card logic across routes.

**Rationale**: Prevents code duplication across phases, ensures consistent UX, and simplifies maintenance and testing.

### V. User-Centric Design

All features MUST prioritize the Korean baseball fan experience:

- **Apple-level UX**: Smooth animations, clear hierarchy, delightful micro-interactions
- **Mobile-first**: Touch-optimized, responsive, performance-conscious
- **Korean baseball culture**: KBO team themes, fan rank system (신인 → 레전드), cheering song library
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support

**Rationale**: Differentiation comes from premium UX tailored to Korean baseball culture, not generic card collecting features.

**Validation**: Usability testing with actual KBO fans, accessibility audits with axe-core.

### VI. Backend Integration (NON-NEGOTIABLE)

All data operations MUST use the established backend architecture:

**Primary Backend: PocketBase**
- User authentication and session management
- Card metadata and collections
- Social features (likes, comments, follows)
- Real-time subscriptions for notifications

**File Storage: MinIO (S3-compatible)**
- Card images and thumbnails
- User avatars and uploads
- Template files and exports

**Service Layer Pattern:**
```
Frontend Component → Service Layer → PocketBase/MinIO → Response
```

All API calls MUST:
- Go through typed service functions in `src/lib/services/`
- Handle errors with user-friendly Korean messages
- Include loading states in UI
- Cache responses where appropriate

**Rationale**: Consistent data layer prevents scattered API calls, enables centralized error handling, and simplifies testing.

### VII. Production Readiness

All features MUST be production-ready before merge:

**Required Checks:**
- TypeScript strict mode passes
- No console errors in browser
- Mobile responsive (320px - 1920px)
- Error boundaries for graceful failures
- Loading states for async operations
- Empty states for lists/grids

**Prohibited in Production:**
- `console.log` statements (use proper logging)
- Hardcoded test data
- Disabled security features
- Unhandled promise rejections
- Memory leaks from subscriptions

**Rationale**: Technical debt compounds quickly. Ship quality from day one.

## Frontend Page Architecture

### Core Service Pages (Production Ready)

| Route | Status | Backend Integration |
|-------|--------|---------------------|
| `/` | ✅ Active | PocketBase (cards, users) |
| `/gallery` | ✅ Active | PocketBase (cards, filters) |
| `/create` | ✅ Active | MinIO (upload), PocketBase (save) |
| `/collections` | ✅ Active | PocketBase (user cards) |
| `/community` | ✅ Active | PocketBase (social) |
| `/gacha2` | ✅ Active | PocketBase (gacha results) |
| `/marketplace` | 🔄 In Progress | PocketBase (templates) |

### Authentication Pages

| Route | Status | Backend Integration |
|-------|--------|---------------------|
| `/auth/login` | ✅ Active | PocketBase Auth |
| `/auth/signup` | ✅ Active | PocketBase Auth |
| `/auth/callback` | ✅ Active | OAuth Provider |

### Informational Pages (Static)

| Route | Status | Backend Integration |
|-------|--------|---------------------|
| `/help` | ✅ Active | None (static) |
| `/contact` | ✅ Active | Email Service |
| `/privacy` | ✅ Active | None (static) |
| `/terms` | ✅ Active | None (static) |

### Demo/Test Pages (Development Only)

These pages MUST NOT be deployed to production:
- All routes ending in `-demo`, `-test`
- `/v2-prototype`, `/integrated`
- Temporary feature testing routes

## Service Layer Architecture

### Service Structure

```
src/lib/services/
├── auth.ts                 # Authentication logic
├── authService.ts          # Auth state management
├── cards.ts                # Card CRUD operations
├── collections.ts          # Collection management
├── communityService.ts     # Social features
├── gradeService.ts         # Fan grade system
├── messagingService.ts     # Real-time chat
├── notificationService.ts  # Push notifications
├── socialService.ts        # Likes, follows, shares
├── uploadService.ts        # File upload handling
├── upload.ts               # MinIO integration
└── pocketbase-extended.ts  # Extended PB services
```

### Service Requirements

Every service MUST:
1. Export typed interfaces for all data structures
2. Handle authentication state checks
3. Provide error messages in Korean
4. Support optimistic updates where appropriate
5. Include JSDoc documentation

### API Endpoints

```
src/routes/api/
├── upload/                 # File upload endpoints
│   ├── image/+server.ts    # Direct image upload
│   ├── base64/+server.ts   # Base64 image upload
│   └── presign/+server.ts  # Presigned URL generation
├── templates/              # Template marketplace
│   ├── +server.ts          # CRUD operations
│   ├── search/+server.ts   # Search functionality
│   └── trending/+server.ts # Trending templates
└── send-email/+server.ts   # Email notifications
```

## Performance Standards

### Mandatory Performance Requirements

- **Animation**: 60fps for all holographic effects and transitions
- **Initial Load**: Time to Interactive <3 seconds on 3G
- **Memory**: <100MB heap size for main application
- **Bundle Size**: <500KB initial JS bundle (gzipped)
- **Images**: WebP with fallbacks, lazy loading below fold
- **Holographic Effect**: <16ms computation per frame

### Performance Monitoring

- Lighthouse CI in GitHub Actions (blocks merge if score <90)
- Chrome DevTools MCP validation for visual regressions
- Real User Monitoring (RUM) via Vercel Analytics in production
- Performance budgets enforced via `vite-plugin-bundle-analyzer`

## Quality Standards

### Testing Requirements

1. **Unit Tests** (Vitest)
   - All utility functions MUST have unit tests
   - Component logic tests for state management
   - Target: 70% code coverage minimum

2. **Integration Tests**
   - Cross-component interactions (e.g., CollectionDashboard + HolographicCard)
   - Store updates propagate correctly
   - Error boundaries catch and display errors

3. **E2E Tests** (Playwright)
   - Critical user journeys (card flip, collection view, share to community)
   - Cross-browser: Chrome, Safari, Firefox
   - Mobile viewport testing

4. **Visual Validation** (Chrome DevTools MCP)
   - Holographic effects render correctly
   - No console errors during interactions
   - Network requests complete successfully
   - Screenshots for regression testing

### Code Quality

- **TypeScript**: Strict mode enabled, no `any` types without justification
- **Linting**: ESLint with Svelte plugin, zero warnings policy
- **Formatting**: Prettier with project config, enforced via pre-commit hook
- **Accessibility**: axe-core in CI, manual keyboard navigation testing

## Development Workflow

### Before Starting Implementation

1. Read phase-specific requirements.md
2. Review design.md for interfaces and architecture
3. Check tasks.md and mark task as 🔄 in progress
4. Verify Constitution Check passes (if in plan.md)

### During Implementation

1. Write tests first (TDD) or alongside implementation
2. Use Chrome DevTools MCP to validate rendering
3. Commit after each logical unit of work
4. Update tasks.md progress (✅ when complete)

### After Implementation

1. Run full test suite (`npm run test && npm run test:e2e`)
2. Verify 60fps performance via DevTools Performance panel
3. Check accessibility with browser extensions
4. Update design.md if implementation differs from spec
5. Request code review with requirement ID in PR description

### Backend Integration Checklist

Before merging any feature with backend integration:

- [ ] PocketBase schema exists and is documented
- [ ] Service layer function created and typed
- [ ] Error handling with user-friendly Korean messages
- [ ] Loading states implemented in UI
- [ ] Empty states handled gracefully
- [ ] Optimistic updates where appropriate
- [ ] Real-time subscriptions cleanup on unmount
- [ ] File uploads use MinIO through API routes

### Phase Integration

When integrating phases (e.g., Phase 3 unifying 1+2):

1. Create integration spec in `.kiro/specs/integrated-*/`
2. Document all cross-phase dependencies
3. Write integration tests BEFORE refactoring
4. Migrate incrementally (test each component independently)
5. Maintain parallel implementations until integration validated

## Technology Constraints

### Approved Stack

- **Frontend**: SvelteKit 4.x, TypeScript, Tailwind CSS 3.x
- **Backend**: PocketBase (SQLite → PostgreSQL for production)
- **File Storage**: MinIO (S3-compatible object storage)
- **Auth**: PocketBase Auth + OAuth (Google/GitHub)
- **Deployment**: Vercel (frontend) + Railway/Fly.io (PocketBase)
- **Testing**: Vitest, Playwright, axe-core, Chrome DevTools MCP

### Prohibited Patterns

- ❌ Heavy animation libraries (use CSS transforms only)
- ❌ jQuery or other DOM manipulation libraries
- ❌ Inline styles except for dynamic values (use Tailwind/CSS variables)
- ❌ Untyped props in Svelte components
- ❌ Direct DOM queries (use Svelte bindings)
- ❌ `any` types without explicit justification comment
- ❌ Direct PocketBase calls from components (use service layer)
- ❌ Storing sensitive data in localStorage

## Legal & Compliance

### Copyright Protection

- KBO/team logos MUST be detected and flagged via AI (Requirement 17)
- DMCA takedown process implemented
- User education on copyright during card creation
- Safe harbor provisions for user-generated content

### Content Moderation

- Automated filtering for official photos/videos
- Community reporting system
- Human review for flagged content
- Clear content policy and consequences

### Data Privacy

- GDPR/CCPA compliance for user data
- OAuth tokens stored securely (httpOnly cookies)
- PII encrypted at rest and in transit
- Right to deletion and data export

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. In case of conflict, constitution principles take precedence.

### Amendment Process

1. Propose amendment via GitHub issue with rationale
2. Discuss with team (minimum 3 business days)
3. Update constitution with version bump (semantic versioning)
4. Propagate changes to dependent templates
5. Document in Sync Impact Report (HTML comment at top)
6. Announce in team communication channel

### Versioning Policy

- **MAJOR**: Backward incompatible principle removal/redefinition (e.g., removing Phase-Based Architecture)
- **MINOR**: New principle added or materially expanded guidance (e.g., adding Security Standards section)
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Review

- All PRs MUST pass Constitution Check in CI
- Quarterly constitution review for relevance
- Complexity justification required for principle violations
- Performance audits monthly (60fps, load time, bundle size)

### Runtime Development Guidance

For day-to-day development guidance beyond governance, refer to:
- `.kiro/DEVELOPMENT_GUIDE.md` - Detailed implementation workflows
- `.kiro/PROJECT_OVERVIEW.md` - Phase structure and progress tracking
- `CLAUDE.md` - Quick reference and project summary

**Version**: 1.1.0 | **Ratified**: 2024-10-01 | **Last Amended**: 2025-12-01
