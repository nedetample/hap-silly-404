## Why

The function currently accepts requests without validating a caller-supplied route context, which limits control over prompt inputs and error handling for malformed values. Adding explicit query input validation now strengthens Track 2 security posture and creates testable behavior before implementation.

## What Changes

- Add support for a `path` query parameter and validate it before any Groq call.
- Enforce validation rules for `path`: must start with `/`, max length 120, and printable URL-path-safe characters only.
- Return `400` with JSON error when `path` fails validation, and skip Groq/fallback generation for invalid input.
- Preserve existing handler gate order, especially origin/referer protection as the first request-auth gate.

## Capabilities

### New Capabilities

- `insult-path-input-validation`: Defines accepted `path` query input, rejection behavior for invalid values, and request flow placement in `insult.mjs`.

### Modified Capabilities

- None.

## Impact

- Affected code (expected during apply): `netlify/functions/insult.mjs`, plus new vitest coverage under `tests/`.
- API behavior update: endpoint now recognizes optional `path` and can return `400` for invalid values.
- No new dependencies required.
