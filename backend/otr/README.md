# OTR - Oikeustulkkirekisteri

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

Set `OTR_UNSECURE=true` environment variable as shown [here](#development).

&nbsp;

### Styling

[Prettier Java](https://github.com/HubSpot/prettier-maven-plugin) is used as a code formatter.  It enforces a consistent style by parsing your code and re-printing it with its own rules. 

To reformat all Java files, run:

```sh
mvn validate
```

CI/CD validates that the files are formatted properly (maven profile `travis`).

&nbsp;

#### Organizing imports

If you are using an IDE such as IntelliJ, you might want to configure it to organize imports.

For IntelliJ, you can use the following configurations:

`ìmport *` is disabled:
Code Style -> Java -> Imports:

```text
Class count to use import with '*': 999
Names count to use static import with '*': 999
```

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

### Styling

In order to keep code clean and easily maintainable please use the following VS Code Extensions.

- [prettier]
- [eslint]
- [stylelint]

  To use the above-mentioned plugins properly, use [these](https://wiki.eduuni.fi/display/OPHPALV/Yhteiset+VSCode+asetukset) VSCode settings.

To reformat all frontend files, run:

```sh
npm run lint
```

## Documentation

### Health check and overall information

Health check:

> <http://localhost:8080/otr/api/actuator/health>

General information about the running application:

> <http://localhost:8080/otr/api/actuator/info>

### OpenAPI

> <http://localhost:8080/otr/api/api-docs>

### Swagger

> <http://localhost:8080/otr/api/swagger-ui.html>

In order to make requests work in swagger UI, the application needs to be run with parameter:

```sh
mvn spring-boot:run -Dtomcat.util.http.parser.HttpParser.requestTargetAllow=|{}
```

[prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
[eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[stylelint]: https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint
