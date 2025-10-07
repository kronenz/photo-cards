# Technical Research Report: Integrated Holographic Platform (Phase 3)

**Date**: 2025-10-07
**Status**: Completed
**Purpose**: Resolve technical unknowns for Phase 1, 2, 4 integration

## Executive Summary

This research provides concrete technical decisions for integrating three phases: Enhanced Card Interaction (Phase 1), Photocard Main Renewal (Phase 2), and Holographic Card Community (Phase 4). All unknowns from Technical Context have been resolved with actionable implementation guidance.

---

## 1. Component Wrapper Pattern

**Decision**: Compound Component Pattern with Context API

**Rationale**:
- Zero prop drilling through Svelte Context API
- Maintains existing Enhanced Card logic without modification
- Type-safe with TypeScript helper functions
- Component-scoped isolation prevents global state pollution

**Implementation**:
```typescript
// UnifiedHolographicCard wraps existing HolographicCard
// Uses writable stores in context for reactivity
// Context prop ('test' | 'main' | 'gallery' | 'community') isolates phase-specific behavior
```

**Alternatives Considered**: Slots-only (no state sharing), Global Stores (tight coupling), Prop Drilling (maintenance overhead)

---

## 2. State Management Strategy

**Decision**: Hybrid Approach - Svelte Stores + Context API

**Rationale**:
- Context API for component-scoped state (card interactions, UI state)
- Svelte Stores for cross-cutting concerns (user preferences, collection data)
- Derived stores for computed values avoid manual synchronization
- Localized state reduces unnecessary re-renders

**Architecture**:
- Local: CardContext (isFlipped, isInteracting, holographicParams)
- Global: collectionStore, userStatsStore
- Derived: completedCollections

**Alternatives Considered**: Pure Prop Drilling (overhead), Global Stores Only (coupling), Redux/Zustand (overkill)

---

## 3. Data Migration Approach

**Decision**: Blue-Green Deployment with Schema Versioning

**Rationale**:
- Realistic: PocketBase/SQLite ~1s downtime (not true zero-downtime)
- Safe: Blue-green allows testing before traffic switch
- Rollback-friendly: Instant switch back if issues arise
- Client-friendly: WebSocket auto-reconnection minimizes impact

**Process**:
1. Deploy new version (green) without switching traffic
2. Run PocketBase migrations on new instance
3. Verify new instance works
4. Switch traffic (~1s downtime)
5. Monitor, rollback if needed

**Alternatives Considered**: Live Migration (SQLite locking issues), Dual-Write (complex, error-prone), CDC (overkill)

---

## 4. Virtual Scrolling Library

**Decision**: TanStack Virtual v3

**Installation**: `npm install @tanstack/svelte-virtual`

**Rationale**:
- Industry-standard: 60fps is "table stakes"
- Official Svelte adapter available
- Multi-column support (lanes feature) for grid layouts
- Performance: 5s→0.1s initial render (50x improvement)

**Benchmarks**:
- Before: 5+ seconds for 10,000 items
- After: <100ms initial render, 60fps scrolling
- Memory: Only renders visible items + overscan (~15-20 items)

**Alternatives Considered**: svelte-virtual-scroll-list (unmaintained), Custom (complex), IntersectionObserver (not 60fps)

---

## 5. Pointer Events Unification

**Decision**: Pointer Events API with svelte-gestures

**Installation**: `npm install svelte-gestures`

**Rationale**:
- Cross-platform: Single event model for mouse, touch, stylus
- Simpler code: Eliminates duplicate mouse/touch logic
- Better performance: Fewer event listeners
- Library support: High-level gesture abstractions (pan, tap)

**Implementation Notes**:
- Set `touch-action: pan-y` CSS to control default behaviors
- Use throttle for pointer updates: `throttle(updateHolographic, 16)` (60fps)
- Handle `pointercancel` for robust cleanup

**Alternatives Considered**: Separate Mouse/Touch (duplication), Pure Pointer (gesture complexity), Hammer.js (outdated)

---

## 6. Performance Monitoring

**Decision**: Chrome DevTools Performance API + Playwright + Vitest

**Approach**:
- **Development**: Real-time FPS monitor overlay (dev-only)
- **CI/CD**: Playwright with Chrome DevTools Protocol for automated tests
- **Unit**: Vitest for component-level performance benchmarks

**Implementation**:
```typescript
// PerformanceMonitor class with requestAnimationFrame
// Playwright: page.evaluate() to access Performance API
// Vitest: performance.now() for render timing
```

**Gates**:
- Average FPS ≥ 55 (allowing 5fps tolerance)
- Frame drops < 5%
- Long Tasks (>50ms) = 0

**Alternatives Considered**: Manual Testing (inconsistent), Lighthouse CI (less granular), Third-Party APM (overkill)

---

## 7. Backward Compatibility Testing

**Decision**: Contract Testing with Vitest + Visual Regression with Playwright

**Approach**:
- **Contract Tests**: Ensure UnifiedCard maintains same API as Enhanced Card
- **Visual Regression**: Snapshot testing for UI consistency
- **E2E Tests**: Verify /test and /gallery pages work after integration

**Test Types**:
1. **Contract**: Props, events, HTML structure compatibility
2. **Visual**: Screenshot comparison (max 100 pixel diff)
3. **E2E**: Full user flows on /test and /gallery

**Alternatives Considered**: Manual Testing (time cost), Screenshot Only (insufficient), HTML Snapshots (too brittle)

---

## Summary Comparison Table

| Aspect | Approach | Key Library/Tool | Performance Impact | Complexity |
|--------|----------|------------------|-------------------|-----------|
| Component Wrapper | Compound + Context | Svelte Context API | None | Low |
| State Management | Hybrid (Stores + Context) | Svelte Stores | Minimal | Medium |
| Data Migration | Blue-Green + Versioning | PocketBase Migrations | ~1s downtime | Medium |
| Virtual Scrolling | TanStack Virtual | @tanstack/svelte-virtual | 50x improvement | Low |
| Pointer Events | Pointer API | svelte-gestures | Minor | Low |
| Performance Monitoring | CDP + Playwright | Playwright CDP | Dev/CI-only | Medium |
| Compatibility Testing | Contract + Visual + E2E | Vitest + Playwright | CI-only | High |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. Install: `@tanstack/svelte-virtual`, `svelte-gestures`
2. Create `UnifiedHolographicCard` wrapper with Context API
3. Implement Pointer Events handlers

### Phase 2: Integration (Week 2)
4. Set up state management (stores + context)
5. Migrate /test page to use UnifiedCard
6. Implement virtual scrolling for /gallery

### Phase 3: Testing (Week 3)
7. Write contract tests for API compatibility
8. Set up Playwright visual regression tests
9. Implement performance monitoring in dev

### Phase 4: Production (Week 4)
10. Create PocketBase migration scripts
11. Test blue-green deployment locally
12. Deploy to production with monitoring

---

## Dependencies to Install

```bash
npm install @tanstack/svelte-virtual svelte-gestures
npm install -D @playwright/test vitest @vitest/ui
```

---

## References

- [TanStack Virtual Docs](https://tanstack.com/virtual/latest)
- [Svelte Context API](https://svelte.dev/docs/svelte/context)
- [Pointer Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [Playwright Performance Testing](https://playwright.dev/)
- [Svelte Compound Components](https://www.manuelsanchezdev.com/blog/compound-components-pattern-svelte-react-api)

---

**All technical unknowns resolved** - Ready for Phase 1 Design & Contracts
