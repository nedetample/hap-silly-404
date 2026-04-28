## ADDED Requirements

### Requirement: Homepage includes a dedicated 404 entry button

The landing page SHALL include a visible control labeled `Try the 404 roast` that links to `/this-page-does-not-exist` so visitors can intentionally trigger the 404 experience.

#### Scenario: Button is present with expected destination

- **WHEN** a visitor loads `index.html`
- **THEN** the page shows a control with visible text `Try the 404 roast` that navigates to `/this-page-does-not-exist`

#### Scenario: Navigation stays in the same tab

- **WHEN** a visitor activates the `Try the 404 roast` control
- **THEN** the browser navigates in the current tab without opening a new tab or window

### Requirement: Homepage 404 entry button has explicit accessible labeling

The homepage 404 entry control MUST define `aria-label="Go to a missing page to view the 404 roast"` to clearly communicate intent to assistive technologies.

#### Scenario: Assistive technologies can read the control purpose

- **WHEN** a visitor using assistive technology focuses the homepage 404 entry control
- **THEN** the announced accessible name is `Go to a missing page to view the 404 roast`
