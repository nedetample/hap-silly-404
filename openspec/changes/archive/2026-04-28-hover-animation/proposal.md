## Why

The homepage currently feels static even when users interact with its main content blocks. Adding a subtle hover animation to the homepage cards makes the page feel more responsive and engaging for Track 1 without changing core content or navigation behavior.

## What Changes

- Add a hover interaction pattern for cards on `index.html` using a subtle lift and shadow transition.
- Define requirement-level behavior for visual response on pointer hover so implementation and review are consistent.
- Keep the scope limited to homepage cards only; no 404-page animation changes in this change.

## Capabilities

### New Capabilities

- `homepage-card-hover-animation`: Defines how homepage cards visually respond to hover with a subtle lift and shadow transition.

### Modified Capabilities

- None.

## Impact

- Affected code (expected during apply): `css/style.css` and potentially `index.html` only if class hooks are needed.
- No API changes, no serverless changes, and no dependency additions.
