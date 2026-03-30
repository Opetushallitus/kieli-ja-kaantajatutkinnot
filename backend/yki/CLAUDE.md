# YKI Backend

## Database

The database is older than our backend. The old backend is remotely at https://github.com/Opetushallitus/yki. The old database contains the data already, so when our code is missing tables or columns, that is very domain specific and should be reviewed manually.

- SQL scripts to set up the database locally: `db/` folder, entry point `db/create_db_sql.sh`
- Liquibase migrations: `src/main/resources/db/changelog/`

### Liquibase

- Do **not** create new migration files — update the existing one.

## Maven

This is a shared project. Parent pom is at the root. `./mvnw` lives inside each submodule — always `cd` into the submodule first:

```bash
(cd backend/yki && ./mvnw clean install)
(cd backend/yki && ./mvnw test -Dtest="SomeTest")
```

## Code Structure

```
src/main/java/fi/oph/yki/
├── api/          # Controllers (REST endpoints)
│   └── clerk/   # Clerk-specific controllers
├── service/      # Business logic
├── repository/   # JPA repositories (database access)
├── model/        # JPA entities
└── ...
src/main/resources/db/changelog/   # Liquibase migrations
db/                                # Local DB init scripts
```

## Clerk Customer Details Flow (example)

1. [src/main/java/fi/oph/yki/api/clerk/ClerkCustomerController.java](src/main/java/fi/oph/yki/api/clerk/ClerkCustomerController.java) — REST controller
2. [src/main/java/fi/oph/yki/service/ClerkCustomerService.java](src/main/java/fi/oph/yki/service/ClerkCustomerService.java) — business logic
3. [src/main/java/fi/oph/yki/repository/](src/main/java/fi/oph/yki/repository/) — JPA repositories
4. [db/](db/) — local database initialization scripts
5. [src/main/resources/db/changelog/](src/main/resources/db/changelog/) — Liquibase migrations
