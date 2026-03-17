# Fix TestContainers DB Baseline with Ragtime Schema

## Context

TestContainers tests start with a blank PostgreSQL container and run only Liquibase
migrations. But production has Ragtime migrations (from the old `yki/` repo) applied
first as the schema foundation. When a developer adds a new Ragtime migration to the
old repo and a corresponding Liquibase changeset here, tests can't catch regressions
because the Ragtime schema is never present in the test DB.

The `db/1_tables.sql` file is a pg_dump of the full schema (Ragtime + Liquibase era)
and is already used by the local dev Docker image — but not by TestContainers tests.

**Why we can't just load `1_tables.sql` and run Liquibase on top:**
`1_tables.sql` is a post-Liquibase dump (includes all columns Liquibase added). Most
`addColumn` changesets have no `columnExists` preconditions, so they would fail on
already-existing columns. The fix: also dump the `databasechangelog` table data, so
Liquibase sees those changesets as already run and skips them.

## Approach

Load the full DB state (schema + Liquibase changelog data) into TestContainers via
PostgreSQL's docker-entrypoint-initdb.d init scripts, before Spring Boot connects and
Liquibase runs. Liquibase will only execute changesets added after the dump was taken.

## Steps

### 1. Regenerate dump files from an up-to-date local DB

Ensure local DB is fully migrated (Ragtime + Liquibase), then run `create_db_sql.sh`
to regenerate `1_tables.sql` and `2_tables_data.sql`.

File: `backend/yki/db/create_db_sql.sh`

### 2. Add databasechangelog data dump to `create_db_sql.sh`

Add a new pg_dump command to the script that dumps only `databasechangelog` table data
into a new file `backend/yki/db/3_databasechangelog.sql`:

```bash
pg_dump -h localhost -U admin -d yki \
  --data-only --table=databasechangelog \
  -f 3_databasechangelog.sql
```

Run the script to generate `3_databasechangelog.sql`.

### 3. Add `db/` as a Maven test resource

In `backend/yki/pom.xml`, add `db/` to the test resource directories so the SQL files
are available on the test classpath:

```xml
<testResources>
  <testResource>
    <directory>src/test/resources</directory>
  </testResource>
  <testResource>
    <directory>db</directory>
    <includes>
      <include>1_tables.sql</include>
      <include>2_tables_data.sql</include>
      <include>3_databasechangelog.sql</include>
    </includes>
  </testResource>
</testResources>
```

### 4. Create a shared base class for TestContainers tests

New file: `backend/yki/src/test/java/fi/oph/yki/PostgresContainerBase.java`

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
@ImportAutoConfiguration(LiquibaseAutoConfiguration.class)
public abstract class PostgresContainerBase {

  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
      .withUsername("admin")
      .withCopyFileToContainer(
          MountableFile.forClasspathResource("1_tables.sql"),
          "/docker-entrypoint-initdb.d/1_tables.sql")
      .withCopyFileToContainer(
          MountableFile.forClasspathResource("2_tables_data.sql"),
          "/docker-entrypoint-initdb.d/2_tables_data.sql")
      .withCopyFileToContainer(
          MountableFile.forClasspathResource("3_databasechangelog.sql"),
          "/docker-entrypoint-initdb.d/3_databasechangelog.sql");
}
```

Files run alphabetically in docker-entrypoint-initdb.d, so order is correct:
schema → data → Liquibase changelog state.

### 5. Update existing TestContainers tests to extend the base class

- `ClerkExamDateServiceTest` — remove duplicate annotations/container, extend base
- `ClerkExamSessionServiceTest` — same

Critical files:
- `backend/yki/src/test/java/fi/oph/yki/service/ClerkExamDateServiceTest.java`
- `backend/yki/src/test/java/fi/oph/yki/service/ClerkExamSessionServiceTest.java`

## Verification

```bash
cd backend
./mvnw test -pl yki -Dtest="ClerkExamDateServiceTest,ClerkExamSessionServiceTest"
```

Expected: tests pass. If an `addColumn` changeset fails → the dump is still outdated
or `3_databasechangelog.sql` is missing. If `CREATE TYPE` fails → `1_tables.sql`
needs to be re-dumped with the latest Ragtime migrations applied.
