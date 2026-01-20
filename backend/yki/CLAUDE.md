# Database
- The database older than our backend. The old backend is remotely at https://github.com/Opetushallitus/yki, and locally potentially at `../../../yki`. The old database contain the data already, so when our code is missing tables or columns, that is very domain specific, that it should be reviewed manually by the programmer.

- We have sql scripts at `db` - folder to set up the database locally, with `db/create_db_sql.sh`
- We also use liquibase to add new migrations.


# Maven
We use maven, not gradle, and this is a shared project. Parent pom is at `../`. 

./mvnw clean install build etc