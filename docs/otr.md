# OTR - Oikeustulkkirekisteri [![OTR](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/otr.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/otr.yml)

## Backend

### Build and Run

Using Maven

```sh
mvn clean install
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Or

Using Maven Wrapper

```sh
./mvnw clean install
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

and the app runs on > <http://localhost:8081>

Required packages get installed automatically.

&nbsp;

### Authentication and Authorisation

#### Production Profile

CAS configurations are used by default.

&nbsp;

#### Development Profile

Dev profile configurations are used by default.

Dev profile uses the following credentials:

- clerk:clerk
  - User with clerk (virkailija) privileges
- user:user
  - User with no privileges

Dev profile enables HTTP basic and form authentication for easier command-line tool access.

In order to disable Spring Boot Security use property:

```sh
  -Dspring-boot.run.jvmArguments=-Ddev.web.security.off=true
```

Or

Set `OTR_UNSECURE=true` environment variable as shown [here](../README.md#development).

&nbsp;

#### Initialising cloud databases

Under `backend/otr/db` directory there's `4_init.sql` script for initialising interpreters
in cloud test environment (untuva / pallero). Under `backend/otr/db/onr` there are separate
scripts for initialsing respective learners and their contact details in `ONR`
(oppijanumerorekisteri).

Script `0_onr_create_learners.sql` should be run only once just to create learners corresponding
to onr ids of interpreters initialised to OTR database. Script `1_onr_init_contact_details.sql`
deletes and initialises OTR contact details for learners. It can be run on cloud test environment
database whenever needed.

If there is a case where the learners need to be deleted and re-initialised for some reason,
`2_onr_delete_learners.sql` contains a commented out solution for that. If the learners have
been updated via some means after their creation outside from the APIs we use, there's a
chance deletion of learners fails due to some foreign key constraint.

## Frontend

### Build and Run

```sh
yarn install
yarn otr:start  # Starts Webpack DevServer
```

and the app runs on > <http://localhost:4001/otr/etusivu>

### Running tests

End-to-end tests:

```sh
yarn otr:test:cypress
```

Unit and Integration tests

```sh
yarn otr:test:jest
yarn otr:test:jest -- -u  # Regenerate snapshots
```

## Documentation

### Health check and overall information

Health check:

> <http://localhost:8081/otr/api/actuator/health>

General information about the running application:

> <http://localhost:8081/otr/api/actuator/info>

### OpenAPI

> <http://localhost:8081/otr/api/api-docs>

### Swagger

> <http://localhost:8081/otr/api/swagger-ui.html>

In order to make requests work in swagger UI, the application needs to be run with parameter:

```sh
mvn spring-boot:run -Dtomcat.util.http.parser.HttpParser.requestTargetAllow=|{}
```

## Localizations

### Frontend localizations

I18next is used as an internationalization framework. Localizations are stored in JSON files in public/i18n directory and committed to git.

For inspection and modification by OPH clerks, it's possible to create an excel sheet in the application directory as shown below:

&nbsp;

#### JSON to XLSX

```sh
npx i18n-json-to-xlsx-converter --convert public/i18n/fi-FI/translation.json
```

#### XLSX to JSON

```sh
npx i18n-json-to-xlsx-converter --convert translation.xlsx
```

&nbsp;

### External localisations

#### Koodisto

Koodisto service is used to fetch language and region translations. To update translations run:

```sh
cd scripts
./koodisto_langs.sh
```

The above script fetches language codes from the Koodisto service and transforms them into localization files. The created localization files are stored in git.

Regions are updated same way:

```sh
cd scripts
./koodisto_regions.sh
```
