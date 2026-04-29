# insult-path-input-validation Specification

## Purpose

TBD - created by archiving change input-validation. Update Purpose after archive.

## Requirements

### Requirement: Insult endpoint validates optional path query input

The insult endpoint SHALL accept an optional `path` query parameter and validate it before any Groq call using these rules: value starts with `/`, length is at most 120 characters, and characters are limited to printable URL-path-safe characters.

#### Scenario: Valid path is accepted

- **WHEN** a same-origin GET request includes `?path=/this-page-does-not-exist`
- **THEN** the request proceeds past validation without a `400` response

#### Scenario: Invalid path is rejected

- **WHEN** a same-origin GET request includes an invalid `path` value that fails format or length checks
- **THEN** the endpoint returns `400` JSON and does not call Groq

### Requirement: Validation preserves existing security gate order

The endpoint MUST keep origin/referer checking as the first security gate and run `path` validation after origin/referer approval and before API-key/Groq logic.

#### Scenario: Cross-origin requests still fail before path validation

- **WHEN** a request is not same-origin and includes any `path` value
- **THEN** the endpoint returns `403` from origin/referer enforcement instead of a path-validation response

#### Scenario: Same-origin validation runs before Groq/fallback generation

- **WHEN** a same-origin request includes an invalid `path`
- **THEN** the endpoint returns `400` and does not return a roast payload
