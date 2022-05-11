export PGPASSWORD="postgres"
pg_dump --host=localhost --port=5432 --username=postgres --exclude-table=databasechangelog --exclude-table=databasechangeloglock --schema-only otr-postgres > 1_tables.sql
pg_dump --host=localhost --port=5432 --username=postgres --table=qualification_examination_type --data-only otr-postgres > 2_tables_data.sql
pg_dump --host=localhost --port=5432 --username=postgres --table=databasechangelog --table=databasechangeloglock otr-postgres > 3_liquibase.sql
