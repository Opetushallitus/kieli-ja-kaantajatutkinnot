#!/usr/bin/env bash
set -euo pipefail

WAIT_UNTIL=3
GRACEFUL_STOP=false
for arg in "$@"; do
  case $arg in
    --gracefully=*)
      GRACEFUL_STOP=true
      WAIT_UNTIL="${arg#*=}"
      if ! [[ "$WAIT_UNTIL" =~ ^[1-9]+$ ]]; then
        echo "The format is '--gracefully={number 1-9 represent seconds} '" 1>&2
        exit 1
      fi
      ;;
  esac
done

# Check if the script is running inside a tmux session
if [[ -z "$TMUX" ]]; then
  echo "Script not running inside a tmux session" >&2
  exit 1
fi

# Iterate over current session windows and panes
tmux list-windows -F '#{window_index}' | while read -r window; do
  tmux list-panes -t "$window" -F '#{pane_index}' | while read -r pane; do
    tmux send-keys -t "$window.$pane" C-c
  done
done

if $GRACEFUL_STOP; then
  echo "Waiting $WAIT_UNTIL seconds before killing the session"
  sleep "$WAIT_UNTIL"
fi

tmux kill-session
