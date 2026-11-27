#!/usr/bin/env bash
# Creates a Docker Sandboxes (sbx) sandbox for this repository: the built-in claude agent plus
# the kit in this folder (sbx.yaml). sbx builds the kit on first use. Then it stores the two
# GitHub tokens for this sandbox only.
# The script does not attach. At the end it prints the next steps.
# Sandbox name: the repository folder name, with no agent prefix. With the usual folder name:
# kieli-ja-kaantajatutkinnot
#
# After a kit change: sbx rm <sandbox name>, then run this again.
# Needs: sbx installed, `sbx login` done, Docker with buildx.
# Usage and options: run with --help.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
NAME="$(basename "$REPO")"

# The usage message does not repeat the arguments, so a mistyped one does not print a token.
USAGE="Usage: $0 [GITHUB_REGISTRY_TOKEN=<token>] [GH_TOKEN=<token>]"
REGISTRY_TOKEN=""
# Not GH_TOKEN: when the shell exports GH_TOKEN, a value set here would also reach sbx.
READ_TOKEN=""
if [ $# -gt 2 ]; then
  echo "$USAGE" >&2
  echo "More: $0 --help" >&2
  exit 1
fi
for ARG in "$@"; do
  case "$ARG" in
    "") ;;
    -h | --help)
      cat <<EOF
$USAGE

Creates a Docker Sandboxes (sbx) sandbox for this repository: the built-in claude agent
with the kit in sbx/. The sandbox name is $NAME.
Then it stores two GitHub tokens in sbx, for this sandbox only: other sandboxes on this
machine cannot use them.
The script does not attach. At the end it prints the next steps.

Options:
  GITHUB_REGISTRY_TOKEN=<token>  The GitHub token for the @opetushallitus npm packages
                                 (read:packages is enough). Without this option, the
                                 script asks for it.
  GH_TOKEN=<token>               The GitHub token for gh in the sandbox (sbx's github
                                 service). Use a fine-grained token with Repository
                                 access "Public repositories (read-only)".
                                 Steps: README.md, AI tools. Without this option, the
                                 script asks for it.
  -h, --help                     Print this help.

Examples
  sbx/sbx-setup.sh GITHUB_REGISTRY_TOKEN="\$GITHUB_REGISTRY_TOKEN"

After a kit change: sbx rm $NAME, then run this again.
Needs: sbx installed, 'sbx login' done, Docker with buildx.
EOF
      exit 0
      ;;
    GITHUB_REGISTRY_TOKEN=?*) REGISTRY_TOKEN="${ARG#GITHUB_REGISTRY_TOKEN=}" ;;
    GH_TOKEN=?*) READ_TOKEN="${ARG#GH_TOKEN=}" ;;
    *)
      echo "$USAGE" >&2
      echo "More: $0 --help" >&2
      exit 1
      ;;
  esac
done

# --clone and --kit only apply when the sandbox is created. On an existing sandbox they are ignored.
if sbx inspect "$NAME" >/dev/null 2>&1; then
  echo "Sandbox $NAME already exists. Attach: sbx run --name $NAME" >&2
  echo "After a kit change, remove it first: sbx rm $NAME" >&2
  exit 1
fi

# sbx builds the kit with the host's docker buildx, as an OCI image. Docker's default builder (the
# docker driver) cannot export that (docs.docker.com/build/exporters/oci-docker/), so the kit is
# built on a docker-container builder of its own. Other builds on the host do not use it.
# Not SBX_KIT_BUILDER=sandbox (sbx builds the kit in a sandbox of its own): not documented yet.
BUILDER=sbx-kits
if ! docker buildx inspect "$BUILDER" >/dev/null 2>&1; then
  echo "Creating the docker-container builder $BUILDER for the kit build."
  docker buildx create --name "$BUILDER" --driver docker-container --bootstrap
fi

BUILDX_BUILDER="$BUILDER" sbx create --clone --name "$NAME" --kit "$REPO/sbx" claude "$REPO"

# The tokens are stored after sbx create, because --sandbox needs the sandbox. They are for this
# sandbox only: a global secret "is available to all sandboxes"
# (docs.docker.com/ai/sandboxes/configuration/credentials/), also ones made for other work.
# The sandbox sees only a placeholder.

# The GitHub token for the @opetushallitus npm packages (sbx.yaml, the credential entry).
if [ -n "$REGISTRY_TOKEN" ]; then
  # Through stdin, so sbx's arguments do not carry the token (sbx secret set --help).
  # --force: the argument replaces a stored token without asking.
  printf '%s' "$REGISTRY_TOKEN" | sbx secret set --force --sandbox "$NAME" oph-github-packages
elif [ -z "$(sbx secret ls --sandbox "$NAME" --service oph-github-packages -q)" ]; then
  echo "sbx needs your GitHub token for the @opetushallitus npm packages."
  echo "It is the token you have in GITHUB_REGISTRY_TOKEN (frontend/.yarnrc.yml). It needs read:packages only."
  echo "sbx stores it under the name oph-github-packages, for sandbox $NAME only."
  sbx secret set --sandbox "$NAME" oph-github-packages
fi

# The GitHub token for gh in the sandbox, in sbx's built-in github service. A fine-grained token
# with Repository access "Public repositories (read-only)" (README.md, AI tools): Claude reads
# GitHub, and the developer pushes from the host. sbx sends this service's token to api.github.com,
# github.com and other GitHub hosts; that is why sbx.yaml keeps the packages token out of it.
# A sandbox secret takes precedence over a global github secret the developer has for other work.
if [ -n "$READ_TOKEN" ]; then
  printf '%s' "$READ_TOKEN" | sbx secret set --force --sandbox "$NAME" github
elif [ -z "$(sbx secret ls --sandbox "$NAME" --service github -q)" ]; then
  echo "sbx needs a GitHub token for gh in the sandbox. Do not use your normal token: it can write."
  echo "Create a fine-grained token with Repository access \"Public repositories (read-only)\":"
  echo "  https://github.com/settings/personal-access-tokens/new"
  echo "Steps: README.md, AI tools. sbx stores it under the name github, for sandbox $NAME only."
  sbx secret set --sandbox "$NAME" github
fi

# Next steps. The alias is a suggestion; each developer adds it to their own shell config.
cat <<EOF
Created sandbox $NAME.

Run claude:
  sbx run --name $NAME

Open terminal inside the sandbox:
  sbx exec -it $NAME bash

Consider to add to your .zshrc, .bashrc, etc:
  alias claude='sbx run --name "\$(basename "\$PWD")" --'

EOF

