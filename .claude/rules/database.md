## Overview

- PostgreSQL. The schema predates this repo — the original backend is at https://github.com/Opetushallitus/yki (may be cloned locally as `yki/`).
- Migration history spans both repos: `yki/resources/yki/migrations/` (Ragtime, 001–046) and `kieli-ja-kaantajatutkinnot/backend/yki/src/main/resources/db/changelog/` (Liquibase). Check both when reasoning about schema history.
- Do not create new Ragtime migration files (the 001–046 series is complete). Do not create new Liquibase XML files. To add a schema change, add new `<changeSet>` entries to `db.changelog-1.0.xml`.

## Local dev database

`backend/yki/db/` contains Docker-based local database init scripts:

- `Dockerfile` — starts `postgres:16.3-alpine`, loads all `*.sql` files via `docker-entrypoint-initdb.d`
- `1_tables.sql` — pg_dump schema snapshot (regenerate with `create_db_sql.sh`)
- `2_tables_data.sql` — pg_dump data snapshot (regenerate with `create_db_sql.sh`)
- `4_init.sql` — empty placeholder

These are snapshots of a real local DB, not migrations. Liquibase handles schema changes in production.

## Liquibase migrations

Files:
- `backend/yki/src/main/resources/db/changelog/db.changelog-master.xml` — master changelog (includes `db.changelog-1.0.xml`)
- `backend/yki/src/main/resources/db/changelog/db.changelog-1.0.xml` — all changesets go here

Do not create new XML files. Add new `<changeSet>` entries to `db.changelog-1.0.xml`.

**Changeset ID format:** `YYYY-MM-DD-description` (e.g. `2026-02-16-add-exam-session-tickets`)

**PostgreSQL/HSQLDB pair pattern:** Every schema change requires two changesets:
1. A PostgreSQL changeset (ID: `YYYY-MM-DD-description`) with `<preConditions onFail="CONTINUE"><dbms type="postgresql"/></preConditions>`
2. A companion HSQLDB changeset (ID: `YYYY-MM-DD-description-hsqldb`) with `<preConditions onFail="CONTINUE"><dbms type="hsqldb"/></preConditions>`

ENUMs must be created as raw SQL for PostgreSQL and modeled as TEXT for HSQLDB.

## Key tables (yki domain)

| Table                        | Purpose                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| `organizer`                  | Exam organizers                                                 |
| `exam_date`                  | Scheduled exam dates (has `type`: FULL / READ_SPEAK / LISTEN_WRITE) |
| `exam_date_language`         | Languages per exam date                                         |
| `exam_session`               | Individual exam sessions per organizer/date (has `type`)        |
| `exam_session_location`      | Location details per exam session (multilingual rows)           |
| `exam_session_ticket`        | Osakokeistaminen: tickets linking exam_date + exam_session + registration |
| `registration`               | Participant registrations (has `state`, `kind`, `partial_exam_type`) |
| `registration_evaluation`    | Per-registration evaluation state (osakokeistaminen grading)    |
| `exam_session_queue`         | Queue for waiting registrations                                 |
| `exam_payment_new`           | Paytrail payment records for registrations                      |
| `free_registration`          | Free-registration eligibility data per registration             |
| `person`                     | Cached ONR person data (keyed by OID)                           |
| `login_link`                 | One-time login links                                            |
| `evaluation_order`           | Uusintakoe (re-evaluation) orders                               |
| `organizer_contact`          | Contact persons per organizer                                   |
| `quarantine`                 | Quarantined participants                                        |
| `participant_onr`            | Legacy cached ONR data (older than `person` table)              |
