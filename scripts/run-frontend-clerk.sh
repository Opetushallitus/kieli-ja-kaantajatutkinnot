#!/usr/bin/env bash

cd "$KIOS/frontend/packages/yki/clerk" || {
    echo "could not find frontend/packages/yki/clerk" >&2
    exit 1
}

echo "yarn run yki:start:dev-server"
set -x
echo "USE_MSW=true" > .env 
yarn yki:clerk:start:msw
