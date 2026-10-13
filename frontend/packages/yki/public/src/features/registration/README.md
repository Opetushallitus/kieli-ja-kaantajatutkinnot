# Registration flow at `/yki/ilmoittautuminen/vw`

This is a copy of the existing registration flow for integrating the Java
registration API. Components, pages, hooks and Redux state live here; shared
translations, styles, domain types and session data are reused. Its Redux state
and actions use the `registrationVw` namespace. The existing routes still use the
original implementation.

## API contract

- Start a registration: the existing `POST /yki/api/registration/init`.
- Load or resume it: `GET /yki/v2/api/registration/:examSessionId/:registrationId`.
  Both init and GET return `PublicRegistrationDetails`, formerly named
  `PublicRegistrationInitResponse`.
- Submit and cancel: the existing registration endpoints and payloads.

`useRegistrationDetails` loads the registration and exam session together on
entry to the identification, contact-details and free-registration success
pages. Backend data determines the partial exam, queue/admission kind, user
details and reservation time. There is no frontend identify request in this flow.
The GET must also support resuming the pre-authentication identification page.

The existing payment return page only needs exam-session information and keeps
its existing `?id=<examSessionId>&status=...` contract. Payment-link metadata and
education lookups are also unchanged; their data is not in
`PublicRegistrationDetails`.

## Backend integration

The Java implementation is supplied by a separate branch. Authentication and
email-link redirects for this flow must return to
`/yki/ilmoittautuminen/vw/tutkintotilaisuus/:examSessionId/:registrationId`
(optionally with `/jono` for a queue). Payment callbacks must use the `/vw/maksu/tila`
route to remain in this flow. Authentication and payment endpoint URLs are
unchanged, as are their request parameters.

## Local verification

Run `yarn yki:start:msw` from `frontend/packages/yki/public`, then visit
`http://localhost:4003/yki/ilmoittautuminen/vw`. The shared MSW handlers implement
the new GET for local development. Real Suomi.fi, email-link and payment redirects
require the backend integration.

The Cypress spec `registration_vw.spec.ts` exercises the new API and routes with
mocked responses. Run it against `yarn yki:start:ci`, which disables the app's own
MSW worker. The spec unregisters the shared test worker and uses Cypress network
intercepts to check requests across page reloads.
