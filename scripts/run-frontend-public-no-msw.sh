#!/usr/bin/env bash

printf "Backend should be running. Start it with:\n"
printf "  cd backend/yki && ./mvnw spring-boot:run\n"
printf "  or run fi.oph.yki.YkiApplication in IntelliJ debugger\n\n"

cd "$KIOS/frontend/packages/yki/public" || {
    echo "could not find frontend/packages/yki/public" >&2
    exit 1
}

set -x
echo 'USE_MSW=false' > .env
yarn yki:start:dev-server

