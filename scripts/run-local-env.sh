#!/usr/bin/env bash

if ! command -v tmux &>/dev/null; then
  echo "tmux is not installed" >&2
  exit 1
fi

if ! command -v tmuxinator &>/dev/null; then
  echo "tmuxinator is not installed" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

KIOS="$(cd "$SCRIPT_DIR/.." && pwd)" tmuxinator start -p "$SCRIPT_DIR/kios-tmux.yml"