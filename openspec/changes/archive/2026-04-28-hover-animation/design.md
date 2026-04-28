## Context

The landing page currently uses static cards with no interactive feedback beyond existing styling. This change adds a lightweight hover interaction to homepage cards to improve perceived responsiveness while keeping implementation inside existing static frontend files.

Constraints include preserving current architecture (plain HTML/CSS, no new framework or dependencies), keeping scope to `index.html` cards only, and avoiding unrelated 404-page or backend changes.

## Goals / Non-Goals

**Goals:**

- Add a subtle lift + shadow hover effect for homepage cards.
- Keep the interaction smooth for both hover-in and hover-out.
- Reuse existing style conventions and card selectors in `css/style.css`.

**Non-Goals:**

- Adding JavaScript-driven animation logic.
- Changing card content, page layout, or card structure beyond what is needed for style hooks.
- Adding reduced-motion behavior in this change.

## Decisions

1. Implement with CSS transitions on existing card styles.
   - Rationale: Pure CSS is sufficient for pointer hover feedback and matches project simplicity/CSP constraints.
   - Alternative considered: JavaScript class toggling for animation state. Rejected as unnecessary complexity.

2. Use small transform movement (`translateY`) plus a stronger hover shadow.
   - Rationale: This delivers the requested subtle effect without causing layout shifts.
   - Alternative considered: scale animation. Rejected because it can look more aggressive and alter visual rhythm.

3. Keep selectors scoped to homepage card styling patterns already used in `css/style.css`.
   - Rationale: Limits risk of unintentionally affecting non-card components.
   - Alternative considered: introducing new utility classes in markup. Rejected unless existing selectors prove insufficient during apply.

## Risks / Trade-offs

- [Risk] Hover-only affordances are less meaningful on touch devices. → Mitigation: Treat hover animation as an enhancement; no critical behavior depends on it.
- [Risk] Overly strong shadow/movement could feel distracting. → Mitigation: Keep transform distance and shadow delta small.
- [Trade-off] No reduced-motion handling in this change. → Mitigation: Keep animation subtle and time-bounded.

## Migration Plan

1. Update card hover/focus styling in `css/style.css` (and `index.html` only if additional class hooks are needed).
2. Verify visual behavior on homepage for hover-in and hover-out transitions.
3. Run repository checks before completing apply tasks.

Rollback strategy: revert the styling changes to return cards to static behavior.

## Open Questions

- None at proposal time.
