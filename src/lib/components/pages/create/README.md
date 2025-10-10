# Card Create Page Components

**Feature**: 003-navigation-ui-renewal (US2)
**Purpose**: Components for creating holographic cards

## Components

- **CardForm.svelte**: Main creation form
- **ImageUploader.svelte**: Drag-and-drop image upload
- **HolographicPreview.svelte**: Live preview of card
- **EffectControls.svelte**: Holographic effect sliders
- **SaveDraftButton.svelte**: Auto-save to localStorage

## Integration

Uses PocketBase service layer (`src/lib/services/cards.ts`) for backend calls.
