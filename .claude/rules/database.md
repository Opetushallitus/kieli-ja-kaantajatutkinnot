- The yki domain database is older than the backend. Old backend: https://github.com/Opetushallitus/yki (may be cloned locally alongside this repo)
- Database migrations exist in both `yki/` and `kieli-ja-kaantajatutkinnot/` — check both when reasoning about schema history.

## Liquibase

- Do not create new migration files. When assigned to update a migration, update the existing one.
