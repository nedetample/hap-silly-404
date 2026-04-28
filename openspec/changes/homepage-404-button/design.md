## Context

This change is the Part 4A dry-run feature used to validate the spec-driven workflow with a small, deterministic frontend outcome. The landing page (`index.html`) currently has no interactive path to intentionally trigger the 404 page, so visitors must manually type a broken path.

Constraints include keeping the scope intentionally tiny, avoiding backend changes, and preserving existing security posture (no inline scripts, no risky DOM patterns). The expected experience is a static navigation affordance that behaves like normal site navigation.

## Goals / Non-Goals

**Goals:**

- Add one clear homepage button with deterministic copy and destination.
- Ensure the button is accessible with explicit labeling.
- Keep implementation confined to existing static frontend surfaces.

**Non-Goals:**

- Adding JavaScript behavior (analytics, tracking, click handlers, or dynamic state).
- Changing 404 page rendering, roast generation, or serverless behavior.
- Introducing new dependencies or new UX variants (secondary copy, modal confirmations, or A/B alternatives).

## Decisions

1. Use a standard anchor-based navigation control rendered as a button-styled element in `index.html`.
   - Rationale: Navigation is semantic and robust with links, requires no script, and is aligned with current CSP constraints.
   - Alternative considered: JavaScript click handler with `window.location`. Rejected as unnecessary complexity for static navigation.

2. Use fixed content values from approved defaults:
   - Visible label: `Try the 404 roast`
   - Target URL: `/this-page-does-not-exist`
   - Opens in same tab
   - `aria-label`: `Go to a missing page to view the 404 roast`
   - Rationale: Deterministic values create convergence across student outputs and make review straightforward.
   - Alternative considered: letting implementers pick values ad hoc. Rejected because it reduces comparability in the PoC pass.

3. Keep styling changes minimal and reuse existing style conventions if visual adjustments are needed.
   - Rationale: The objective is workflow validation, not UI redesign.
   - Alternative considered: introducing a new component style system. Rejected as out of scope.

## Risks / Trade-offs

- [Risk] Link destination could accidentally map to a valid route in future changes. → Mitigation: Use a clearly synthetic path (`/this-page-does-not-exist`) and keep it documented in spec scenarios.
- [Trade-off] Hardcoded button copy reduces flexibility for future UX experiments. → Mitigation: Treat this as PoC scope only; future features can modify copy via a new change.
- [Risk] Styling inconsistency if no existing button pattern is reused. → Mitigation: During apply, match existing typography/spacing tokens and avoid one-off visual patterns.
