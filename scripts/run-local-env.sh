#!/usr/bin/env bash

if ! command -v tmux &>/dev/null; then
  echo "tmux is not installed" >&2
  exit 1
fi

if ! command -v tmuxinator &>/dev/null; then
  echo "tmuxinator is not installed" >&2
  exit 1
fi

tmuxinator start -p $(dirname "${BASH_SOURCE[0]}")/kios-tmux.yml