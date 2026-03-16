#!/usr/bin/env bash

cd "$KIOS/frontend/packages/yki/clerk" || {
    echo "could not find frontend/packages/yki/clerk" >&2
    exit 1
}

echo "yarn yki:clerk:test:cypress"

set -x
npx cypress open
