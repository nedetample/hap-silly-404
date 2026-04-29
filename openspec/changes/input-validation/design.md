## Context

`netlify/functions/insult.mjs` currently gates requests by method, configuration, and origin/referer, then proceeds to API key and Groq/fallback behavior. For Track 2, we are adding validation for a caller-provided `path` query value to reduce malformed input risk and make failure behavior explicit/testable.

The existing security architecture must remain intact: no weakened origin checks, no wildcard CORS, and no reordering that bypasses current guards. The handler order in `AGENTS.md` is authoritative.

## Goals / Non-Goals

**Goals:**

- Validate optional `path` query input (`/` prefix, max 120 chars, printable URL-path-safe characters).
- Return deterministic `400` JSON for invalid `path` and stop before API-key/Groq logic.
- Preserve origin/referer enforcement as the first security gate.
- Define test-first implementation tasks with vitest scenarios mapped from spec.

**Non-Goals:**

- Reworking CORS/origin policy or rate-limit configuration.
- Changing fallback insult strategy for valid requests.
- Adding new external dependencies.
- Introducing frontend behavior changes in this change.

## Decisions

1. Parse query params from `new URL(request.url)` and validate `path` only when present.
   - Rationale: keeps compatibility with current clients and avoids forcing new required inputs.
   - Alternative considered: require `path` always. Rejected to avoid breaking existing callers.

2. Insert path validation after same-origin check and before API key check.
   - Rationale: preserves "origin check is first gate" while still short-circuiting invalid input before any Groq call.
   - Alternative considered: validate before origin check. Rejected because it changes gate precedence and reveals validation semantics to non-approved origins.

3. Reject invalid values with `400` and JSON error payload.
   - Rationale: explicit client error is clearer and testable; aligns with user's chosen behavior.
   - Alternative considered: silent fallback on invalid input. Rejected because it hides bad input and weakens contract clarity.

4. Add vitest coverage first (red) for valid path, invalid path, and cross-origin precedence.
   - Rationale: Track 2 requires TDD and scenario-to-test mapping.
   - Alternative considered: implementation-first testing. Rejected by assignment rules.

## Risks / Trade-offs

- [Risk] Character allowlist could reject legitimate edge-case paths. → Mitigation: document accepted pattern and keep rules narrowly scoped to requested constraints.
- [Risk] Error-message detail can leak validation internals. → Mitigation: return concise generic validation errors without exposing internal regex details.
- [Trade-off] Optional `path` means some requests keep legacy behavior. → Mitigation: this preserves backward compatibility while adding secure handling for new input.

## Migration Plan

1. Add/confirm tests in `tests/` from spec scenarios (red first).
2. Implement query parsing + validation in `insult.mjs` at the chosen insertion point.
3. Run tests and `npm run check`; adjust until green.
4. Complete tasks one at a time per apply workflow.

Rollback strategy: revert the input-validation changes in `insult.mjs` and associated tests.

## Open Questions

- None at this stage.
