# AKT - Auktorisoidun kääntäjän tutkintojärjestelmä [![AKT](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/akt.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/akt.yml)

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

and the app runs on > <http://localhost:8080>

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

Set `AKR_UNSECURE=true` environment variable as shown [here](../README.md#development).

&nbsp;

### Scheduled tasks

`EmailScheduledSending` does scheduling of sending unsent emails. Every 10 seconds (`FIXED_DELAY`) it fetches a batch of at most 10 unsent emails (`BATCH_SIZE`), and tries to send them. If there are loads of emails in the queue, it may send at max. 3600 emails in an hour.

`ExpiringAuthorisationsEmailCreator` does scheduling of finding expiring authorisations, and creating reminder emails about them. It is run every 12 hours (`FIXED_DELAY`). The reminder emails that are created are eventually sent via `EmailScheduledSending`.

&nbsp;

## Frontend

### Build and Run

```sh
npm install
npm run start  # Starts Webpack DevServer
```

and the app runs on > <http://localhost:4000/akt/etusivu>

```sh
npm run build # Builds the app for production to the dist folder.
```

### Running tests

End-to-end tests:

```sh
npm run test:cypress
```

Unit and Integration tests

```sh
npm run test:jest
npm run test:jest -- -u  # Regenerate snapshots
```

## Documentation

### Health check and overall information

Health check:

> <http://localhost:8080/akt/api/actuator/health>

General information about the running application:

> <http://localhost:8080/akt/api/actuator/info>

### OpenAPI

> <http://localhost:8080/akt/api/api-docs>

### Swagger

> <http://localhost:8080/akt/api/swagger-ui.html>

In order to make requests work in swagger UI, the application needs to be run with parameter:

```sh
mvn spring-boot:run -Dtomcat.util.http.parser.HttpParser.requestTargetAllow=|{}
```

## Localizations

### Frontend localizations

I18next is used as an internationalization framework. Localizations are stored in JSON files and committed to git.

For inspection and modification by OPH clerks, it's possible to create an excel sheet as shown below:

&nbsp;

#### JSON to XLSX

```sh
npx i18n-json-to-xlsx-converter --convert common.json, translation.json
```

#### XLSX to JSON

```sh
npx i18n-json-to-xlsx-converter --convert translation.xlsx
```

&nbsp;

### External localisations

#### Koodisto

Koodisto service is used to fetch language translations. To update translations run:

```sh
cd scripts
./koodisto_langs.sh
```

The above script fetches language codes from the Koodisto service and transforms them into localization files. The created localization files are stored in git.
