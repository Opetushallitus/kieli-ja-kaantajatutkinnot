# YKI public registration v2

The parallel frontend is available at `/yki/ilmoittautuminen/v2`. The original listing, registration routes and registration sagas remain available. The copied implementation is under [`src/features/registration`](../frontend/packages/yki/public/src/features/registration); copied TypeScript files have the `v2` suffix.

This is a frontend implementation with an executable MSW contract. The new `/yki/api/v2/...` endpoints are **not implemented in Java or Clojure by this change**. Run with MSW to try the prototype. Backend session establishment and authenticated ownership handoff are future work, as agreed; the frontend assumes the GET can retrieve an authorized registration, and handles 401/403 by asking the user to return to the listing and start again.

## Follow the flow

| Responsibility | File |
| --- | --- |
| Four step URLs and lifecycle-to-step decisions | `features/registration/routesv2.ts` |
| Full response contract | `features/registration/modelv2.ts` |
| HTTP calls keyed by exam-session ID and registration ID | `features/registration/api/apiv2.ts` |
| Accepted commands, asynchronous reads and submission | `features/registration/state/sagasv2.ts` |
| Context, draft, request status and errors | `features/registration/redux/reducers/registrationv2.ts` |
| Step loading, form/result composition and navigation | `features/registration/pages/RegistrationStepPagev2.tsx` |
| Listing and explicit initialization navigation | `features/registration/pages/RegistrationPagev2.tsx`, `hooks/useRegistrationStartNavigationv2.ts` |
| Independent feature store | `features/registration/RegistrationFlowv2.tsx`, `redux/store/indexv2.ts` |
| Stateful API/auth/payment mocks | `features/registration/tests/handlersv2.ts` |

Paths in the final four table rows are relative to `src/features/registration` where abbreviated.

The separate Redux provider retains the existing store shape so copied form fields can reuse reference-data and education selectors. Only the v2 registration coordinator and the required listing/reference-data/education watchers run inside it; the original registration watcher never runs there. Shared layout, translations, styles, enums and reference-data code are reused.

The listing's **Ilmoittaudu** action and the **Siirry ilmoittautumislomakkeelle** modal action issue explicit init commands. Admission-conflict queue selection is also an explicit start/retry. A pending command is protected from a second click; state resets only when a command is accepted. Init is never issued by a step page, refresh, auth return or result page. A conflict followed by a deliberate modal/queue action naturally means a failed first init and one additional explicit init, rather than claiming one request across a failed attempt and retry.

Each step entry makes one full registration GET, with both positive integer IDs from the path. Duplicate effects for the same history entry are deduplicated. Navigating to another step or refreshing makes a new GET; reference data and education requests are separate. There is no prerequisite exam-session GET, follow-up small registration GET, login-link-info GET or identify POST in the v2 flow. Reset/replacement discards stale results; serialization of frontend commands does not undo writes already received by the server.

| Step | URL |
| --- | --- |
| Identify | `/yki/ilmoittautuminen/tunnistaudu/tutkintotilaisuus/:examSessionId/:registrationId` |
| Register | `/yki/ilmoittautuminen/ilmoittaudu/tutkintotilaisuus/:examSessionId/:registrationId` |
| Payment | `/yki/ilmoittautuminen/maksa/tutkintotilaisuus/:examSessionId/:registrationId` |
| Done | `/yki/ilmoittautuminen/valmis/tutkintotilaisuus/:examSessionId/:registrationId` |

The GET decides which step is valid. A STARTED registration can identify/register; an anonymous context returns to Identify. SUBMITTED admission goes to Payment, SUBMITTED queue goes to Done, and COMPLETED goes to Done. Cancelled/expired or unavailable registrations show a recovery message. Going straight to Done with `submitted`, `queue`, `code` or `status` flags cannot manufacture success. A redirect to the correct step is followed by that step's own GET.

The new internal links need no query parameters. Kind, selected part, lifecycle, payment deadline and payment URL come from the response. External authentication/payment URLs are opaque backend-provided links and may legitimately contain provider query parameters. Original routes and their query handling are preserved for the original flow; migration of old links is not part of this parallel prototype.

## Registration presentation and parity

The v2 step page uses the original `.public-registration` → `.public-registration__grid` → `.public-registration__grid__form-container` structure. These ancestors are required by the existing SCSS: copying a timer or a form field without them loses its scoped font size, progress-bar colors, spacing and width constraints. Buttons explicitly use the secondary theme color and the original contained/text variants. The panel uses the original green top border and desktop elevation; phone panels retain the original padding and flat appearance.

The original timer appears on **Register**, beside the heading on desktop and in the stacked bottom action bars on phones. Identify does not show a timer. V2 follows that presentation while continuing to calculate remaining time from the backend's absolute deadline; entering Register does not renew the reservation. Continue and cancel use the original labels and sizing. Cancellation still waits for the v2 DELETE to succeed before navigating.

`RegistrationStepperView`, `EmailIdentificationForm`, the free-registration information box, payment instructions, payment-success content and queue-confirmation content share their presentation with the original flow. Their legacy callers retain their existing state/API handling. V2 supplies its context, URLs and callbacks and does not mount the old registration coordinator. In particular, the original payment instructions retain the “Tiedot” stepper appearance even though v2 has a separate Payment route. The email form keeps its reveal control and validation; the prototype email handoff receives the entered `email` as a query parameter and the MSW handler uses it for the mock identity. A real email-provider integration is still required.

