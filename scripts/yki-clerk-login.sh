#!/usr/bin/env bash

# Logs in to the local yki backend as a clerk through untuva CAS and writes a cookie jar
# (SESSION + CSRF) for curl calls to /yki/v2/api/clerk/** endpoints.
#
# Usage: CAS_USERNAME=... CAS_PASSWORD=... scripts/yki-clerk-login.sh
# The user needs the APP_YKI_YLLAPITAJA role for /v2/api/clerk/**.

set -euo pipefail

if [[ -z "${CAS_USERNAME:-}" ]]; then
    read -r -p "CAS username: " CAS_USERNAME
fi
if [[ -z "${CAS_PASSWORD:-}" ]]; then
    read -r -s -p "CAS password: " CAS_PASSWORD
    echo
fi

# Password goes through stdin, so it is not visible in the process list.
TGT=$(printf '%s' "$CAS_PASSWORD" |
    curl -s -X POST \
        --data-urlencode "username=$CAS_USERNAME" \
        --data-urlencode "password@-" \
        "https://virkailija.untuvaopintopolku.fi/cas/v1/tickets" |
    sed -n 's/.*TGT-\([a-zA-Z0-9-]*\).*/\1/p')
if [[ -z "$TGT" ]]; then
    echo "Failed to obtain Ticket Granting Ticket (TGT)" >&2
    exit 1
fi

ST=$(curl -s -X POST \
    --data-urlencode "service=http://localhost:8083/yki/v2/virkailija/login/cas" \
    "https://virkailija.untuvaopintopolku.fi/cas/v1/tickets/TGT-$TGT" \
    | tr -d '\n')

if [[ -z "$ST" ]]; then
    echo "Failed to obtain Service Ticket (ST)" >&2
    exit 1
fi

DATA_DIR="$(dirname "${BASH_SOURCE[0]}")/data"
rm -rf "$DATA_DIR"
mkdir "$DATA_DIR"

COOKIE_JAR="$DATA_DIR/cookies.txt"
CSRF_HEADER="$DATA_DIR/headers.txt"

curl -s -o /dev/null -c "$COOKIE_JAR" "http://localhost:8083/yki/v2/virkailija/login/cas?ticket=$ST"

# The session cookie is SESSION, not JSESSIONID: the backend uses spring-session-jdbc.
SESSION=$(awk '$6 == "SESSION" { print $7 }' "$COOKIE_JAR")
if [[ -z "$SESSION" ]]; then
    echo "Login failed: no SESSION cookie from http://localhost:8083/yki/v2/virkailija/login/cas." >&2
    echo "Is the backend running?" >&2
    exit 1
fi

# The backend sets the CSRF cookie in the login response; POSTs send the same value in the CSRF header.
CSRF=$(awk '$6 == "CSRF" { print $7 }' "$COOKIE_JAR")
if [[ -z "$CSRF" ]]; then
    echo "Login failed: no CSRF cookie from http://localhost:8083/yki/v2/virkailija/login/cas" >&2
    exit 1
fi

printf 'CSRF: %s\n' "$CSRF" >"$CSRF_HEADER"

USER_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIE_JAR" \
    "http://localhost:8083/yki/v2/auth/user")
if [[ "$USER_STATUS" != "200" ]]; then
    echo "Logged in, but GET http://localhost:8083/yki/v2/auth/user returned $USER_STATUS." >&2
    echo "Check the user's roles." >&2
    exit 1
fi

cat <<EOF
Logged in. Cookie jar: $COOKIE_JAR

Try these for example:
    curl -b "$COOKIE_JAR" -H @$CSRF_HEADER -i http://localhost:8083/yki/v2/api/clerk/examDate/all    
    curl -b "$COOKIE_JAR" -H @$CSRF_HEADER -i http://localhost:8083/yki/v2/api/clerk/organizer
    curl -b "$COOKIE_JAR" -H @$CSRF_HEADER -i http://localhost:8083/yki/v2/api/clerk/paymentReport

EOF
