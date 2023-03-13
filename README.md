# Kieli- ja kääntäjätutkinnot

[![AKR](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/akr.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/akr.yml)
[![OTR](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/otr.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/otr.yml)
[![VKT](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/vkt.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/vkt.yml)
[![YKI](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/yki.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/yki.yml)
[![Shared Frontend](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/shared_frontend.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/shared_frontend.yml)

This mono-repo contains the language and translator services of the Finnish National Agency for Education.

## Technologies

- Maven 3.1+
- JDK 17
- PostgreSQL 14.7
- node v16.16.0
- yarn 3.2.2 (to enable it, run the following command: `corepack enable`)

&nbsp;

## Services

Below are listed the OPH services which are a part of this mono-repo.

- [AKR](./docs/akr.md)
- [OTR](./docs/otr.md)
- [VKT](./docs/vkt.md)
- [YKI](./docs/yki.md)

In addition, the shared frontend content can be found [here](./docs/shared_frontend.md).

&nbsp;

## Development setup initialisation with Docker

1. Download Docker Desktop
2. Build containers for a specific app
```sh
docker-compose -f docker-compose-<app>.yml build
```
3. Run mvn install for the backend: `cd backend/<app>; ./mwnw install`
4. Run the app with docker-compose
```sh
docker-compose -f docker-compose-<app>.yml up
```

In order to connect the database from terminal, download a PostgreSQL client (14.x). For example with OSX with Homebrew:
```sh
brew install postgresql@14
```

Or use PostgresSQL client inside docker:
```sh
docker exec -ti <app>-postgres psql -U postgres -d <app>-postgres
```

## Development

Create and start database, backend, and frontend containers for a specific application:

```sh
docker-compose -f docker-compose-<app>.yml up
```

Or

Start up a certain service of an application:

```sh
docker-compose up frontend | backend | postgres
```

To disable default Spring Security configurations, create the following environment variable and restart the containers:

```sh
export AKR_UNSECURE=true
docker-compose -f docker-compose-<app>.yml up
```

In case of errors, clean cache and recreate volumes:

```sh
docker-compose -f docker-compose-<app>.yml down
docker-compose -f docker-compose-<app>.yml up --build --force-recreate --renew-anon-volumes
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

To reformat all frontend files for a certain application, run:

```sh
yarn <app>:format:write
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

Jira ticket numbers are used as branch names with possible suffix indicating what the branch is for.

Used prefixes are `feature`, and `hotfix`. Below are some examples.

```sh
feature/<ticket-number>         ---->   feature/OPHAKRKEH-250
hotfix/<service-name>           ---->   hotfix/akr
```

### Releases

Production releases for different applications are marked with tags. For example for AKR, tags are named as `AKR-ga-1234` where `ga-1234` stands for the Github Action workflow number. The name of the tag also matches the name of the release in Jira.

In order to create a new release for example for AKR, check the commit ID of the build to be released, hard reset your local repository to that commit, create tag
```sh
git tag AKR-ga-1234
```
and push the tag to remote repository
```sh
git push origin AKR-ga-1234
```
