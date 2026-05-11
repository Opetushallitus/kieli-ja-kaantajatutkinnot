#!/usr/bin/env bash

(
    cd "$KIOS" || {
        echo "could navigate to \$KIOS - folder." >&2
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

    echo "Initializing the backend"
    docker-compose -f docker-compose-yki.yml up -d yki-postgres
    docker ps -a
)

