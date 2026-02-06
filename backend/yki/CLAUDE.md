# Database
- The database older than our backend. The old backend is remotely at https://github.com/Opetushallitus/yki, and locally potentially at `../../../yki`. The old database contain the data already, so when our code is missing tables or columns, that is very domain specific, that it should be reviewed manually by the user.

- We have sql scripts at `db` - folder to set up the database locally, with `db/create_db_sql.sh`
- We also use liquibase to add new migrations.


# Maven
We use maven, not gradle, and this is a shared project. Parent pom is at the parent folder.

./mvnw clean install build etc


## Coding style
Follow the existing styles of the codebase. Don't comment much. Only comments that requires larger context, eg. domain decisions or bug fixes.

## Code structure

### backend
 1. @src/main/java/fi/oph/yki/api/ - controllers
 2. @src/main/java/fi/oph/yki/api/clerk - Clerk - specific controllers
 3. @src/main/java/fi/oph/yki/service/ - services
 3. @src/main/java/fi/oph/yki/repository - repositories
 4. @db - folder: local database initialization scripts
 5. @src/main/resources/db/changelog - liquibase migrations