[`registration_style_parity.spec.ts`](../frontend/packages/yki/public/src/tests/cypress/integration/registration_style_parity.spec.ts) loads both versions with equivalent fixtures and compares computed styles, element dimensions, stepper text and form content. It covers Identify (both authenticated and anonymous, including the expanded email form), Register, Payment and Done at desktop and phone sizes: ten comparisons. It also checks green/white primary buttons, visible cancel controls and timer placement. These are browser comparisons, not screenshot pixel-diff tests; screenshots of v2 are saved for inspection. Font and reference-data loading are awaited before measuring.

The payment fixtures account for the API difference: legacy login-link `expires_at` is reduced by one day in its serializer; v2 `payment.due_date` is already the displayable due date.

## Backend contract to implement

See the [frontend handover contract](yki-registration-v2-contract.md) for field rules, example payloads, lifecycle transitions and recovery expectations.

| Operation | Prototype endpoint | Response |
| --- | --- | --- |
| Init | POST `/yki/api/v2/registration/init` | `RegistrationContext` |
| Details | GET `/yki/api/v2/exam-session/:examSessionId/registration/:registrationId` | Same full response |
| Submit | POST `/yki/api/v2/exam-session/:examSessionId/registration/:registrationId/submit` | Same full response with authoritative result state |
| Cancel | DELETE `/yki/api/v2/exam-session/:examSessionId/registration/:registrationId` | Successful empty response |

The v2 `RegistrationContext` extends the current init shape with:

- `state`: STARTED/SUBMITTED/COMPLETED or a terminal state.
- `session`: the existing session-response shape, so identification controls and form eligibility do not need a separate session prerequisite. `identity: null` denotes an anonymous context, not a missing or expired cookie.
- `reservation_expires_at`: an absolute deadline, or null after submission. Both admission and queue can have a STARTED deadline. `expires_in` is retained for compatibility.
- `is_free`: the stored submission outcome.
- `authentication_urls`: Suomi.fi/email continuation links carrying both IDs.
- `payment`: payment URL, due date and status, or null when no payment is needed.

The response retains both `exam_session.type` and `partial_exam_type`, plus the registration's own `registration_kind`. It must preserve session availability independently of the participant's reserved kind. The frontend validates that the returned session and registration IDs match the requested resource. The draft no longer supplies the ID for writes; submit and cancel use the loaded context.

The other-started-registration conflict must include `id` (session), `registration_id`, `state`, **`partial_exam_type` and `kind`**. Without the latter two fields, the copied modal disables its continuation action rather than guessing ALL_PARTS. The new MSW test exercises continuing a SPEAK/QUEUE reservation after selecting a different option.

Free registration still saves education with the existing Java education endpoint before submitting. The final route comes from the submission result, and that route reads the full registration again. The server must support completed registrations in details GET so free completion and payment return survive refresh.

Removing identify is a contract change, not permission to expose registrations by ID. The future Java/Clojure integration must establish the authorized owner/session before serving the GET, carry both IDs through authentication and payment redirects, and preserve the original reservation and deadline. GET should remain a read; do not move reservation creation or ownership mutations into it. Real provider callbacks must determine payment state before it is returned. The existing sessionless legacy payment-return page remains separate.

## Mocks and verification

MSW stores records by registration ID, independently of session IDs and current availability. Records persist across same-tab document reloads. Fixtures use session 100 and registrations 501/502; submitted/completed records can be read. The new auth handler establishes a mocked Suomi.fi/email session for the exact reservation. Mock submission determines queue/free/paid outcomes from the record and request rather than ID parity.

MSW does not intercept document navigation. Cypress therefore exercises the mock auth/payment handoff with `fetch`, then simulates the provider's document redirect using the handler's returned `redirect_url`. This verifies the mock session update and return-page behavior, not a live external provider. The normal frontend links remain document navigations to backend-provided URLs. The default MSW init returns an already authenticated session, so the ordinary local prototype uses **Jatka ilmoittautumiseen**.

The requested [`public_registration_page_refactor.spec.ts`](../frontend/packages/yki/public/src/tests/cypress/integration/public_registration_page_refactor.spec.ts) was copied from the existing listing spec. It preserves the filtering/error scenarios and adds route/API assertions, all seven offered session/part combinations, both mocked authentication methods, paid/free/queue outcomes, reload, exact-ID cancellation, session failures and mobile controls. The new shared-worker accessor lets this spec install overrides on the worker started by Cypress support despite their separate webpack module caches. The old spec is unchanged.

The feature's Jest tests cover duplicate commands, explicit conflict retry, duplicate route effects, switching registrations during a delayed GET, reset during init, and mismatched response IDs.

Run from `frontend/packages/yki/public`, with Node available on PATH:

```sh
../../../node_modules/.bin/webpack serve --host 127.0.0.1 --port 4013 --env cypress --env prod --no-open
```

In another terminal:

```sh
env -u ELECTRON_RUN_AS_NODE ../../../node_modules/.bin/cypress run --browser electron --spec "src/tests/cypress/integration/public_registration_page_refactor.spec.ts,src/tests/cypress/integration/registration_style_parity.spec.ts" --config baseUrl=http://127.0.0.1:4013
../../../node_modules/.bin/jest --runInBand
../../../node_modules/.bin/tsc --noEmit
../../../node_modules/.bin/eslint src
```

The production flag in this test server disables the application's own development worker; Cypress support owns the API mocks during the test. This is an isolated frontend check and does not require a database.

Validation on 2026-09-08: all ten desktop/phone style-and-content comparisons passed without retries; all 34 tests in the v2 flow Cypress spec passed; all 16 tests across the unchanged original listing, full-exam and partial-exam specs passed. The full public Jest suite passed (11 suites, 95 tests, 10 snapshots), including six v2 regressions. TypeScript, ESLint and patch whitespace checks passed. The test server compiled with asset-size warnings. No live authentication/payment service or database was exercised.
