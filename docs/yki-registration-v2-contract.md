# Registration v2 frontend handover contract

This is the frontend's proposed contract for backend implementation. The TypeScript wire types are in [`modelv2.ts`](../frontend/packages/yki/public/src/features/registration/modelv2.ts). Backend authentication, ownership, transactions and provider callbacks are not implemented by the frontend. Confirm those integration details with the backend developer; the MSW provider simulation is not an authentication design.

The team owns both the existing Clojure API and its replacement backend in this project. The frontend trusts `RegistrationContext` and the typed API errors without runtime schema validation. The rules below describe the backend contract and test fixtures; they are not duplicated as frontend assertions. URL parameter validation, lifecycle navigation, stale-response handling and HTTP error recovery remain frontend responsibilities.

## Operations and identity

| Operation | Request | Success |
| --- | --- | --- |
| POST `/yki/api/v2/registration/init` | `RegistrationInitRequest` | `RegistrationContext` |
| GET `/yki/api/v2/exam-session/:examSessionId/registration/:registrationId` | Both positive integer IDs | `RegistrationContext` |
| POST the same details URL + `/submit` | `RegistrationSubmitRequest` | `RegistrationContext` with SUBMITTED or COMPLETED state |
| DELETE the details URL | No body | 204, empty body |

Every operation requires authorization for the reservation. An anonymous reservation still needs a server-established ownership mechanism; numeric IDs are not credentials. Authentication must preserve both IDs and the original deadline. Details GET must be read-only. The frontend reads once per step entry and after document reload, and may explicitly retry a failed read.

The response's `session.identity` controls whether identification is required. Public sessions are anonymous (`identity: null`), EMAIL or SUOMIFI. `is_strongly_identified` must agree with the session method. `user` supplies form defaults for that same participant; EMAIL requires matching email/external ID, SUOMIFI requires matching SSN. Anonymous `user` is `{}`. The server must not expose another participant's data through this response.

The registration's `registration_kind` and `partial_exam_type` are authoritative for this reservation. The nested `exam_session` describes current availability independently: availability may change after a place is reserved.

## Lifecycle and nullable fields

All `RegistrationContext` fields are required except `expires_in` and individual user attributes. Reservation deadlines and payment due dates are ISO 8601 timestamps with a timezone; exam dates and birthdates retain their existing date-only format. `expires_in` is compatibility information only. `authentication_urls` contains opaque Suomi.fi and email continuation URLs; internal step navigation does not derive state from query parameters.

| State | Reservation deadline | Payment | Valid page / behavior |
| --- | --- | --- | --- |
| STARTED, anonymous | Required | null; `is_free: false` | Identify |
| STARTED, identified | Required | null; `is_free: false` | Identify when explicitly requested, otherwise Register |
| SUBMITTED, QUEUE | null | null | Done, whether free or paid eligibility was selected |
| SUBMITTED, ADMISSION | null | PENDING or CANCELLED, or null while payment is being prepared; `is_free: false` | Payment |
| COMPLETED, ADMISSION, free | null | null; `is_free: true` | Done |
| COMPLETED, ADMISSION, paid | null | PAID; `is_free: false` | Done |
| COMPLETED, QUEUE | null | null | Done |
| EXPIRED, CANCELLED, PAID_AND_CANCELLED | null | null or historical payment | Unavailable; return to listing |

SUBMITTED/COMPLETED responses require an identified session. A PAID payment with SUBMITTED state is inconsistent: the backend must return COMPLETED once payment is confirmed. A past STARTED deadline cannot be renewed by GET, authentication or init retry. Return EXPIRED (or HTTP 410) for unavailable reservations. The browser timer is advisory; the server enforces expiry.

## Request examples

Initialization:

```json
{"exam_session_id":100,"partial_exam_type":"SPEAK","to_queue":true}
```

Submission example for an email-identified participant without a Finnish SSN:

```json
{
  "first_name":"Example", "last_name":"Participant", "preferred_name":"Example",
  "nationalities":["246"], "nationality_desc":"Suomi", "native_language":"fi",
  "certificate_lang":"fi", "exam_lang":"fi", "birthdate":"1990-01-01",
  "zip":"00100", "post_office":"Helsinki", "street_address":"Example 1",
  "phone_number":"+358401234567", "email":"participant@example.invalid",
  "gender":"1", "country_code":"246", "lang":"fi"
}
```

