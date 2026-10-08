# Kielitutkintorekisteri

Kielitutkintorekisteri (kitu) stores the results of the language exams that OPH manages, and sends them to KOSKI.


## Where things are

- Repo: <https://github.com/Opetushallitus/kielitutkintorekisteri>
- Technical documentation: <https://opetushallitus.github.io/kielitutkintorekisteri/docs/technical/>
- Integrations, including KIOS: <https://opetushallitus.github.io/kielitutkintorekisteri/docs/technical/integraatiot.html>
- API documentation: <https://virkailija.testiopintopolku.fi/kielitutkinnot/api-docs>

## How KIOS, Solki and kitu connect

For YKI, KIOS and kitu both connect to [Solki](https://www.jyu.fi/fi/hytk/solki) (Soveltavan kielentutkimuksen keskus, University of Jyväskylä).

These are separate integrations. Each one carries different data:
    - KIOS sends registrations to Solki.
    - Solki sends exam results to kitu.
    - When kitu saves a result, it sends the evaluation state to KIOS.

Nothing that reaches KIOS identifies the registration. KIOS finds it by person, exam date, language and level. The [YKI data flow diagram](https://opetushallitus.github.io/kielitutkintorekisteri/docs/technical/integraatiot.html#kaaviot) in kitu's docs shows all the systems.

### YKI

- **KIOS → Solki**: organizers, exam dates, exam sessions, participants, person changes.
  Solki's API, Basic auth, scheduled jobs.
- **Solki → KIOS**: Solki reads organizer data (`/v2/api/organizer/{oid}/**`). CAS, read permission ([WebSecurityConfig](../backend/yki/src/main/java/fi/oph/yki/config/security/WebSecurityConfig.java)).
- **Solki → kitu**: exam results with grades, also review evaluations. `POST /yki/api/suoritus`, OAuth2.
- **kitu → KIOS**: the evaluation state only, no grades. `POST /yki/v2/api/oauth2/registration/evaluation`, OAuth2, role `APP_YKI_SUORITUKSEN_TILAN_KIRJOITUS` ([OAuth2RegistrationController](../backend/yki/src/main/java/fi/oph/yki/api/oauth2/OAuth2RegistrationController.java),
  [RegistrationService](../backend/yki/src/main/java/fi/oph/yki/service/RegistrationService.java)).
	- kitu sends it in the same request in which it saves the result. An hourly job resends the failed ones.
	- Results marked as cheating are not sent.
	- Solki sends one exam result with all partial exams. KIOS writes the state to every `COMPLETED` registration that matches.

### VKT
- **KIOS → kitu**: enrollments, every hour. `PUT /api/vkt/kios`, CAS service ticket
  ([SyncRegisterEnrollments](../backend/vkt/src/main/java/fi/oph/vkt/scheduled/SyncRegisterEnrollments.java), config `app.register.url` and `app.register.sync-enabled`).

## How kitu differs from KIOS

Practices differ between the two repos. When you maintain both, you can align them.

|                    | kitu                                | KIOS                                  |
| ------------------ | ----------------------------------- | ------------------------------------- |
| Language           | Kotlin, Spring Boot                 | Java, Spring Boot                     |
| Infra              | AWS CDK in the kitu repo            | Outside this repo                     |
| Deploy             | Automatic from `main`               | By hand, outside this repo            |
| Config and secrets | From kitu's AWS account             | Templates, filled outside this repo   |
| Documentation      | Finnish, GitHub Pages               | English, `docs/`                      |
| Otuva roles        | `ROLE_APP_KIELITUTKINTOREKISTERI_*` | One set per service, e.g. `APP_YKI_*` |

- kitu deploys every push to `main` to dev, test and prod.
- KIOS CI builds the image ([common-deploy.yml](../.github/workflows/common-deploy.yml)).
- KIOS locally: copy `application-dev.template` to `application-dev.yaml`.
- For KIOS deploys and environment secrets, ask OPH.

## Access

KIOS access does not give you access to kitu. You need two separate things:

- **kitu roles in Otuva.** Start with `READ` (`ROLE_APP_KIELITUTKINTOREKISTERI_READ`). Ask for more only when a task needs it. For example, sending a YKI result by hand needs `YKI_TALLENNUS`. The roles are listed in [Authority.kt](https://github.com/Opetushallitus/kielitutkintorekisteri/blob/main/server/src/main/kotlin/fi/oph/kitu/security/Authority.kt).
- **kitu's AWS accounts.** Ask OPH. The AWS profiles are named `oph-ktr-*`. KTR means kitu.

## Running kitu and KIOS together

Use this when you need to test the integration on your own machine, for example a change in how KIOS handles
evaluation states.

1. Start the KIOS database and the YKI backend as usual. They must run on ports 5432 and 8083.
2. Start kitu with the profiles `local,local-kios`. The steps are in the kitu README: [Paikallinen kehitys KIOSin kanssa](https://github.com/Opetushallitus/kielitutkintorekisteri#paikallinen-kehitys-kiosin-kanssa).
	- The profile moves kitu to port 8090 and its database to port 5433.
	- It also turns off the transfer to KOSKI, so local test data does not reach untuva KOSKI.
	- kitu must run online, because KIOS accepts only tokens from dev OTUVA ([application.yaml](../backend/yki/src/main/resources/application.yaml), `oauth2`). This needs access to kitu's dev AWS account.
3. Use the seed data. It already has a registration that matches: person `1.2.246.562.24.82364099322`, exam date 2025-03-25, Swedish, level `KESKI`.
    - Registration 185 is `COMPLETED`. It gets the evaluation state.
    - Registration 184 is `CANCELLED`. It must not change.
4. Send a result from kitu. The kitu README has a request body for this person.
5. Check the KIOS database:

```sh
PGPASSWORD=admin psql -h localhost -U admin -d yki -c "SELECT r.id, r.state, re.state AS evaluation, re.version FROM registration r LEFT JOIN registration_evaluation re ON re.registration_id = r.id WHERE r.id IN (184, 185) ORDER BY r.id;"
```

After `ARVIOITU`, registration 185 has the evaluation `EVALUATION_COMPLETE`, and 184 has none. The mapping from kitu states to KIOS states is in [EvaluationState.java](../backend/yki/src/main/java/fi/oph/yki/model/type/EvaluationState.java).
