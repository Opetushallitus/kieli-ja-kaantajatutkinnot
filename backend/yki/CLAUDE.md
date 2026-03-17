# YKI Backend

## Database

The schema originates from the old Clojure backend (https://github.com/Opetushallitus/yki).
Tables or columns absent from our Liquibase migrations may exist in production via that repo —
treat missing schema as intentional until confirmed otherwise.

- Local setup: `db/` folder, entry point `db/create_db_sql.sh`
- Migrations: `src/main/resources/db/changelog/` — update the existing file, do **not** create new ones.

## Maven

This is a shared project. Parent pom is at the root. Use `./mvnw` (not gradle):

```bash
# Build
./mvnw clean install

# Run all tests
./mvnw clean test
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
