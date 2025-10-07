<!--
Sync Impact Report:
- Version change: Initial → 1.0.0
- New constitution created for KBO Holographic Card Platform
- Principles established:
  1. Spec-Driven Development (requirements → design → tasks)
  2. Phase-Based Architecture (modular, incremental development)
  3. 60fps Performance Standard (non-negotiable UX requirement)
  4. Component Reusability (DRY across phases)
  5. User-Centric Design (Apple-level UX, Korean baseball culture)
- Templates requiring updates:
  ✅ plan-template.md (Constitution Check section aligns)
  ✅ spec-template.md (User Story format aligns)
  ✅ tasks-template.md (Phase-based organization aligns)
- Follow-up TODOs: None
- Ratification date set to project start: 2024-10-01
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
- **Auth**: @auth/sveltekit with Google/GitHub OAuth
- **Deployment**: Vercel with edge functions
- **Testing**: Vitest, Playwright, axe-core, Chrome DevTools MCP

### Prohibited Patterns

- ❌ Heavy animation libraries (use CSS transforms only)
- ❌ jQuery or other DOM manipulation libraries
- ❌ Inline styles except for dynamic values (use Tailwind/CSS variables)
- ❌ Untyped props in Svelte components
- ❌ Direct DOM queries (use Svelte bindings)
- ❌ `any` types without explicit justification comment

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

**Version**: 1.0.0 | **Ratified**: 2024-10-01 | **Last Amended**: 2025-10-07
