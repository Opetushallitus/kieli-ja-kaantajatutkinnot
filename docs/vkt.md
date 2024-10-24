# VKT - Valtionhallinnon kielitutkinnot [![VKT](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/vkt.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/vkt.yml)

## Backend

### Setup localstack

See [localstack/README.md](../localstack/README.md).

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

and the app runs on > <http://localhost:8082>

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

Set `VKT_UNSECURE=true` environment variable as shown [here](../README.md#development).

## Frontend

### Build and Run

```sh
yarn install
yarn vkt:start  # Starts Webpack DevServer
```

and the app runs on > <http://localhost:4002/vkt/etusivu>

### Running tests

End-to-end tests:

```sh
yarn vkt:test:cypress
```

Unit and Integration tests

```sh
yarn vkt:test:jest
yarn vkt:test:jest -- -u  # Regenerate snapshots
```

## Documentation

### Health check and overall information

Health check:

> <http://localhost:8082/vkt/api/actuator/health>

General information about the running application:

> <http://localhost:8082/vkt/api/actuator/info>

### OpenAPI

> <http://localhost:8082/vkt/api/api-docs>

### Swagger

> <http://localhost:8082/vkt/api/swagger-ui.html>

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
npx i18n-json-to-xlsx-converter --convert public/i18n/fi-FI/public.json
```

#### XLSX to JSON

```sh
npx i18n-json-to-xlsx-converter --convert public.xlsx
```
