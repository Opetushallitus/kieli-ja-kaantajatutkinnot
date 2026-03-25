#!/usr/bin/env bash

cd "$KIOS/frontend/packages/yki/public" || {
    echo "could not find frontend/packages/yki/public" >&2
    exit 1
}

set -x
echo "USE_MSW=true" > .env 
yarn yki:start:msw
