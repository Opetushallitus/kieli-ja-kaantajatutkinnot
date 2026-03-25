#!/usr/bin/env bash

if ! command -v tmux &>/dev/null; then
  echo "tmux is not installed" >&2
  exit 1
fi

if ! command -v tmuxinator &>/dev/null; then
  echo "tmuxinator is not installed" >&2
  exit 1
fi

USE_MSW=true

for arg in "$@"; do
  case "$arg" in
    --no-msw) USE_MSW=false ;;
    *) echo "Unknown flag: $arg" >&2; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

KIOS="$(cd "$SCRIPT_DIR/.." && pwd)" USE_MSW="$USE_MSW" tmuxinator start -p "$SCRIPT_DIR/kios-tmux.yml"