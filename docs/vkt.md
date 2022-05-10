# VKT - Valtionhallinnon kielitutkinnot [![VKT](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/vkt.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/vkt.yml)

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

Set `VKT_UNSECURE=true` environment variable as shown [here](#development).

&nbsp;

## Frontend

### Build and Run

```sh
npm install
npm run start  # Starts Webpack DevServer
```

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

> <http://localhost:8080/vkt/api/actuator/health>

General information about the running application:

> <http://localhost:8080/vkt/api/actuator/info>

### OpenAPI

> <http://localhost:8080/vkt/api/api-docs>

### Swagger

> <http://localhost:8080/vkt/api/swagger-ui.html>

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

[prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
[eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[stylelint]: https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint
