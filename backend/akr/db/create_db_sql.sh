export PGPASSWORD="postgres"
pg_dump --host=localhost --port=5432 --username=postgres --exclude-table=databasechangelog --exclude-table=databasechangeloglock --schema-only akr-postgres > 1_tables.sql
pg_dump --host=localhost --port=5432 --username=postgres --table=authorisation_basis --table=email_type --data-only akr-postgres > 2_tables_data.sql
pg_dump --host=localhost --port=5432 --username=postgres --table=databasechangelog --table=databasechangeloglock akr-postgres > 3_liquibase.sql
