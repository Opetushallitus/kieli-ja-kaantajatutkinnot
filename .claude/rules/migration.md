# Migrating functionality from the legacy Clojure backend

The yki domain is being migrated from the legacy Clojure backend
(https://github.com/Opetushallitus/yki, often cloned alongside this repo as
`yki/`) into this repo. Both applications run against the **same** database, so
a migrated feature is live in two places until the legacy one is removed.

## Ported functionality ships behind a feature flag

Any functionality ported from the legacy backend goes behind a flag and is
enabled per environment — off by default, unless a database flag decides (see
below). This is what keeps the two
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

## A database flag, when both backends must agree at runtime

A property only switches *this* backend. When the real requirement is that the
two backends never do the same work at the same time, a deploy-time flag on each
side makes correctness depend on releasing both in step. In that case a flag in
the shared `runtime_flag` table (`name`, `value`) is allowed instead: both
backends read it, and switching it is a single `UPDATE` with no deploy.

Use it only when it earns its keep. It costs a change in the legacy backend as
well, and properties remain the default for everything else. When you use one:

- **Each backend acts only on its own exact value** (e.g. `JAVA` / `LEGACY`).
  An unrecognised value then stops both, rather than letting both run, and is
  logged as an error. Decide what a missing row or table means on each side.
- **Check it where the work happens, under `FOR SHARE`**, not once at the start
  of a run. Switching the flag then waits for in-flight work to commit, and
  everything that starts afterwards sees the new value.
- **The property can stay, defaulting to on** in `application.yaml`, so that
  tests can turn the job off.

Precedent: the registration queue handler
(`registration_queue_handler.owner`, `RegistrationQueueLiftService.liftNext`).

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
