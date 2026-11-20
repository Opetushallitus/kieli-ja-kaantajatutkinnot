#!/usr/bin/env bash

cd "$KIOS/frontend/packages/yki/clerk" || {
    echo "could not find frontend/packages/yki/clerk" >&2
    exit 1
}

echo "Make sure you are running frontend with:"
echo -e "\tcd frontend/packages/yki/clerk && yarn yki:clerk:start:ci"

echo "yarn yki:clerk:test:cypress"

set -x
yarn yki:clerk:test:cypress
