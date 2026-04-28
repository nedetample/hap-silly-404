## Why

Part 4A requires a tiny, shared frontend feature so everyone can practice the full OpenSpec loop on the same outcome. A homepage button that intentionally links to a known-bad URL makes the 404 experience discoverable without requiring manual URL typing.

## What Changes

- Add a button on `index.html` with label text `Try the 404 roast`.
- The button links to `/this-page-does-not-exist` in the same tab.
- The button includes `aria-label="Go to a missing page to view the 404 roast"` for accessible intent clarity.
- Define requirement-level behavior so implementation and review are testable and consistent across student submissions.

## Capabilities

### New Capabilities

- `homepage-404-button`: Defines homepage behavior for a dedicated button that sends visitors to a known-bad route to trigger the 404 page.

### Modified Capabilities

- None.

## Impact

- Affected files (expected during apply): `index.html`, potentially `css/style.css` for styling alignment.
- No API changes, no dependency additions, and no serverless/backend behavior changes.
