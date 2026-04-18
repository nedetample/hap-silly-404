---
title: "TDD with vitest"
type: tutorial
sources:
  - "[[serverless-functions-101]]"
tags: [netlify, api-security]
created: 2026-04-18
updated: 2026-04-18
status: draft
reading_order: 11
---

# TDD with vitest

## Before you read this

You'll get the most out of this if you've already:

- Read the serverless functions tutorial (`docs/tutorials/serverless-functions-101.md`) — you need a clear picture of what `insult.mjs` does and how the handler is structured
- Have vitest installed (`npm install --save-dev vitest`) and the `test` and `test:watch` scripts added to `package.json`
- Know what a function call is

---

## What TDD means in practice

Test-driven development is a specific order of operations:

1. Write the test first. It describes the behavior you want.
2. Run it. It fails — the code doesn't exist yet. This is "red."
3. Write the minimum code to make the test pass. This is "green."
4. Clean up the code without breaking the test. This is "refactor."

The key is step 2: the test must fail first. A test that passes before you've written the code isn't testing anything — it might be testing the wrong thing, or nothing at all. The red state is proof that the test is real.

In practice for Track 2: you write the test for your new function or behavior, confirm it fails, then implement the feature until the test passes.

---

## Vitest setup

After running `npm install --save-dev vitest`, add these two scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

`vitest run` runs all tests once and exits — use this for CI and pre-submit checks. `vitest` (no arguments) runs in watch mode and re-runs tests on every file save. Leave watch mode running in a terminal split while you work.

Tests go in a `tests/` directory at the repo root:

```bash
mkdir tests
```

Vitest discovers test files automatically by looking for files matching `*.test.*` or `*.spec.*`, and files in a `__tests__` directory. Either convention works. This repo uses `tests/`.

---

## Why testing `insult.mjs` is straightforward

Node 22 has `Request` and `Response` as globals — the same Web API the browser uses, built into the runtime. You don't need a mocking library to test the handler. You create a real `Request` object, call `handler()`, and inspect the `Response`.

```js
const req = new Request("http://localhost/.netlify/functions/insult", {
  method: "GET",
  headers: { origin: "http://localhost:8888" },
});
const res = await handler(req);
// res is a real Response object
expect(res.status).toBe(200);
```

No `supertest`, no `node-fetch`, no mocking framework for basic cases.

---

## The `getConfig()` testability pattern

`insult.mjs` reads `process.env.NETLIFY_DEV` and `process.env.SITE_URL` inside `getConfig()`, which is called at the start of every handler invocation. This is not an accident.

If those values were module-level constants:

```js
// at module level — don't do this for testable code
const isLocalDev = process.env.NETLIFY_DEV === "true";
```

...they'd be evaluated once when Node first imports the module. You'd have to reset the module cache between tests to change `process.env`. That's awkward and fragile.

With `getConfig()`, each test can set `process.env` before calling `handler()` and the handler will see the updated values:

```js
process.env.NETLIFY_DEV = "true";
delete process.env.SITE_URL;
const res = await handler(req);
// getConfig() reads NETLIFY_DEV="true" and defaults to localhost:8888
```

Set env vars in `beforeEach`, clean them up in `afterEach`. Each test starts from a known state.

---

## Three tests with full code

```js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import handler from "../netlify/functions/insult.mjs";

describe("insult handler", () => {
  beforeEach(() => {
    process.env.NETLIFY_DEV = "true";
    delete process.env.SITE_URL;
  });

  afterEach(() => {
    delete process.env.NETLIFY_DEV;
    delete process.env.SITE_URL;
  });

  it("returns 405 for non-GET requests", async () => {
    const req = new Request("http://localhost/.netlify/functions/insult", {
      method: "POST",
      headers: { origin: "http://localhost:8888" },
    });
    const res = await handler(req);
    expect(res.status).toBe(405);
  });

  it("returns 403 when origin does not match", async () => {
    const req = new Request("http://localhost/.netlify/functions/insult", {
      headers: { origin: "https://evil.example" },
    });
    const res = await handler(req);
    expect(res.status).toBe(403);
  });

  it("returns 200 with insult when origin matches", async () => {
    const req = new Request("http://localhost/.netlify/functions/insult", {
      headers: { origin: "http://localhost:8888" },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("insult");
    expect(body).toHaveProperty("source");
  });
});
```

**Test 1 — 405 for non-GET:**
`beforeEach` sets `NETLIFY_DEV=true` so `allowedOrigin` resolves to `http://localhost:8888`. The request uses `method: "POST"`. The handler hits the method check before it reaches the origin check, returns 405. The assertion confirms the method check runs first and returns the right status.

**Test 2 — 403 for wrong origin:**
The request is a GET (the default when no method is specified) with `origin: "https://evil.example"`. `allowedOrigin` is `http://localhost:8888` because `NETLIFY_DEV=true`. The origin check compares them — they don't match — and returns 403. The assertion confirms the origin check works.

**Test 3 — 200 with correct shape:**
A valid GET from the correct origin. `GROQ_API_KEY` is not set in the test environment, so the handler hits the API key check and returns a fallback insult with `source: "fallback"`. The response is still 200. The assertions confirm the response has the expected shape (`insult` and `source` properties) without caring about the specific values.

---

## The red/green cycle

Save the test file before you write any implementation. Run:

```bash
npm run test:watch
```

The test runner starts and shows all three tests. If you've imported a handler that doesn't exist yet, it fails with an import error — that's red. Write the code, save, watch the tests go green.

For Track 2, the cycle is:

1. Write a test for your new function (e.g., `sanitizePath()`).
2. Save. The test fails — `sanitizePath` doesn't exist yet.
3. Add the function to `insult.mjs`.
4. Watch the test pass.

---

## Track 2 requirement

Every Track 2 feature needs at minimum:

- One happy-path test — the feature works as intended with valid input
- One failure-path test — the feature handles bad input or a missing dependency correctly

The happy path proves the feature works. The failure path proves it doesn't break the surrounding code when something goes wrong.

---

## Try it

1. Create `tests/insult.test.js`.
2. Copy the first test from the three tests above into the file (the 405 test).
3. Run `npm test`. Confirm it passes.
4. Change the `expect(res.status).toBe(405)` to `expect(res.status).toBe(999)` — a status that doesn't exist.
5. Run `npm test` again. Confirm it fails with the mismatch you introduced.
6. Revert the change and confirm it goes green.

That round trip — write, pass, break, fail, fix, pass — is the core of TDD.

---

## The three things to remember

1. **The test must fail before it can mean anything.** Run it before writing the implementation. Red first, then green.
2. **Set `process.env` in `beforeEach`, clean it in `afterEach`.** The `getConfig()` pattern makes this work — each handler call sees the env as it is at call time.
3. **Track 2 needs a happy path and a failure path.** One test proves the feature works; one test proves it doesn't break things when it doesn't.
