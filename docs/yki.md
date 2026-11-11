# YKI - Yleiset kielitutkinnot [![YKI](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/yki.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/yki.yml)

## Frontend

### Build and Run

#### With local backend

```sh
yarn install
yarn yki:start  # Starts Webpack DevServer
```

and the app runs on > <http://localhost:4003/yki/ilmoittautuminen>.

See <https://github.com/Opetushallitus/yki> for details on running the backend.

#### With local proxy

First start the proxy server under `frontend/packages/yki` as
````sh
node proxy.ts
````
Then build and run yki as
```sh
yarn install
yarn yki:start:dev-server  # Starts Webpack DevServer
```

and the app runs on > <http://localhost:4003/yki/ilmoittautuminen>.

### Running tests

End-to-end tests:

```sh
yarn yki:test:cypress
```

Unit and Integration tests

```sh
yarn yki:test:jest
yarn yki:test:jest -- -u  # Regenerate snapshots
```

## Backend

### Email debug API

Saved emails can be viewed in the browser for checking email templates locally. The API exists
only when the backend runs with the `dev` profile:

```sh
cd backend/yki && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Without the profile, the endpoints return 404. They are under `/v2/api/clerk/**`, so log in to
the clerk UI as an admin user first in the same browser.

| Endpoint                                                       | Description                                                                                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| <http://localhost:8083/yki/v2/api/clerk/email-debug>           | The newest 200 emails, newest first: id, created, type, recipient, subject, sent time and error. Each id links to the email's body. |
| `http://localhost:8083/yki/v2/api/clerk/email-debug/{emailId}` | The body of one email rendered as HTML.                                                                                             |

Emails are saved to the `email` table even when sending is disabled (`email.sending-enabled`
defaults to `false`), so emails sent locally, such as registration payment emails, show up in the
list.

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
