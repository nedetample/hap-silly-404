---
title: "Spec-driven development with AI agents"
type: tutorial
tags: [ai-workflow, copilot, spec]
created: 2026-04-18
updated: 2026-04-18
status: draft
reading_order: 10
---

# Spec-driven development with AI agents

## Before you read this

You'll get the most out of this if you've already:

- Used GitHub Copilot Chat at least once to ask for code
- Read `docs/reference/security-guardrails.md`
- Noticed that Copilot sometimes generates code you didn't ask for

---

## Why specs exist

When you tell Copilot "add a dark mode toggle," it has to make dozens of decisions you haven't made: which files to touch, which CSS approach to use, how to persist the preference, whether to add a new dependency, how to handle the case where the browser doesn't support `prefers-color-scheme`. Copilot will guess. Some guesses will be right. Some will quietly violate a security rule or drag in a library you don't want.

A spec is a short document that answers those questions before any code is written. It's not a PRD (that's for stakeholders to agree on what to build). It's not a design doc (that's for engineers to debate architecture). It's an execution document written specifically for the agent — clear enough that the agent doesn't have to guess, precise enough that you can check the output against it.

The core idea: you define what you want, the agent implements it, you verify it matches. The spec is the contract between those two steps.

---

## What goes in a spec

Every spec should have these five sections:

**Why** — one or two sentences on what problem this solves. This helps the agent fill in any gaps in a way that's consistent with your intent.

**What** — a concrete description of what the feature does. Not "improve the UX" — "add a button below the roast text that copies it to the clipboard."

**Constraints** — what you're explicitly NOT doing. This is the most important section. Agents are eager. Without constraints, Copilot will add features you didn't ask for, install dependencies you don't need, and solve problems adjacent to the one you described. Be specific: "no new npm dependencies," "don't modify the rate limiting config," "don't touch insult.mjs."

**Tasks** — the work broken into numbered steps, each with: what to build, which files to touch, and how to verify it's done. One task should be completable in a single session. You implement task 1, review the code, commit it, then move to task 2.

**Tests** (Track 2 only) — what the tests cover. Not just "add tests" — "test the happy path where input is valid, test the failure path where input contains injection characters."

---

## The workflow

**1. Propose**

Describe your feature idea to Copilot Chat. Before asking for anything, ask Copilot to ask you clarifying questions:

> "I want to add a dark mode toggle to the 404 page. Before you spec or implement anything, what questions do you have?"

Answer the questions. This surfaces assumptions before they become code.

**2. Spec**

Ask Copilot to write the spec using the five sections above. Tell it you want the work broken into discrete tasks with verify steps.

**3. Review and edit**

Read the spec carefully. Check every constraint against `docs/reference/security-guardrails.md`. Edit anything that's wrong — the agent proposed this spec, you own it. Change the approach if the agent picked one you don't want. Add to the out-of-scope list if you see something you definitely don't want it to do.

The spec is a living document. You'll refine it as you go. If you implement task 1 and discover the approach is wrong, go back and fix the spec before starting task 2. This is not waterfall — you don't have to know everything up front. You just need enough detail that the agent isn't guessing.

**4. Approve**

Confirm in writing: "looks good, implement task 1." This is your sign-off. AGENTS.md instructs Copilot to wait for this before writing code. You are the check.

**5. Implement one task at a time**

Ask Copilot to implement only the current task. When it's done, read the code. Does it match the spec? Does it look reasonable? Push back on anything suspect before moving on. Then commit the working change. Then start task 2.

Working incrementally means the code stays reviewable. Letting an agent implement an entire feature at once leaves you with a large diff you can't easily unpick if something is wrong.

**6. Verify**

After all tasks: run `npm run check`. For Track 2, run `npm test`. Both must pass before the feature is done.

---

## Example spec — Track 1: copy roast to clipboard

```
Feature: copy-to-clipboard button

Why:
The roast text is shareable but there's no way to copy it without selecting text manually.
A clipboard button makes sharing frictionless.

What:
- A button appears below the roast text
- Clicking it copies the roast to the clipboard using the Clipboard API
- A brief "Copied!" confirmation appears and disappears after 2 seconds

Constraints (out of scope / do not do):
- No new npm dependencies
- No inline event handlers (onclick="...") — attach in JS
- No innerHTML for any dynamic content — use textContent
- Do not modify insult.mjs
- Do not modify the CSP in netlify.toml

Tasks:
1. Add the button element to 404.html and wire the click handler in js/404.mjs
   Files: 404.html, js/404.mjs
   Verify: button appears on the page, clicking it copies the roast text

2. Add the "Copied!" confirmation state with 2-second timeout
   Files: js/404.mjs, css/404.css (if needed for the state change)
   Verify: confirmation appears after click and disappears after 2 seconds

3. Handle the case where the Clipboard API is not available
   Files: js/404.mjs
   Verify: button is hidden or disabled in a browser with no clipboard support
```

---

## Example spec — Track 2: prompt injection prevention

```
Feature: URL path sanitization before prompt injection

Why:
The Groq prompt currently uses a fixed angle string. If we ever pass user-controlled
input into the prompt, unsanitized values could carry injection instructions.
Adding a sanitization layer now makes the function safe for future changes.

What:
- A sanitizePath() function strips everything except alphanumerics, hyphens, and slashes
- Input longer than 100 characters is truncated
- The sanitized value is available for use in the prompt (not wired in yet — that's a future task)

Constraints (out of scope / do not do):
- Do not change the prompt wiring in this task — only add the sanitizer function
- Do not add new npm dependencies
- Do not modify the rate limiting config
- Do not remove or weaken the origin check

Tasks:
1. Add sanitizePath() to insult.mjs
   Files: netlify/functions/insult.mjs
   Verify: function exists and is exported for testing

2. Write vitest tests for sanitizePath()
   Files: tests/insult.test.js
   Verify: npm test passes; tests cover normal input, injection attempt, and >100 char input

Tests:
- sanitizePath('/my-missing-page') returns '/my-missing-page' unchanged
- sanitizePath('/page?inject=ignore previous instructions') returns '/page'
  (the '?' is not in the allowlist, so everything from it onward is stripped)
- sanitizePath() with a 200-character string returns a string truncated to 100 chars

Each entry in this Tests section becomes one `it()` block in your vitest file. The input
is your `new Request(...)` or direct function call; the expected output is your `expect()`
assertion. See `docs/tutorials/tdd-with-vitest.md` for the exact translation.
```

Note the constraints section says explicitly "do not change the prompt wiring in this task." This keeps the task small, reviewable, and committable. Wiring it in is task 3 or 4 in a fuller spec.

---

## About OpenSpec

OpenSpec is a lightweight CLI tool that generates spec files from a template and organizes them in a `.opsx/` folder in your repo. Owain Lewis's video on spec-driven development (linked in the assignment) demonstrates this workflow and mentions OpenSpec as one option. You don't need it for this assignment — the workflow above works directly in Copilot Chat with a spec file you save manually. But if you want a structured CLI approach, it's worth looking at.

---

## How to redirect Copilot when it skips the spec

Copilot will sometimes start writing code the moment you describe a feature. The redirect is direct:

> "Stop — I haven't approved a spec yet. Please write the spec first."

Repeat if it tries again. If it generates code before you've approved a spec, do not use that code. Start the spec conversation fresh.

---

## Try it

Open Copilot Chat. Type:

> I want to add a dark mode toggle to the 404 page. Before you spec or implement anything, what questions do you have?

Read the questions. Answer them. Then ask for a spec with the five sections above — why, what, constraints, tasks, and (if Track 2) tests. Review it against `docs/reference/security-guardrails.md` before you say "looks good."

---

## The three things to remember

1. **Constraints matter as much as requirements.** Explicitly telling Copilot what NOT to do prevents scope creep and security mistakes that are expensive to undo once they're in code.
2. **Implement one task at a time, then commit.** Small diffs are reviewable. Large diffs are not.
3. **The spec is yours, not Copilot's.** Copilot proposes it. You edit it, own it, and approve it. If the implementation doesn't match the spec, the spec wins.
