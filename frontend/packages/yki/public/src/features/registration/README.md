# Registration flow at `/yki/ilmoittautuminen/v2`

This is a copy of the existing registration flow for integrating the Java
registration API. Components, pages, hooks and Redux state live here; shared
translations, styles, domain types and session data are reused. Its Redux state
and actions use the `registrationV2` namespace. The existing routes still use the
original implementation.

## API contract

- Start a registration: `POST /yki/api/v2/:examSessionId/registration/init`.
  The body still contains `exam_session_id`, `to_queue` and `partial_exam_type`.
- Load or resume it: `GET /yki/api/v2/:examSessionId/registration/:registrationId`.
  Both init and GET return `PublicRegistrationDetails`, formerly named
  `PublicRegistrationInitResponse`.
- Submit: `POST /yki/api/v2/:examSessionId/registration/:registrationId/submit`,
  with the existing form payload and `lang` query parameter.
- Cancel: the existing registration endpoint.

`useRegistrationDetails` loads the registration and exam session together on
entry to the identification, contact-details and free-registration success
pages. Backend data determines the partial exam, queue/admission kind, user
details and reservation time. There is no frontend identify request in this flow.
The GET must also support resuming the pre-authentication identification page.

The existing payment return page only needs exam-session information and keeps
its existing `?id=<examSessionId>&status=...` contract. Payment-link metadata and
education lookups are also unchanged; their data is not in
`PublicRegistrationDetails`.

## Registration state

Both init and GET populate the same `registration` object: the ID, exam-session
ID, queue/admission kind, partial exam, reservation time and editable form values.
The exam-session response is stored in the existing `examSession` slice.
`initRegistration` and `fetchRegistration` contain only their request status and
error. The listing navigates after a successful init; registration pages use the
GET status. Loading details does not mark initialization as successful.

## Backend integration

The Java implementation is supplied by a separate branch. Authentication and
email-link redirects for this flow must return to
`/yki/ilmoittautuminen/v2/tutkintotilaisuus/:examSessionId/:registrationId`
(optionally with `/jono` for a queue). Payment callbacks must use the `/v2/maksu/tila`
route to remain in this flow. Authentication and payment endpoint URLs are
unchanged, as are their request parameters.

## Local verification

Run `yarn yki:start:msw` from `frontend/packages/yki/public`, then visit
`http://localhost:4003/yki/ilmoittautuminen/v2`. The shared MSW handlers implement
the new GET for local development. Real Suomi.fi, email-link and payment redirects
require the backend integration.

The Cypress spec `registration_v2.spec.ts` exercises the new API and routes with
mocked responses. Run it against `yarn yki:start:ci`, which disables the app's own
MSW worker. The spec unregisters the shared test worker and uses Cypress network
intercepts to check requests across page reloads.
