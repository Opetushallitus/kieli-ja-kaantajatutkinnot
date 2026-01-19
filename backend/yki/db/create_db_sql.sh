export PGPASSWORD="admin"
pg_dump --host=localhost --port=5432 --username=admin --schema-only yki > 1_tables.sql
pg_dump --host=localhost --port=5432 --username=admin --data-only yki > 2_tables_data.sql
