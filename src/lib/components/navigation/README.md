# Navigation Components

**Feature**: 003-navigation-ui-renewal
**Purpose**: Top navigation system with auto-hide behavior

## Components

- **TopNavigation.svelte**: Main navigation bar (US1)
  - Auto-hides on scroll down
  - Shows on scroll up
  - Transparent → opaque background transition

- **NavigationStore.ts**: Svelte store for navigation state
  - `isVisible`: boolean (auto-hide state)
  - `isTransparent`: boolean (background opacity)
  - `activeRoute`: string (current page)

## Usage

```svelte
<script>
  import TopNavigation from '$lib/components/navigation/TopNavigation.svelte';
</script>

<TopNavigation />
```
