# Migrating functionality from the legacy Clojure backend

The yki domain is being migrated from the legacy Clojure backend
(https://github.com/Opetushallitus/yki, often cloned alongside this repo as
`yki/`) into this repo. Both applications run against the **same** database, so
a migrated feature is live in two places until the legacy one is removed.

## Ported functionality ships behind a feature flag

Any functionality ported from the legacy backend goes behind a flag and is
enabled per environment — off by default. This is what keeps the two
implementations from doing the same work twice against the shared database.

For a scheduled job, put `@ConditionalOnProperty` on the `@Component` rather
than branching inside the method, and do not set `matchIfMissing`: an absent
property then means off, and the `@Scheduled` method is never registered at all.

```java
@Component
@ConditionalOnProperty(name = "app.scheduling.<job-name>.enabled", havingValue = "true")
public class SomeHandler { ... }
```

Precedent for the property-driven bean pattern: `AppConfig` selects between
`EmailSenderNoOp` and `EmailSenderViestintapalvelu` on
`app.email.sending-enabled`.

Sequence for a cutover: ship dark → enable in a test environment with the legacy
side switched off → enable in production → remove the legacy implementation
after a watch period. Note the legacy app has no runtime switch for scheduled
jobs (see its `.claude/rules/structure.md`), so turning one off means editing
its `:jobs` vector and deploying.

## Things to check when porting

- **Locking does not carry over.** The legacy `task_lock` table is not a lock
  (see the legacy repo's rules); this repo uses ShedLock, configured in
  `config/SchedulingConfig.java`. Follow `scheduled/EmailScheduledSending.java`.
  ShedLock is best-effort, so anything non-idempotent needs its own guarantee in
  the SQL rather than relying on the lock.
- **`ScheduledTaskMonitor` watches legacy `task_lock` rows.** Once a job is
  owned here, drop it from `MONITORED_TASKS` or it will log
  `[ERROR_SCHEDULED_TASK]` on every tick when the legacy side stops stamping the
  row.
- **Emails are half-migrated.** Java-produced emails go through the `email`
  table and `EmailScheduledSending`; legacy-produced emails still go through
  `pgqueues`. Porting a feature moves its emails between pipelines, which also
  changes the retry behaviour.
- **Watch for tables and columns this repo does not model.** The legacy schema
  is larger than the JPA model. See `.claude/rules/database.md` — and do not
  trust `db/1_tables.sql` as a description of production.
- **Check whether the legacy behaviour is intended before preserving it.** Some
  of it is; some is an artefact of how the legacy code was structured. Decide
  deliberately and record which, so a later reader can tell a faithful port from
  an accidental one.
