#!/usr/bin/env bash

cd "$KIOS/backend/yki/db" || {
    echo "could find backend/yki/db" >&2
    exit 1
}

# open Docker Desktop on Mac to ensure Docker daemon is running
# on linux you can use your favorite service manager to run docker daemon
KERNEL="$(uname -s)"
if [[ $KERNEL == "Darwin" ]]; then
    echo "Opening Docker Desktop to ensure daemon is running"
    open -a "Docker" --background
    sleep 5
fi

set -x

# start (and try running) posgres/database
docker build -t postgres-yki-init .
docker run --name postgres-yki -p 5432:5432 -d postgres-yki-init
docker start "$(docker ps -a | grep "postgres-yki" | awk '{ print $1 }')"
docker ps -a