The existing form requires address, postcode, city, phone, nationality, country, certificate/instruction language and consent. Consent and email confirmation are checked in the form and are not currently serialized. Email identification additionally requires names, preferred name, native language, gender and SSN or birthdate. Strong identification supplies identity data; native language, preferred name and birthdate may be absent, and gender may be empty. `nationality_desc` is optional reference data. `lang` is fi/sv/en; gender is 1/2 or empty. These conditional rules must also be enforced server-side. The wire type permits omitted identity/form fields because the existing serializer handles both methods.

Free registration first saves education using the existing education endpoint and adds its returned `free_registration_id` to the submit body. Registration/session IDs come from the URL, never from the draft. Backend integration must define safe replay of education save and submission after a lost response; frontend command deduplication cannot undo a server write.

## Context examples

[`registrationFixture`](../frontend/packages/yki/public/src/features/registration/tests/handlersv2.ts) supplies a complete context including the existing `ExamSessionResponse`. These fragments show the fields that vary; merge with that fixture's exam session, IDs and authentication URLs:

```json
{"state":"STARTED","session":{"identity":null},"user":{},"is_strongly_identified":false,"registration_kind":"QUEUE","partial_exam_type":"SPEAK","reservation_expires_at":"2026-10-01T09:30:00Z","is_free":false,"payment":null}
```

After email identification, the deadline is unchanged:

```json
{"session":{"auth-method":"EMAIL","identity":{"email":"participant@example.invalid","external-user-id":"participant@example.invalid"}},"user":{"email":"participant@example.invalid","external-user-id":"participant@example.invalid"},"is_strongly_identified":false}
```

Paid admission awaiting payment:

```json
{"state":"SUBMITTED","registration_kind":"ADMISSION","reservation_expires_at":null,"is_free":false,"payment":{"url":"https://payments.example.invalid/501","due_date":"2026-10-02T09:00:00Z","status":"PENDING"}}
```

Free admission completion:

```json
{"state":"COMPLETED","registration_kind":"ADMISSION","reservation_expires_at":null,"is_free":true,"payment":null}
```

## Conflicts, errors and recovery

An exact init retry (same session, part and kind) resumes the live reservation without extending its deadline. A conflicting live reservation must return 409 with all of these fields, allowing the modal to explicitly resume the original selection:

```json
{"error":{"other-exam-session-registration":{"id":100,"registration_id":502,"state":"STARTED","partial_exam_type":"SPEAK","kind":"QUEUE"}}}
```

Expired reservations must not be resumed. A new explicit listing action may create a new reservation subject to current eligibility and capacity. Do not automatically change ADMISSION into QUEUE.

| Operation / response | Frontend recovery expectation |
| --- | --- |
| Init 409 `closed`, `full`, `partialFull` | Explain closure/capacity; queue requires explicit selection |
| Any operation 401/403 | Explain missing/expired session; return to listing |
| Details 404/410 or terminal lifecycle | Unavailable; return to listing |
| Details network/5xx | Retry the same GET; never init implicitly |
| Submit 409 `closed`, `expired`, `registered` | Specific explanation; do not blindly repeat submission |
| Submit `create_payment`, `person_creation`, unknown/network error | Specific explanation where available; retain draft and allow retry |
| Cancel failure | Stay on reservation and allow retry; navigate only after success |

Error bodies use `{"error":{"expired":true}}` etc. Unknown/empty/non-JSON errors need a generic fallback. A second failure must never retain the previous failure's explanation. The backend should return one primary error per response.

After an uncertain submit/cancel outcome, a new step entry rereads authoritative state. Define safe server-side replay before enabling real submission; mock responses do not establish transactional guarantees.

## Verification boundary

The frontend tests cover payload use, lifecycle navigation, command races, expiry and error recovery with MSW. Mock records are same-tab fixtures, not a security boundary. Mock authentication directly changes the fixture identity; mock payment directly changes payment state. Real email delivery/redemption, provider callbacks, cross-user authorization, capacity locking and transaction/idempotency behavior require backend integration tests.

The mock payment link accepts `outcome=pending`, `outcome=cancelled` or `outcome=paid` (default). This is only a test-provider input: the application still uses the subsequent details GET to determine the page. Successful mock submit and cancel requests can be replayed without another transition. These are proposed recovery semantics to discuss with the backend developer, not proof of real transaction safety.
