# Kieli- ja kääntäjätutkinnot

[![AKR](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/akr.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/akr.yml) [![OTR](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/otr.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/otr.yml) [![VKT](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/vkt.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/vkt.yml) [![Shared Frontend](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/shared_frontend.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/shared_frontend.yml)

This mono-repo contains the language and translator services of the Finnish National Agency for Education.

## Technologies

- Maven 3.1+
- JDK 17
- PostgreSQL 12.9
- node v16.16.0
- yarn 3.2.0 (to enable it, run the following command: `corepack enable`)

&nbsp;

## Services

Below are listed the OPH services which are a part of this mono-repo.

- [AKR](./docs/akr.md)
- [OTR](./docs/otr.md)
- [VKT](./docs/vkt.md)

In addition, the shared frontend content can be found [here](./docs/shared_frontend.md).

&nbsp;

## Development

Create and start database, backend, and frontend containers for a specific application:

```sh
docker-compose -f <service-docker-compose-file-name.yml> up
```

Or

Start up a certain service of an application:

```sh
docker-compose up frontend | backend | postgres
```

To disable default Spring Security configurations, create the following environment variable and restart the containers:

```sh
export AKR_UNSECURE=true
docker-compose -f <service-docker-compose-file-name.yml> up
```

In case of errors, clean cache and recreate volumes:

```sh
docker-compose -f <service-docker-compose-file-name.yml> down
docker-compose -f <service-docker-compose-file-name.yml> up --build --force-recreate --renew-anon-volumes
```

After starting the services, the frontend runs on > <http://localhost:4000>

&nbsp;

## Deployment

Deployments are created automatically when a new push is done into `dev` branch. To create a new deployment from other branches use `[deploy]` in the commit messages.

```sh

For example:

AKR(Frontend): Added new translations [deploy]
```

&nbsp;

## Frontend conventions

### Visual Studio Code

The project uses the shared workspace configs. In order to keep code clean and easily maintainable please use the following VS Code Extensions.

- [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [sort-json](https://marketplace.visualstudio.com/items?itemName=richie5um2.vscode-sort-json)

To reformat all frontend files, run:

```sh
npm run <project-name>:lint
```

&nbsp;

## Backend conventions

### Styling

[Prettier Java](https://github.com/HubSpot/prettier-maven-plugin) is used as a code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules.

To reformat all Java files in a project, run:

```sh
mvn validate
```

CI/CD validates that the files are formatted properly.

&nbsp;

### Organizing imports

If you are using an IDE such as IntelliJ, you might want to configure it to organize imports.

For IntelliJ, you can use the following configurations:

`ìmport *` is disabled:
Code Style -> Java -> Imports:

```text
Class count to use import with '*': 999
Names count to use static import with '*': 999
```

&nbsp;

## Git conventions

### Commit message conventions

To create a useful revision history the guidelines of [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) are broadly followed.

A commit message should be structured as follows:

```sh

service(scope): <description>

service:     AKR, VKT, OTR, YKI, and SHARED
scope:       Frontend, Backend, Docs, Infra
description: Informal description

For example:

AKR(Frontend): Added new translations
```

### Branching naming conventions

Jira ticket numbers are used as branch names without any extra suffixes.

Used prefixes are `feature`, `hotfix`, and `release`. Below are some examples.

```sh
feature/<ticket-number>         ---->   feature/OPHAKRKEH-250
hotfix/<service-name>           ---->   hotfix/akr
release/<service-name/<date>    ---->   release/akr/2022-04-12
```
