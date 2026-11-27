# Docker Sandboxes (sbx)

This folder sets up a Docker Sandboxes sandbox for this repository. Claude runs in the sandbox.
The developer's editor runs on the host.

- `sbx.yaml`: the kit (v3 mixin). Network hosts, the Linux libraries Cypress needs, the GitHub
  token for the `@opetushallitus` packages, and git over HTTPS for GitHub (`origin` is an SSH URL,
  and port 22 is closed).
- `sbx.dockerfile`: the kit's content. JDK 21 and Node.
- `sbx-setup.sh`: creates a sandbox for this repository, with the built-in `claude` agent and this kit.
  It does not attach; it prints the next steps. The sandbox name is the repository folder name, with no agent prefix.
  After `sbx create`, it stores two GitHub tokens for this sandbox only (`sbx secret set --sandbox`).
  `sbx-setup.sh GITHUB_REGISTRY_TOKEN=<token> GH_TOKEN=<token>` stores the tokens without asking.
  `GH_TOKEN` is the token for `gh` in the sandbox, in sbx's built-in `github` service: a fine-grained
  token with Repository access "Public repositories (read-only)" (README.md, AI tools).
  sbx builds the kit with the host's docker buildx. The script creates a docker-container builder,
  `sbx-kits`, for it: Docker's default builder cannot export the kit image.

## Documentation

- Docker Sandboxes: https://docs.docker.com/ai/sandboxes/
- Kit format v3: https://github.com/docker/sandbox-kit-spec/blob/main/docs/spec/SPEC-v3.md
- The installed CLI: `sbx <command> --help`. Kits are experimental. When the docs and `--help`
  disagree, `--help` describes the installed version.

Read these before answering a question about sbx. Do not answer from memory.

## Editors and personal setup

Each developer sets up their own editor. The team does not share one. When a developer asks for help:

- The editor stays on the host and opens the repository folder. Nothing editor-related goes in this folder.
- `sbx-setup.sh` uses clone mode: Claude works on its own clone inside the sandbox. The editor does
  not see Claude's changes until the developer fetches them: `git fetch sandbox-<sandbox name>`.
- Personal tools for the sandbox go in the developer's own kit, outside this repository. Add it with
  another `--kit` when creating the sandbox, or with `sbx kit add <sandbox> <kit>` on an existing one.

## Rules

- The built-in `claude` agent is a v3 kit and takes only v3 mixins. `spec.yaml` is the v2 format; do not use it.
- A kit applies when the sandbox is created. After a change: `sbx rm <sandbox>`, then create it again.
  Ask the developer first: `sbx rm` deletes everything in the sandbox.
- Tokens: a `credential@1` entry with `proxyManaged: true`, as in `sbx.yaml`. The sandbox then sees only a
  placeholder. Do not pass a token with `sbx create -e` or `--env-file`: the real value is then readable
  inside the sandbox.
- Store tokens for one sandbox (`sbx secret set --sandbox <sandbox>`), not globally. A global secret is
  available to every sandbox on the machine, also ones a developer makes for other work.
- The `gh` token is not a kit entry. It is in sbx's built-in `github` service, which sends it to all
  GitHub hosts, so only a read-only token goes there.

## Checking a change

- Kit format and content, without sbx, built the way `sbx create` builds it, from the repository root:
  `docker buildx build --builder sbx-kits -f sbx/sbx.yaml --output type=oci,dest=/dev/null sbx`
  A build on Docker's default builder (`--output type=cacheonly`) can pass where `sbx create` fails.
- Refused network requests: `sbx policy log <sandbox>`
- Install hook output: `sbx -D create ...`, or `/var/log/sbx-kits/<kit>/install-<n>.log` inside the sandbox.
