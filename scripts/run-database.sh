#!/usr/bin/env bash

# cd "$YKI" || { echo "could find '\$YKI'."; exit 1 }
cd "$KIOS/backend/yki/db" || {
    echo "could find backend/yki/db"
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

# start (and try running) posgres/database
docker run --name postgres-yki -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -p 5432:5432 -d postgres:latest

### add data
#psql -h localhost -p 5432 -U admin -d yki < *.sql

echo "when creating new db, run:" 
printf "\tpsql -h localhost -U admin -c 'create database yki'\n\n"

# start db
docker start "$(docker ps -a | grep "postgres-yki" | awk '{ print $1 }')"

# ensure running
docker ps -a