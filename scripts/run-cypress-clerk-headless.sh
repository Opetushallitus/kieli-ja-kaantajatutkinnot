#!/usr/bin/env bash
# Runs the clerk Cypress tests headless with the same commands as
# .github/workflows/yki-clerk-frontend.yml ("Run Cypress Tests").

PORT=4004

# TODO: Decide — same question as KIOS in run-cypress-public-headless.sh.
KIOS="${KIOS:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

cd "$KIOS/frontend" || {
    echo "could not find frontend" >&2
    exit 1
}

if lsof -ti:"$PORT" -sTCP:LISTEN >/dev/null; then
    echo "Port $PORT is in use. Stop the frontend that runs on it (e.g. scripts/run-frontend-clerk.sh) and try again." >&2
    exit 1
fi

export TZ=Europe/Helsinki

trap 'lsof -ti:"$PORT" -sTCP:LISTEN | xargs -r kill' EXIT

set -x
yarn yki:clerk:start:ci &
set +x

for _ in $(seq 1 60); do
    curl -s -o /dev/null "http://localhost:$PORT" && break
    sleep 1
done
curl -s -o /dev/null "http://localhost:$PORT" || {
    echo "http://localhost:$PORT did not answer in 60 seconds" >&2
    exit 1
}

set -x
yarn yki:clerk:test:cypress
