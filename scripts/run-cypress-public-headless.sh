#!/usr/bin/env bash
# Runs the public Cypress tests headless with the same commands as
# .github/workflows/yki-public-frontend.yml ("Run Cypress Tests").

PORT=4003

# TODO: Decide should KIOS default to the repo root when it is not set?
#   Saw: the other run-*.sh scripts need KIOS, which only run-local-env.sh sets (run-local-env.sh:24).
#   Did: default to the repo root, so the script also runs outside tmux. Other: require KIOS like the others.
#   Settled by: the user.
KIOS="${KIOS:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

cd "$KIOS/frontend" || {
    echo "could not find frontend" >&2
    exit 1
}

if lsof -ti:"$PORT" -sTCP:LISTEN >/dev/null; then
    echo "Port $PORT is in use. Stop the frontend that runs on it (e.g. scripts/run-frontend-public.sh) and try again." >&2
    exit 1
fi

export TZ=Europe/Helsinki

trap 'lsof -ti:"$PORT" -sTCP:LISTEN | xargs -r kill' EXIT

set -x
yarn yki:start:ci &
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
yarn yki:test:cypress
