# Kieli- ja kääntäjätutkinnot

This mono-repo contains the language and translator services of the Finnish National Agency for Education.

## Technologies

- Maven 3.1+
- JDK 17
- PostgreSQL 12.9
- node v16.14.2
- yarn 3.2.0 (to enable it, run the following command: `corepack enable`)

## Services

Below are listed the OPH services which are a part of this mono-repo. Every service has its own readme as well.

- [AKT](./backend/akt/README.md)

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
export AKT_UNSECURE=true
docker-compose -f <service-docker-compose-file-name.yml> up
```

In case of errors, clean cache and recreate volumes:

```sh
docker-compose -f <service-docker-compose-file-name.yml> down
docker-compose -f <service-docker-compose-file-name.yml> up --build --force-recreate --renew-anon-volumes
```

After starting the services, the frontend runs on > <http://localhost:4000>

### Visual Studio Code

The project uses shared workspace config. Install the following vscode plugins:

- [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [sort-json](https://marketplace.visualstudio.com/items?itemName=richie5um2.vscode-sort-json)

## Commit message conventions

To create a useful revision history the guidelines of [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) are broadly followed.

A commit message should be structured as follows:

```sh

<service>[scope]: <description>

service:     AKT, VKT, OTR, YKI, and SHARED
scope:       Frontend, Backend
description: Informal description
```

## Branching naming conventions

Jira ticket numbers are used as branch names without any extra suffixes.

Used prefixes are `feature`, `hotfix`, and `release`. Below are some examples.

```sh
feature/<ticket-number>         ---->   feature/OPHAKTKEH-250
hotfix/<service-name>           ---->   hotfix/akt
release/<service-name/<date>    ---->   release/akt/20220412
```
