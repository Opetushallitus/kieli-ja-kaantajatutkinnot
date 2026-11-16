#!/usr/bin/env bash

cd "$KIOS/frontend/packages/yki/public" || {
    echo "could not find frontend/packages/yki/public" >&2
    exit 1
}

echo "Make sure you are running frontend with:"
echo -e "\tcd frontend/packages/yki/public && yarn yki:start:ci"

echo "yarn yki:test:cypress"

set -x
yarn yki:test:cypress
