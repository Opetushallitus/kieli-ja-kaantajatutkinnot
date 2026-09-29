- The yki domain database is older than the backend. Old backend: https://github.com/Opetushallitus/yki (may be cloned locally alongside this repo)
- Database migrations exist in both `yki/` and `kieli-ja-kaantajatutkinnot/` — check both when reasoning about schema history.

## Liquibase

- Do not create new migration files. When assigned to update a migration, update the existing one.

## `db/1_tables.sql` is not authoritative

`db/` bootstraps a local database and Liquibase completes it. The dump alone no
longer describes a working schema, and it is unreliable in **both** directions:

- It **omits** things production has — some tables exist only via the old
  repo's Ragtime migrations (e.g. `registration_change_event`), and some columns
  arrive later through Liquibase (`registration.partial_exam_type`,
  `exam_session.max_participants_read_listen`).
- It **declares** at least one column production does not have
  (`registration.free_registration_id`, which no Ragtime migration creates).

So an absence in the dump is not evidence that production lacks something, and a
presence is not evidence that it has it. Confirm against a real environment
before relying on either.

**The local database is built from that dump**, so the psql queries below tell
you what the dump says, not what production looks like. Do not settle a question
about the production schema with a localhost query.

## Local database
If the database is not up, ask the user to run `scripts/run-database.sh`. Do not run it yourself. Do not modify the database state (e.g., add/remove data, let queries modify id) without explicit permission from the user.

If the database is up, you can query like:
```sh
# List tables to stdout with cat
PGPASSWORD=admin psql -h localhost -U admin -d yki -c '\dt'|cat

# Query the database
PGPASSWORD=admin psql -h localhost -U admin -d yki -c 'SELECT * FROM free_registration LIMIT 5;'


```
