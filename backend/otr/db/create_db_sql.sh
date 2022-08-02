export PGPASSWORD="postgres"
pg_dump --host=localhost --port=6431 --username=postgres --exclude-table=databasechangelog --exclude-table=databasechangeloglock --schema-only otr-postgres > 1_tables.sql
pg_dump --host=localhost --port=6431 --username=postgres --table=email_type --table=qualification_examination_type --data-only otr-postgres > 2_tables_data.sql
pg_dump --host=localhost --port=6431 --username=postgres --table=databasechangelog --table=databasechangeloglock otr-postgres > 3_liquibase.sql
