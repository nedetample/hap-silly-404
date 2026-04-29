## 1. Test-first coverage for input validation

- [x] 1.1 Create/expand vitest coverage in `tests/` for valid `path` query input that should continue normal response flow.
- [x] 1.2 Add a failing vitest case for invalid `path` values asserting `400` JSON response and no roast payload.
- [x] 1.3 Add a failing vitest case proving cross-origin requests still return `403` even when `path` is invalid.

## 2. Handler implementation and verification

- [ ] 2.1 Implement `path` query parsing and validation in `netlify/functions/insult.mjs` after origin/referer check and before API-key/Groq logic.
- [ ] 2.2 Return `400` JSON for invalid `path` values while preserving existing behavior for valid/missing `path`.
- [ ] 2.3 Run `npm run test` and `npm run check`, then resolve any failures before marking the change complete.
