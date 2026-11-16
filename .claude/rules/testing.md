# Testing

- A new or changed repository query gets a `@DataJpaTest`.

## Java — Test Data Setup

In `@DataJpaTest` service tests, set up test data using `Factory.*()` methods with `TestEntityManager.persist()`.

Reference: `ClerkExamSessionServiceTest` and `RegistrationServiceTest` are the canonical examples.

**If the primary `Factory` + `entityManager` approach hits a blocker** (e.g. a JPA model is missing fields, or an entity doesn't exist yet), do not assume a workaround. Stop and discuss with the user to decide the right path — whether that means extending the model, adding a factory method, or accepting raw SQL for that specific case.

## Scripts for running checks yourself

People test in the browser and in the Cypress GUI. These scripts in `scripts/` are for Claude.

- **Cypress, headless:** `scripts/run-cypress-clerk-headless.sh` (clerk, `http://localhost:4004`) and `scripts/run-cypress-public-headless.sh` (public, `http://localhost:4003`).
  - The frontend must run with `yarn yki:clerk:start:ci` (clerk) or `yarn yki:start:ci` (public), not with `start:msw`. With `start:msw` the app starts its own MSW worker (`clerk/src/index.tsx`), so the tests' own mocks, such as `cy.mockAuthUser`, do not reach the app and tests fail for no reason in the code.
  - The user runs one frontend at a time. If the wrong one is running, ask the user to switch. Do not stop their process.
- **Clerk API with curl:** ask the user to run `scripts/yki-clerk-login.sh` themselves, because it asks for the CAS password. It writes a cookie jar and a CSRF header to `scripts/data/`; the script prints example `curl` calls.
