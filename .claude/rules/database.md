- The yki domain database is older than the backend. Old backend: https://github.com/Opetushallitus/yki (may be cloned locally alongside this repo)
- Database migrations exist in both `yki/` and `kieli-ja-kaantajatutkinnot/` — check both when reasoning about schema history.

## Liquibase

- Do not create new migration files. When assigned to update a migration, update the existing one.

## Local database
If the database is up, you can query like:
```sh
# List tables to stdout with cat
PGPASSWORD=admin psql -h localhost -U admin -d yki -c '\dt'|cat

# Query the database
PGPASSWORD=admin psql -h localhost -U admin -d yki -c 'SELECT * FROM free_registration LIMIT 5;'
```

If the database is not up, ask the user to run `scripts/run-database.sh`. Do not run it yourself.
