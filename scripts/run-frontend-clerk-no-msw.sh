#!/usr/bin/env bash

printf "Backend should be running. Start it with:\n"
printf "  cd backend/yki && ./mvnw spring-boot:run\n"
printf "  or run fi.oph.yki.YkiApplication in IntelliJ debugger\n\n"

cd "$KIOS/frontend/packages/yki/clerk" || {
    echo "could not find frontend/packages/yki/clerk" >&2
    exit 1
}

echo 'USE_MSW=false' > .env
yarn yki:clerk:start
